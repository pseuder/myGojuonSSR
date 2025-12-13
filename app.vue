<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n();
const config = useRuntimeConfig();
const siteUrl = config.public.siteBase || "https://mygojuon.vercel.app";

// 全局默認 SEO Meta（作為 fallback）
useSeoMeta({
  titleTemplate: "%s",
  ogSiteName: () => t("meta.title"),
  ogType: "website",
  ogLocale: () => (locale.value === "zh-TW" ? "zh_TW" : "en_US"),
  twitterCard: "summary_large_image",
});

// 全局默認 Head 設定
const route = useRoute();

useHead({
  htmlAttrs: {
    lang: () => locale.value,
  },
  link: () => {
    const currentPath = route.path;
    // 移除語言前綴，獲取基礎路徑
    const basePath = currentPath.replace(/^\/(en|zh-TW)/, "");

    return [
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      {
        rel: "canonical",
        href: locale.value === "zh-TW"
          ? `${siteUrl}${basePath || "/"}`
          : `${siteUrl}/${locale.value}${basePath || "/"}`
      },
      // hreflang for 繁體中文 (default)
      {
        rel: "alternate",
        hreflang: "zh-TW",
        href: `${siteUrl}${basePath || "/"}`,
      },
      // hreflang for English
      {
        rel: "alternate",
        hreflang: "en",
        href: `${siteUrl}/en${basePath || "/"}`,
      },
      // x-default hreflang
      {
        rel: "alternate",
        hreflang: "x-default",
        href: `${siteUrl}${basePath || "/"}`,
      },
    ];
  },
});
</script>
