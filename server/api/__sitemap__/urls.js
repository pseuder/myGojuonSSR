// server/api/__sitemap__/urls.js

import { asSitemapUrl, defineSitemapEventHandler } from '#imports'
import { useApi } from '~/composables/useApi'; // 在伺服器端需要手動引入


export default defineSitemapEventHandler(async (e) => {
  const { fetchAllSongUids } = useApi();
  const songs = await fetchAllSongUids();

  const songUrls = songs.videos.map((song) => {
    return asSitemapUrl({
      loc: `/songPractice/${song.video_id}`,
      lastmod: song.update_time|| new Date(),
    });
  });
  
  // 手動加入其他重要頁面
  const staticUrls = [
    asSitemapUrl({ loc: '/' }), 
    asSitemapUrl({ loc: '/about' })
  ];

  return [...staticUrls, ...songUrls];
});