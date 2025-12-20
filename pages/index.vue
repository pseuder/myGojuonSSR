<template>
  <div class="flex h-full flex-col gap-4 px-4 py-4">
    <div class="py-10 text-center">
      <h1 class="text-3xl font-bold text-indigo-700 md:text-4xl">
        <img src="/favicon.png" alt="Logo" class="mr-2 inline-block h-10" />{{
          t("site_title")
        }}
      </h1>
      <p class="mt-2 text-xl text-gray-600">{{ t("feature_description") }}</p>
    </div>

    <div>
      <!-- 特色區塊 -->
      <div class="my-10 grid gap-6 md:grid-cols-3">
        <div class="feature-card">
          <h2 class="text-2xl font-semibold text-indigo-600">
            {{ t("syllabary_learning") }}
          </h2>
          <pre>{{ t("syllabary_description") }}</pre>
        </div>
        <div class="feature-card">
          <h2 class="text-2xl font-semibold text-indigo-600">
            {{ t("writing_friendly") }}
          </h2>
          <pre>{{ t("stylus_friendly") }}</pre>
        </div>
        <div class="feature-card">
          <h2 class="text-2xl font-semibold text-indigo-600">
            {{ t("random_testing") }}
          </h2>
          <pre>{{ t("random_selection_ai_assessment") }}</pre>
        </div>
      </div>

      <!-- 開始學習按鈕 -->
      <div
        class="my-10 flex flex-col justify-center gap-4 text-center md:flex-row"
      >
        <el-button
          @click="router.push(localePath('/WritingPractice'))"
          class="rounded-lg bg-indigo-600 px-6 py-6 text-xl text-white transition duration-300 hover:bg-indigo-700"
        >
          {{ t("start_handwriting_practice") }}
        </el-button>
        <el-button
          @click="router.push(localePath('/ListeningPractice'))"
          style="margin-left: 0px"
          class="rounded-lg bg-indigo-600 px-6 py-6 text-xl text-white transition duration-300 hover:bg-indigo-700"
        >
          {{ t("start_dictation_practice") }}
        </el-button>

        <el-button
          @click="router.push(localePath('/SongOverview'))"
          style="margin-left: 0px"
          class="rounded-lg bg-indigo-600 px-6 py-6 text-xl text-white transition duration-300 hover:bg-indigo-700"
        >
          {{ t("start_song_practice") }}
        </el-button>
      </div>

      <!-- 聯絡方式 -->

      <section class="my-10 flex flex-col">
        <h2 class="mb-4 text-2xl font-bold text-indigo-700">
          {{ t("feedback_and_feature_request") }}
        </h2>

        <div class="flex flex-col gap-2">
          <!-- 線上留言 -->
          <div
            class="my-4 flex w-fit items-center gap-4"
            @click="handleReportClick('online')"
          >
            <el-button type="warning" class="" plain circle>
              <el-icon :size="20"><ChatLineRound /></el-icon>
            </el-button>
            <span class="pointer-cursor mb-2 text-[#e6a23c]">{{
              t("anonymous_feedback")
            }}</span>
          </div>

          <!-- gmail -->
          <div
            class="my-4 flex flex-col gap-4"
            @click="handleReportClick('gmail')"
          >
            <div class="flex items-center gap-4">
              <a
                href="mailto:iop890520@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/images/gmail.png"
                  :alt="t('feedback_and_feature_request') + ' - Gmail'"
                  class="h-8 w-8 text-red-400 transition-opacity hover:opacity-80"
                />
              </a>
              <span>iop890520@gmail.com</span>
            </div>
          </div>

          <!-- fb -->
          <div
            class="my-4 flex flex-col gap-4"
            @click="handleReportClick('facebook')"
          >
            <div class="flex items-center gap-4">
              <a
                href="https://www.facebook.com/Pseuder/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/images/facebook.png"
                  :alt="t('feedback_and_feature_request') + ' - Facebook'"
                  class="h-8 w-8 text-red-400 transition-opacity hover:opacity-80"
                />
              </a>
              <span>https://www.facebook.com/Pseuder</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Powered by -->
      <section class="my-10">
        <div class="flex flex-col gap-4">
          <h2 class="mb-4 text-2xl font-bold text-indigo-700">Powered by</h2>

          <div class="flex items-center gap-2">
            <a
              href="https://vuejs.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/images/vuejs.svg"
                alt="Vue.js Framework - Powered by Vue.js"
                class="h-10 w-10 text-red-400 transition-opacity hover:opacity-80"
              />
            </a>

            <a
              href="https://element-plus.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <el-icon
                size="40"
                color="#409EFF"
                class="transition-opacity hover:opacity-80"
              >
                <ElementPlus />
              </el-icon>
            </a>

            <a
              href="https://tailwindcss.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/images/tailwindcss.svg"
                alt="Tailwind CSS Framework - Styled with Tailwind"
                class="h-10 w-10 transition-opacity hover:opacity-80"
              />
            </a>

            <a
              href="https://www.google.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/images/Google.svg"
                alt="Google"
                class="h-10 w-10 transition-opacity hover:opacity-80"
              />
            </a>

            <a
              href="https://www.youtube.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/images/YouTube.svg"
                alt="YouTube"
                class="h-10 w-10 transition-opacity hover:opacity-80"
              />
            </a>

            <a
              href="https://vercel.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/images/vercel.svg"
                alt="vercel"
                class="h-10 w-10 transition-opacity hover:opacity-80"
              />
            </a>

            <el-button
              :icon="VideoCameraFilled"
              circle
              @click="router.push(localePath('/SongEdit/empty'))"
            />
          </div>
        </div>
      </section>
    </div>
    <ContactForm :visible="showContactForm" @close="showContactForm = false" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { ElementPlus } from "@element-plus/icons-vue";
