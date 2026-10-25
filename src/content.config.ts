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
      // 一行の説明(一覧と検索結果に出ます)
      summary: z.string(),
      // 公開日(2026-10-25 の形式)
      date: z.coerce.date(),
      // 表紙画像(src/assets/works/ に置いた画像を、相対パスで指定)
      cover: image().optional(),
      // 画像の説明文(読み上げ用。なければ作品名になります)
      coverAlt: z.string().optional(),
      // 種類のタグ(例: ブラウザ, Windows, Godot)
      tags: z.array(z.string()).default([]),
      // 遊べる・買えるリンク
      links: z
        .array(z.object({ label: z.string(), url: z.url() }))
        .default([]),
      // ブラウザで遊べるゲームを、このページに埋め込む場合のURL(itch.ioの埋め込みURLなど)
      embed: z.url().optional(),
      // true にすると、サイトに載せません(下書き)
      draft: z.boolean().default(false),
    }),
});

export const collections = { works };
