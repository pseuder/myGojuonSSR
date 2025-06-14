<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
useSeoMeta({
  title: () => "日語50音學習網站",
  description: () =>
    "隨開隨用的線上50音學習網站, 透過手寫學習&隨機挑選&AI辨識檢測熟悉程度",
  keywords: () =>
    "日語,50音,假名,平假名,片假名,平板,線上,學習網站,手寫學習,平板學習,書寫學習,觸控學習,練習網站,手寫練習,平板練習,書寫練習,觸控練習",
});
</script>
