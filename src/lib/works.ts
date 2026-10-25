import { getCollection } from 'astro:content';

// 公開する作品を、新しい順に返します(draft: true の作品は除きます)
export async function getPublishedWorks() {
  const works = await getCollection('works', ({ data }) => !data.draft);
  return works.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
