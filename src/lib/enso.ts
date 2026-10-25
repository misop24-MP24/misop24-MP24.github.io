// 円相(えんそう)を、筆で描いたような形で作ります。
// seed(数字)を変えると、始まりの位置、太さ、ゆらぎの違う円になります。
// 同じ seed なら、いつも同じ形です。

function makeRandom(seed: number) {
  let a = Math.floor(seed * 9973 + 17) | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r1 = (n: number) => Math.round(n * 10) / 10;

export function ensoGeometry(seed = 1) {
  const rand = makeRandom(seed);
  const cx = 100;
  const cy = 100;
  const R = 72 + rand() * 4; // 基本の半径
  const deg = Math.PI / 180;
  const start = (-100 + rand() * 40) * deg; // 筆を置く角度(上のあたり)
  const sweep = (300 + rand() * 40) * deg; // 回る角度(残りが「切れ目」)
  const wmax = 15 + rand() * 6; // 一番太いところの線の太さ
  const drift = 4 + rand() * 5; // 描き終わりへ向けて外へずれる量
  const ph1 = rand() * Math.PI * 2;
  const ph2 = rand() * Math.PI * 2;

  const N = 180;
  const center: [number, number][] = [];
  const outer: [number, number][] = [];
  const inner: [number, number][] = [];

  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const a = start + sweep * t;
    const r = R + drift * t + 1.3 * Math.sin(t * 7 + ph2) + 0.8 * Math.sin(t * 17 + ph1);
    // 筆圧: 置いた直後はやや細く、すぐ太くなり、終わりに向けて細く掠れる
    const rise = Math.min(1, 0.4 + (t / 0.07) * 0.6);
    const fall = t < 0.6 ? 1 : Math.max(0.09, 1 - Math.pow((t - 0.6) / 0.4, 1.5) * 0.92);
    const w = wmax * rise * fall * (0.9 + 0.1 * Math.sin(t * 9 + ph1));
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    center.push([cx + r * cos, cy + r * sin]);
    outer.push([cx + (r + w / 2) * cos, cy + (r + w / 2) * sin]);
    inner.push([cx + (r - w / 2) * cos, cy + (r - w / 2) * sin]);
  }

  const fmt = (p: [number, number]) => `${r1(p[0])} ${r1(p[1])}`;
  const body =
    `M${fmt(outer[0])}` +
    outer.slice(1).map((p) => `L${fmt(p)}`).join('') +
    inner
      .slice()
      .reverse()
      .map((p) => `L${fmt(p)}`)
      .join('') +
    'Z';
  const line = `M${fmt(center[0])}` + center.slice(1).map((p) => `L${fmt(p)}`).join('');

  return { body, line, wmax };
}
