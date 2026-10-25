// サイト全体の設定です。ここを書き換えると、サイト全体に反映されます。

export const SITE = {
  // 活動名(トップの円の中、タイトル、検索結果に出ます)
  name: 'misop24',
  // 肩書き(画面には出さず、検索結果のタイトルにだけ入ります)
  role: 'ゲーム制作',
  // 検索結果に出る説明文(120文字くらいまで)
  description:
    'misop24のポートフォリオ。ブラウザで遊べるゲームや、itch.io・Steamで公開しているゲームをまとめています。',
  // 落款(朱色の印)に入れる一文字
  seal: '墨',
  // サイトのURL(astro.config.mjs の site と同じにします)
  url: 'https://misop24-mp24.github.io',
  // トップの円相の形(数字を変えると、筆跡が変わります)
  ensoSeed: 3,
};

// 外部リンク(X、itch.io、Steam など)。
// 使うものの行頭の「//」を外して、URLを入れてください。
// 空のままなら表示されません。
export const LINKS: { label: string; url: string }[] = [
  // { label: 'itch.io', url: 'https://ユーザー名.itch.io/' },
  // { label: 'Steam', url: 'https://store.steampowered.com/developer/...' },
  // { label: 'X', url: 'https://x.com/ユーザー名' },
];

// 紹介ページの本文(段落ごとに1行)
export const ABOUT: string[] = [
  'ゲームを作っています。',
  'ブラウザで遊べるものは、各作品のページからそのまま遊べます。販売しているものは、そこから購入ページへ進めます。',
];
