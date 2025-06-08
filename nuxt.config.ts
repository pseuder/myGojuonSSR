// nuxt.config.ts
import tailwindcss from "@tailwindcss/vite";

const API_BASE_URL = "http://localhost:5001/";
const GOOGLE_CLIENT_ID =
  "314080941126-4t3fosnf64q4jcqe3lltftq1melsguq8.apps.googleusercontent.com";

export default defineNuxtConfig({
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
