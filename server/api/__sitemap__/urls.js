// sitemap/urls.js

import { asSitemapUrl, defineSitemapEventHandler } from "#imports";

export default defineSitemapEventHandler(async (e) => {
  const config = useRuntimeConfig();
  const API_BASE_URL = config.public.apiBase;
  const SITE_BASE_URL = config.public.siteBase;

  // 獲取所有歌曲數據
  let songs = [];
  try {
    const response = await $fetch(`${API_BASE_URL}/get_all_videos`);
    songs = response.data.data || [];
  } catch (error) {
    console.error("獲取歌曲數據失敗:", error);
    songs = [];
  }

  // 為每首歌曲生成 sitemap URL
  const songUrls = songs.map((song) => {
    return asSitemapUrl({
      loc: `${SITE_BASE_URL}/SongPractice/${song.source_id}`,
      lastmod: song.update_time || new Date(),
      // 添加更多 sitemap 屬性
      changefreq: "monthly",
      priority: 0.8,
    });
  });

  // 手動加入其他重要頁面
  const staticUrls = [
    asSitemapUrl({
      loc: "/",
      lastmod: new Date(),
      changefreq: "daily",
      priority: 1.0,
    }),
    asSitemapUrl({
      loc: "/WritingPractice",
      lastmod: new Date(),
      changefreq: "monthly",
      priority: 0.7,
    }),
    asSitemapUrl({
      loc: "/ListeningPractice",
      lastmod: new Date(),
      changefreq: "monthly",
      priority: 0.7,
    }),
    asSitemapUrl({
      loc: "/SongOverview",
      lastmod: new Date(),
      changefreq: "weekly",
      priority: 0.9,
    }),
  ];

  // 合併靜態頁面和動態歌曲頁面的 URL
  return [...staticUrls, ...songUrls];
});
