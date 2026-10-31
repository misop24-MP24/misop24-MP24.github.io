// サイト全体の設定です。ここを書き換えると、サイト全体に反映されます。

export const SITE = {
  // 活動名(トップの水面、タイトル、検索結果に出ます)
  name: 'misop24',
  // 肩書き(画面には出さず、検索結果のタイトルにだけ入ります)
  role: 'ゲーム制作',
  // 検索結果に出る説明文(120文字くらいまで)
  description:
    'misop24のポートフォリオ。ブラウザで遊べるゲームや、itch.io・Steamで公開しているゲームをまとめています。',
  // サイトのURL(astro.config.mjs の site と同じにします)
  url: 'https://misop24-mp24.github.io',
  // 作品一覧を、年に加えて月でも区切るか(false にすると年だけ)
  groupByMonth: true,
};

// 外部リンク(X、itch.io、Steam など)と紹介ページの文章は、src/data/profile.json にあります。
// サイト更新ツールの「プロフィール」から編集できます。
import profile from './data/profile.json';

export const LINKS: { label: string; url: string }[] = profile.links;
export const ABOUT: string[] = profile.about;
