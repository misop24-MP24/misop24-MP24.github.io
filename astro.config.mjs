import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// ユーザーサイト(ユーザー名.github.io)なので base の指定は不要です
export default defineConfig({
  site: 'https://misop24-mp24.github.io',
  integrations: [sitemap()],
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
});
