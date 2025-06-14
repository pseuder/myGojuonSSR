// nuxt.config.ts
import tailwindcss from "@tailwindcss/vite";

// 正式
const API_BASE_URL = "https://pseuder.xyz/srv_mygojuon2/";
const SITE_BASE_URL = "https://my-gojuon-ssr.vercel.app/";

// 開發
// const SITE_BASE_URL = "http://localhost:3000/";
// const API_BASE_URL = "http://localhost:5002/";

const GOOGLE_CLIENT_ID =
  "314080941126-4t3fosnf64q4jcqe3lltftq1melsguq8.apps.googleusercontent.com";

export default defineNuxtConfig({
  app: {
    head: {
      title: "日語50音學習網站", // default fallback title
      htmlAttrs: {
        lang: "zh-TW",
      },
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.png" }],
    },
  },

  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },
  modules: ["@nuxtjs/sitemap", "@element-plus/nuxt", "@nuxtjs/i18n"],
  site: {
    url: API_BASE_URL,
  },
  sitemap: {
    sources: ["/api/__sitemap__/urls"],
  },
  runtimeConfig: {
    public: {
      apiBase: API_BASE_URL,
      siteBase: SITE_BASE_URL,
      googleClientId: GOOGLE_CLIENT_ID || "",
    },
  },
  css: ["~/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  elementPlus: {
    importStyle: false,
  },
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
});
