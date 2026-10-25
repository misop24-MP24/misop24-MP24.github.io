// 毛筆の円相を、1ピクセルずつ「墨の濃さ」を計算して描きます。
// 毛の筋、かすれ、紙の目、にじみ、墨の縁の濃さを再現しています。
// 同じ seed なら、いつも同じ筆跡になります。

function rng(seed: number) {
  let a = Math.floor(seed * 9973 + 17) | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 2次元のなめらかなノイズ(0〜1)
function makeNoise(seed: number) {
  const r = rng(seed);
  const P = new Uint8Array(512);
  const perm = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  for (let i = 0; i < 512; i++) P[i] = perm[i & 255];
  const V = Float32Array.from({ length: 256 }, () => r());
  return (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const X = xi & 255;
    const Y = yi & 255;
    const a = V[P[P[X] + Y]];
    const b = V[P[P[X + 1] + Y]];
    const c = V[P[P[X] + Y + 1]];
    const d = V[P[P[X + 1] + Y + 1]];
    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
}

const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const smooth = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

// 筆の通り道。描画(計算)と、描き進みの表示の両方で使います
export function ensoParams(seed = 3) {
  const rand = rng(seed);

  // ── 筆の通り道(200単位の座標) ──
  const C = 100;
  const R = 73 + rand() * 3;
  const start = (-118 + rand() * 16) * (Math.PI / 180);
  const sweep = (322 + rand() * 14) * (Math.PI / 180);
  const drift = 6 + rand() * 3;
  const wmax = 21 + rand() * 3;
  const ph1 = rand() * 6.28;
  const ph2 = rand() * 6.28;

  const radiusAt = (t: number) => R + drift * t + 1.5 * Math.sin(t * 6 + ph2) + 0.6 * Math.sin(t * 15 + ph1);
  const pressureAt = (t: number) => {
    const rise = Math.min(1, 0.8 + (Math.max(0, t) / 0.04) * 0.2);
    const fall = t < 0.5 ? 1 : Math.max(0.04, 1 - Math.pow((t - 0.5) / 0.5, 1.25) * 0.97);
    return rise * fall * (0.95 + 0.05 * Math.sin(t * 9 + ph1));
  };

  // 筆を置いた点(墨だまり)
  const pr = wmax * 0.56;
  const poolA = start - (pr * 0.18) / R;
  const poolX = C + R * Math.cos(poolA);
  const poolY = C + R * Math.sin(poolA);

  return { C, R, start, sweep, drift, wmax, ph1, ph2, radiusAt, pressureAt, pr, poolX, poolY };
}

// 墨の濃さを1ピクセルずつ計算して、RGBAの配列で返します(画面に触らないので、裏側の処理でも動きます)
export function computeEnso(px: number, rgb: [number, number, number], seed = 3): Uint8ClampedArray {
  const { C, R, start, sweep, drift, wmax, ph1, ph2, radiusAt, pressureAt, pr, poolX, poolY } = ensoParams(seed);
  const n1 = makeNoise(seed * 7 + 1);
  const n2 = makeNoise(seed * 7 + 2);
  const n3 = makeNoise(seed * 7 + 3);
  const data = new Uint8ClampedArray(px * px * 4);
  const k = 200 / px; // 1ピクセルの大きさ(200単位)
  const [cr, cg, cb] = rgb;
  const TWO_PI = Math.PI * 2;
  const inner = R - wmax;
  const outer = R + drift + wmax;

  for (let j = 0; j < px; j++) {
    const y = (j + 0.5) * k;
    for (let i = 0; i < px; i++) {
      const x = (i + 0.5) * k;
      const dx = x - C;
      const dy = y - C;
      const r = Math.sqrt(dx * dx + dy * dy);
      if (r < inner - 4 || r > outer + 4) continue;

      // 紙の目(細かいざらつき)
      const grain = n3(x * 2.4, y * 2.4) * 0.6 + n3(x * 6.1 + 50, y * 6.1) * 0.4;

      let a = Math.atan2(dy, dx) - start;
      a = ((a % TWO_PI) + TWO_PI) % TWO_PI;
      let t = a / sweep;
      if (t > 1 && a > TWO_PI - 0.6) t = (a - TWO_PI) / sweep; // 書き始めより手前

      let alpha = 0;

      // ── 墨だまり ──
      const pdx = x - poolX;
      const pdy = y - poolY;
      const pa = Math.atan2(pdy, pdx);
      const prr = pr * (1 + 0.05 * Math.sin(pa * 2 + ph1) + 0.025 * Math.sin(pa * 5 + ph2) + (n1(x * 0.6, y * 0.6) - 0.5) * 0.04 + (grain - 0.5) * 0.03);
      const pd = Math.sqrt(pdx * pdx + pdy * pdy);
      if (pd < prr + 2.5) {
        const body = 1 - smooth(prr - 0.5, prr + 0.35, pd);
        const rim = 0;
        const wet = (1 - smooth(prr - 0.2, prr + 3, pd)) * 0.08 * (0.4 + grain * 1.1);
        alpha = Math.max(alpha, body * (0.94 + (n2(x * 0.35, y * 0.35) - 0.5) * 0.04), wet);
      }

      if (t >= -0.04 && t <= 1) {
        const tt = clamp(t);
        const p = pressureAt(tt);
        const rc = radiusAt(tt);
        // 抜けるにつれて、毛先がばらけて筋になる
        const spread = wmax * (0.3 + 0.7 * Math.pow(p, 0.6)) * (1 + (1 - p) * 0.25);
        const u = (r - rc) / spread; // 筆の幅の中の位置(-0.5〜0.5)
        const au = Math.abs(u);
        // 縁のがたつき
        const edge = 0.5 + (n1(tt * 11, u > 0 ? 3 : 9) - 0.5) * 0.07 + (n2(tt * 520, u > 0 ? 1 : 5) - 0.5) * 0.025 * (0.4 + smooth(0.3, 1, tt));
        // 筆圧が下がると、端の毛から紙を離れる
        const contact = p * 1.08 - au * 1.15;
        if (au < edge + 0.06 && contact > 0) {
          const bristle = n1(u * 46 + 11, tt * 2.2); // 毛ごとの墨の量
          const streak = n2(u * 130, tt * 3.5);
          // 乾き具合: 後半ほど、外側ほど、墨の少ない毛ほど乾く
          const bk = Math.pow(bristle, 1.6);
          const dry = smooth(0.5, 1.04, tt) * 1.1 + au * 0.4 * smooth(0.35, 0.9, tt) - bk * 0.62 - 0.05;
          const tooth = n3(u * 60 + tt * 4, tt * 180) * 0.55 + grain * 0.45;
          let v = smooth(dry - 0.06, dry + 0.06, tooth);
          v *= 1 - smooth(edge - 0.02, edge + 0.02, au);
          v *= smooth(0, 0.16, contact) * smooth(-0.02, 0.008, t);
          // 濃淡: 毛の筋、縁の濃さ、うっすらとした墨のむら
          const tone = 0.93 + (streak - 0.5) * 0.07 * smooth(0.0, 0.08, tt) + smooth(edge - 0.08, edge - 0.01, au) * 0.05 + (n2(x * 0.35, y * 0.35) - 0.5) * 0.04 - smooth(0.6, 1, tt) * (1 - bk) * 0.25;
          alpha = Math.max(alpha, clamp(v * tone));
          // にじみ(濡れているところだけ、紙に少し染みる)
          if (au >= edge - 0.02) {
            const out = (au - edge) * spread;
            const wet = (1 - smooth(0.3, 0.8, tt)) * (1 - smooth(-0.2, 2.6, out)) * 0.075 * smooth(0.0, 0.03, t);
            alpha = Math.max(alpha, wet * (0.4 + grain * 1.1));
          }
        }
      }

      if (alpha > 0.003) {
        const o = (j * px + i) * 4;
        data[o] = cr;
        data[o + 1] = cg;
        data[o + 2] = cb;
        data[o + 3] = Math.round(alpha * 255);
      }
    }
  }
  return data;
}

// 描き進み(0〜1)に合わせて、見せる範囲(扇形+丸い筆先)を作ります
export function ensoReveal(seed = 3) {
  const { C, start, sweep, wmax, radiusAt } = ensoParams(seed);
  const TWO_PI = Math.PI * 2;
  const toPx = (v: number, size: number) => (v / 200) * size;
  const head = (progress: number, size: number) => {
    const t = clamp(progress);
    const a = start + sweep * t;
    const r = radiusAt(t);
    return { x: toPx(C + r * Math.cos(a), size), y: toPx(C + r * Math.sin(a), size) };
  };
  return {
    head,
    clip(c: CanvasRenderingContext2D, progress: number, size: number) {
      const s = (v: number) => toPx(v, size);
      c.beginPath();
      if (progress <= 0) {
        c.rect(0, 0, 0, 0);
        return;
      }
      // 書き始めより少し手前から、いま筆がある角度までの扇形
      const a0 = start - 0.42;
      const a1 = start + sweep * clamp(progress);
      c.moveTo(s(C), s(C));
      c.arc(s(C), s(C), s(130), a0, a1);
      c.closePath();
      // 筆先は丸く
      if (progress < 1) {
        const h = head(progress, size);
        c.moveTo(h.x + s(wmax * 0.62), h.y);
        c.arc(h.x, h.y, s(wmax * 0.62), 0, TWO_PI);
      }
    },
  };
}
