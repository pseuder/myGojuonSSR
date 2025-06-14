// 這個檔案位於 server/utils/api.js
// 這裡的函式會被自動注入到所有 server-side 程式碼中

export const fetchAllSongUids = async () => {
  // 在 server/utils 中，可以直接使用 useRuntimeConfig
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase; // 假設你的 API URL 在這裡

  try {
    // 使用 $fetch，這是 Nuxt 提供的通用資料獲取工具，在伺服器端也能很好地工作
    const data = await $fetch("/songs/all_uids", {
      baseURL: apiBase,
      // 如果有需要，可以加入 headers, params 等
    });

    // 根據你的 API 回傳格式調整
    return data;
  } catch (error) {
    console.error("Error fetching song UIDs for sitemap:", error);
    return { videos: [] }; // 發生錯誤時回傳空陣列，避免 sitemap 生成失敗
  }
};