import ContactForm from "~/components/ContactForm.vue";
import { VideoCameraFilled, ChatLineRound } from "@element-plus/icons-vue";

const router = useRouter();
const localePath = useLocalePath();
const showContactForm = ref(false);

import { useI18n } from "vue-i18n";
const { t, locale } = useI18n();

const { gtag } = useGtag();
const config = useRuntimeConfig();
const siteUrl = config.public.siteBase || "https://mygojuon.vercel.app";

const handleReportClick = (item) => {
  if (item == "online") {
    showContactForm.value = true;
  }
  gtag("event", `回報問題: ${item}`);
};

// 首頁專屬 SEO Meta
useSeoMeta({
  title: () => t("page_meta.home.title"),
  description: () => t("page_meta.home.description"),
  keywords: () => t("meta.keywords"),
  ogTitle: () => t("page_meta.home.title"),
  ogDescription: () => t("page_meta.home.description"),
  ogImage: `${siteUrl}/favicon.png`,
  ogUrl: () =>
    `${siteUrl}${locale.value === "zh-TW" ? "" : `/${locale.value}`}`,
  twitterTitle: () => t("page_meta.home.title"),
  twitterDescription: () => t("page_meta.home.description"),
  twitterImage: `${siteUrl}/favicon.png`,
});

// 添加結構化資料
const { getWebsiteSchema, getBreadcrumbSchema } = useStructuredData();
useHead({
  script: [
    {
      type: "application/ld+json",
      children: JSON.stringify(getWebsiteSchema()),
    },
    {
      type: "application/ld+json",
      children: JSON.stringify(
        getBreadcrumbSchema([{ name: t("home"), url: siteUrl }]),
      ),
    },
  ],
});
</script>

<style scoped>
@reference "~/assets/css/main.css";

.feature-card {
  @apply rounded-lg bg-white p-6 text-center shadow-md transition-all duration-300 ease-in-out;
}

.feature-card:hover {
  @apply scale-105;
}

.feature-card:hover h2 {
  @apply scale-110;
}

.feature-card:hover p {
  @apply scale-110;
}

.gradient-text-animated {
  background: linear-gradient(
    90deg,
    #ff6b6b,
    #4ecdc4,
    #45b7d1,
    #f8a5c2,
    #ff6b6b
  );
  background-size: 300% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: bold;
  font-size: 1.5rem;
  animation: gradient-animation 6s ease infinite;
}

@keyframes gradient-animation {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

pre {
  white-space: pre-wrap; /* 保留空白,但允許換行 */
  word-wrap: break-word; /* 單詞過長時強制斷行 */
  overflow-wrap: break-word; /* 更現代的屬性 */
}
</style>
