// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  //- 兼容性日期
  compatibilityDate: "2025-05-15",

  //- 開發工具
  devtools: { enabled: true },

  //================================================================
  // App & SEO
  //================================================================
  app: {
    head: {
      title: "日語50音學習網站", // 預設標題
      htmlAttrs: {
        lang: "zh-TW",
      },
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.png" }],
    },
  },

  //================================================================
  // Styling
  //================================================================
  css: ["~/assets/css/main.css"],

  //================================================================
  // Modules
  //================================================================
  modules: [
    "@nuxtjs/sitemap",
    "@element-plus/nuxt",
    "@nuxtjs/i18n",
    "@nuxtjs/tailwindcss", // 推薦使用模組取代手動設定 Vite
  ],

  //================================================================
  // Module Configurations
  //================================================================

  // Nuxt Site: Sitemap 的依賴，提供網站 URL
  site: {
    // 從環境變數讀取，更靈活
    url: process.env.NUXT_PUBLIC_SITE_BASE,
  },

  // Sitemap
  sitemap: {
    sources: ["/api/__sitemap__/urls"],
  },

  // Element Plus
  elementPlus: {
    importStyle: false, // 維持原設定，通常與手動引入樣式有關
  },

  // i18n
  i18n: {
    langDir: "locales",
    strategy: "prefix_except_default",
    locales: [
      {
        code: "zh-TW",
        iso: "zh-TW",
        name: "繁體中文",
        file: "TW.json",
      },
    ],
    defaultLocale: "zh-TW",
  },

  //================================================================
  // Runtime & Environment Variables
  //================================================================
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
      siteBase: process.env.NUXT_PUBLIC_SITE_BASE,
      googleClientId: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID,
    },
  },
});
