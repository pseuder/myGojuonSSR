<template>
  <div
    class="flex h-[87vh] flex-col gap-4 overflow-x-hidden overflow-y-auto px-4 py-4"
  >
    <div class="py-10 text-center">
      <h1 class="text-4xl font-bold text-indigo-700">{{ t("site_title") }}</h1>
      <p class="mt-2 text-xl text-gray-600">{{ t("feature_description") }}</p>
    </div>

    <div>
      <!-- 特色區塊 -->
      <div class="my-10 grid gap-6 md:grid-cols-3">
        <div class="feature-card">
          <h2 class="text-2xl font-semibold text-indigo-600">
            {{ t("syllabary_learning") }}
          </h2>
          <p>{{ t("syllabary_description") }}</p>
        </div>
        <div class="feature-card">
          <h2 class="text-2xl font-semibold text-indigo-600">
            {{ t("writing_friendly") }}
          </h2>
          <p>{{ t("stylus_friendly") }}</p>
        </div>
        <div class="feature-card">
          <h2 class="text-2xl font-semibold text-indigo-600">
            {{ t("random_testing") }}
          </h2>
          <p>{{ t("random_selection_ai_assessment") }}</p>
        </div>
      </div>

      <!-- 開始學習按鈕 -->
      <div
        class="my-10 flex flex-col justify-center gap-4 text-center md:flex-row"
      >
        <el-button
          @click="router.push('/WritingPractice')"
          class="rounded-lg bg-indigo-600 px-6 py-6 text-xl text-white transition duration-300 hover:bg-indigo-700"
        >
          {{ t("start_handwriting_practice") }}
        </el-button>
        <el-button
          @click="router.push('/ListeningPractice')"
          style="margin-left: 0px"
          class="rounded-lg bg-indigo-600 px-6 py-6 text-xl text-white transition duration-300 hover:bg-indigo-700"
        >
          {{ t("start_dictation_practice") }}
        </el-button>

        <el-button
          @click="router.push('/SongOverview')"
          style="margin-left: 0px"
          class="rounded-lg bg-indigo-600 px-6 py-6 text-xl text-white transition duration-300 hover:bg-indigo-700"
        >
          {{ t("start_song_practice") }}
        </el-button>
      </div>

      <!-- Powered by -->
      <section class="my-10">
        <div class="flex flex-col gap-4">
          <h2 class="mb-4 text-2xl font-bold text-indigo-700">
            {{ t("song_promotion") }}
          </h2>

          <!-- あたらよ -->
          <router-link
            :to="{
              path: '/songOverview',
              query: { author: 'あたらよ' },
            }"
            class="mb-2 block w-full truncate text-lg text-blue-400 hover:text-blue-600 hover:underline"
          >
            <span class="gradient-text-animated">あたらよ - Atarayo</span>
          </router-link>

          <router-link
            :to="{
              path: '/songOverview',
              query: { author: 'NELKE' },
            }"
            class="mb-2 block w-full truncate text-lg text-blue-400 hover:text-blue-600 hover:underline"
          >
            <span class="gradient-text-animated">NELKE</span>
          </router-link>

          <h2 class="mb-4 text-2xl font-bold text-indigo-700">Powered by</h2>

          <div class="flex items-center gap-2">
            <a
              href="https://vuejs.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/images/vuejs.svg"
                alt="vuejs"
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
                alt="tailwindcss"
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
          </div>
        </div>
      </section>

      <!-- 聯絡方式 -->
      <section class="my-10 flex">
        <h2 class="mb-4 text-2xl font-bold text-indigo-700">
          {{ t("feedback_and_feature_request") }}
        </h2>
      </section>

      <section class="my-10 flex">
        <!-- gmail -->
        <div
          class="my-4 flex flex-col gap-4"
          @click="handleReportClick('gmail')"
        >
          <div class="flex items-center gap-4">
            <img
              src="/images/gmail.png"
              alt="gmail"
              class="h-8 w-8 text-red-400 transition-opacity hover:opacity-80"
            />
            <a
              href="mailto:iop890520@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
            >
            </a>
          </div>
        </div>

        <!-- fb -->
        <div
          class="my-4 flex flex-col gap-4"
          @click="handleReportClick('facebook')"
        >
          <div class="flex items-center gap-4">
            <img
              src="/images/facebook.png"
              alt="facebook"
              class="h-8 w-8 text-red-400 transition-opacity hover:opacity-80"
            />
            <a
              href="https://www.facebook.com/Pseuder/"
              target="_blank"
              rel="noopener noreferrer"
            >
            </a>
          </div>
        </div>

        <div class="my-4 flex flex-col gap-4">
          <el-button @click="router.push('/songEdit')" class="">
            YT 影片剪輯
          </el-button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ElementPlus } from "@element-plus/icons-vue";

const router = useRouter();

import { useI18n } from "vue-i18n";
const { t, locale } = useI18n();

const handleReportClick = (item) => {
  const dataToSend = {
    learningModule: "report",
    learningMethod: "report_issue",
    learningItem: item,
  };

  // 發送數據到後端
  // axios.post("/record_activity", dataToSend).catch((error) => {
  //   console.error("Error recording activity:", error);
  // });
};

// onMounted(updateMeta);
// watch(locale, updateMeta);
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
</style>
