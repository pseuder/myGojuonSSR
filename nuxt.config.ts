// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },
  app: {
    head: {
      // title 和其他 meta 由各頁面動態設置
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.png" }],
    },
  },
  css: ["~/assets/css/main.css"],
  modules: [
    "@nuxtjs/sitemap",
    "@element-plus/nuxt",
    "@nuxtjs/i18n",
    "@nuxtjs/tailwindcss",
    "nuxt-gtag",
    "@nuxt/image",
  ],
  site: {
    url: process.env.NUXT_PUBLIC_SITE_BASE,
  },
  sitemap: {
    sources: ["/api/__sitemap__/urls"],
  },
  elementPlus: {
    importStyle: false,
  },
  i18n: {
    langDir: "locales",
    strategy: "prefix",
    locales: [
      {
        code: "zh-TW",
        iso: "zh-TW",
        name: "繁體中文",
        file: "TW.json",
      },
      {
        code: "en",
        iso: "en",
        name: "English",
        file: "EN.json",
      },
    ],
    defaultLocale: "zh-TW",
  },
  gtag: {
    id: "G-CB4PE7FVJP",
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
      siteBase: process.env.NUXT_PUBLIC_SITE_BASE,
      googleClientId: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID,
    },
  },
});
