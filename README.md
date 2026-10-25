# misop24 ポートフォリオ

波・波紋をテーマにした、ゲーム作品のポートフォリオサイトです。
Astro で作っていて、GitHub Pages で公開します。

サイト: https://misop24-mp24.github.io

## 作品を追加する

1. `src/content/works/_template.md` をコピーして、`_` を外した名前にします(例: `my-game.md`)。
   このファイル名が、作品ページのURL(`/works/my-game/`)になります。英数字とハイフンだけにしてください。
2. 中身を書き換えます(作品名、説明、リンクなど)。
3. 表紙の画像を、`src/assets/works/` に入れます(例: `my-game.png`)。
   横長(16:9)のスクリーンショットがおすすめです。画像は自動で軽くなります。
4. GitHubにアップロードします。数分で、サイトに反映されます。

公開前に確認したいときは、`draft: true` にします。サイトには載りません。

## 設定を変える

`src/config.ts` に、活動名、説明文、リンク(X、itch.io、Steam)、紹介ページの文章があります。

## デザインを変える

- 色: `src/styles/global.css` の先頭にある `--paper`(水面の色)、`--ink`(文字の色)
- トップの水面(波の速さ、光、名前の揺らぎ、開いたときの演出): `src/components/Water.astro`
- 波紋の線画(アイコン、紹介ページ、写真がない作品): `src/components/Ripples.astro`

## 手元で確認する(任意)

Node.js 22.23.4 以上が必要です。

```
npm install
npm run dev
```

表示された `http://localhost:4321` を開くと、書き換えがその場で反映されます。

## 公開の仕組み

`main` ブランチにファイルが入ると、`.github/workflows/deploy.yml` が自動でサイトを作り直して公開します。
リポジトリの Settings → Pages → Source を「GitHub Actions」にしておく必要があります(最初の1回だけ)。
