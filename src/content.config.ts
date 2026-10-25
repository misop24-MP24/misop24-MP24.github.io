import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// 作品のデータ構造。src/content/works/ に置いたMarkdownファイルが作品1つになります。
// ファイル名の先頭に「_」を付けたファイルは、サイトに載りません(テンプレート用)。
const works = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/works' }),
  schema: ({ image }) =>
    z.object({
      // 作品名
      title: z.string(),
      // 作品の説明(作品ページの見出しの下と、検索結果に出ます)
      summary: z.string(),
      // 一言コメント(作品一覧の作品名の下と、作品ページに出ます。なくてもかまいません)
      comment: z.string().optional(),
      // 公開日(2026-10-25 の形式)
      date: z.coerce.date(),
      // 表紙画像(src/assets/works/ に置いた画像を、相対パスで指定)
      cover: image().optional(),
      // 表紙画像をネット上のURLで指定する場合(itch.io の画像など)。cover があれば、そちらが優先されます
      coverUrl: z.url().optional(),
      // 画像の説明文(読み上げ用。なければ作品名になります)
      coverAlt: z.string().optional(),
      // タグ(例: AI, 自作, ブラウザ, Godot)。一覧と作品ページに出ます
      tags: z.array(z.string()).default([]),
      // 遊べる・買えるリンク
      links: z
        .array(z.object({ label: z.string(), url: z.url() }))
        .default([]),
      // ページに埋め込むもののURL(itch.ioのゲームの埋め込みURL、YouTubeの埋め込みURLなど)
      embed: z.url().optional(),
      // true にすると、サイトに載せません(下書き)
      draft: z.boolean().default(false),
    }),
});

export const collections = { works };
