// composables/useApi.js

export const useApi = () => {
  const config = useRuntimeConfig();
  const API_BASE_URL = config.public.apiBase;

  // 用於快取使用者 IP
  let userIp = null;
  let userRegion = null;
  let userCity = null;

  // 初始化 IP 的函式
  const initializeIp = async () => {
    // 確保只在客戶端執行
    if (process.client) {
      const cachedIp = sessionStorage.getItem("userIp");
      if (cachedIp) {
        userIp = cachedIp;
        userRegion = sessionStorage.getItem("userRegion");
        userCity = sessionStorage.getItem("userCity");
      } else {
        try {
          const response = await $fetch("https://ipinfo.io/json");
          if (response.ip) {
            userIp = response.ip;
            userRegion = response.region;
            userCity = response.city;
            sessionStorage.setItem("userIp", userIp);
            sessionStorage.setItem("userRegion", userRegion);
            sessionStorage.setItem("userCity", userCity);
          }
        } catch (error) {
          console.error("Failed to fetch user IP:", error);
        }
      }
    }
  };

  // 在 composable 初始化時非同步獲取 IP
  initializeIp();

  // 使用 $fetch.create() 創建一個帶有預設選項的 apiFetcher 實例
  const apiFetcher = $fetch.create({
    // 基本 URL
    baseURL: API_BASE_URL,

    // onRequest 是一個攔截器，會在每個請求發送前執行
    onRequest({ request, options }) {
      const headers = new Headers(options.headers);

      // 檢查是否在客戶端環境 (瀏覽器)，因為 localStorage 只在客戶端存在
      if (process.client) {
        const token = localStorage.getItem("myGojuon_token");
        if (token) {
          // 如果 token 存在，為請求加上 Authorization 標頭
          headers.set("Authorization", `Bearer ${token}`);
        }

        // 如果已經快取了使用者 IP，也將其加入標頭
        if (userIp) {
          headers.set("X-User-IP", userIp);
          headers.set("X-User-Region", userRegion);
          headers.set("X-User-City", userCity);
        }
      }

      options.headers = headers;
    },

    // onResponseError 攔截器可以在 API 回應錯誤時執行通用邏輯
    // 例如，如果收到 401 (未授權)，可以自動導向到登入頁
    async onResponseError({ response }) {
      if (response.status === 401) {
        console.error("未授權的請求，請重新登入");
        // 可以在這裡處理登出或導向到登入頁的邏輯
        // await navigateTo('/login');
      }
    },
  });

  // $fetch 是 Nuxt 3 自動引入的，可以直接使用
  // 它會回傳一個 Promise

  /**
   * 執行 GET 請求
   * @param {string} path - 請求路徑 (例如: '/song')
   * @param {object} params - 查詢參數 (可選)
   * @param {object} headers - 請求標頭 (可選)
   * @returns Promise
   */
  const get = (path, params = {}, headers = {}) => {
    // 使用我們自訂的 apiFetcher，而不是全域的 $fetch
    return apiFetcher(path, {
      method: "GET",
      params,
      headers,
    });
  };

  /**
   * 執行 POST 請求
   * @param {string} path - 請求路徑 (例如: '/editSong')
   * @param {object} body - 請求主體 (可選)
   * @param {object} headers - 請求標頭 (可選)
   * @returns Promise
   */
  const post = (path, body = {}, headers = {}) => {
    return apiFetcher(path, {
      method: "POST",
      body,
      headers,
    });
  };

  /**
   * 執行 PUT 請求
   * @param {string} path - 請求路徑
   * @param {object} body - 請求主體 (可選)
   * @param {object} headers - 請求標頭 (可選)
   * @returns Promise
   */
  const put = (path, body = {}, headers = {}) => {
    return apiFetcher(path, {
      method: "PUT",
      body,
      headers,
    });
  };

  /**
   * 執行 PATCH 請求
   * @param {string} path - 請求路徑
   * @param {object} body - 請求主體 (可選)
   * @param {object} headers - 請求標頭 (可選)
   * @returns Promise
   */
  const patch = (path, body = {}, headers = {}) => {
    return apiFetcher(path, {
      method: "PATCH",
      body,
      headers,
    });
  };

  /**
   * 執行 DELETE 請求
   * @param {string} path - 請求路徑 (例如: '/song/1')
   * @param {object} params - 查詢參數 (可選)
   * @param {object} headers - 請求標頭 (可選)
   * @returns Promise
   */
  const del = (path, params = {}, headers = {}) => {
    return apiFetcher(path, {
      method: "DELETE",
      params,
      headers,
    });
  };

  return {
    get,
    post,
    put,
    patch,
    del,
  };
};
