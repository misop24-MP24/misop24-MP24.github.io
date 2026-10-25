import { computeEnso } from './brush';

// 墨の計算は重いので、画面の動きを止めないよう裏側で行います
self.onmessage = (e: MessageEvent<{ px: number; rgb: [number, number, number]; seed: number }>) => {
  const { px, rgb, seed } = e.data;
  const data = computeEnso(px, rgb, seed);
  (self as unknown as Worker).postMessage({ px, data }, [data.buffer]);
};
