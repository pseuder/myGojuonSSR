<template>
  <div class="flex h-full flex-col gap-4 px-4 py-4 lg:flex-row">
    <!-- 50音列表 -->
    <div class="w-full" :key="activeTab">
      <h2 class="mb-3 text-xl font-semibold">
        <el-tabs
          v-model="activeTab"
          class="w-fill mb-4 lg:max-w-md"
          @tab-change="handleTabChange"
        >
          <template v-for="tab in tabs" :key="tab.name">
            <el-tab-pane :label="t(tab.label)" :name="tab.name" />
          </template>
        </el-tabs>
      </h2>
      <div
        v-for="(row, rowIndex) in groupedSounds"
        :key="rowIndex"
        class="mb-2 flex"
      >
        <div
          v-for="sound in row"
          :key="sound.kana"
          class="mx-1 flex flex-1 items-center"
        >
          <el-button
            @click="selectSound(sound)"
            :type="isSelectedSound(sound) ? 'primary' : ''"
            :style="{ visibility: sound.kana ? 'visible' : 'hidden' }"
            class="flex-grow"
          >
            {{ sound.kana }}
          </el-button>
        </div>
      </div>
    </div>
    <!-- 手寫互動區 -->
    <div class="w-full content-center">
      <el-card>
        <!-- 功能列 -->
        <div class="flex w-full items-center justify-between">
          <!-- 日文 -->
          <div
            class="inline-flex flex-col items-center text-3xl font-bold sm:text-5xl"
            :title="t('japanese')"
          >
            <span class="text-[12px] text-gray-600"> {{ t("japanese") }}</span>
            <span>{{ selectedSound.kana }}</span>
          </div>
          <!-- 羅馬字 -->
          <div
            class="inline-flex flex-col items-center text-3xl font-bold sm:text-4xl"
            :title="t('romaji')"
          >
            <span class="text-[12px] text-gray-600"> {{ t("romaji") }}</span>
            <span>{{ selectedSound.romaji }}</span>
          </div>
          <!-- 漢字來源 -->
          <div
            class="inline-flex flex-col items-center text-3xl font-bold sm:text-4xl"
            :title="t('kanji_source')"
          >
            <span class="text-[12px] text-gray-600">
              {{ t("kanji_source") }}</span
            >
            <span>{{ selectedSound.evo }}</span>
          </div>

          <!-- 自動撥放 -->
          <el-checkbox v-model="autoPlay" class="hover:cursor-pointer">
            {{ t("auto_play") }}
          </el-checkbox>

          <!-- 音檔播放控制 -->
          <div class="hover:cursor-pointer" @click="togglePlay">
            <img
              v-if="isPlaying"
              src="/images/volume2.png"
              alt="暫停"
              class="h-8 w-8 select-none"
            />
            <img
              v-else
              src="/images/volume.png"
              alt="播放"
              class="h-8 w-8 select-none"
            />
          </div>
        </div>

        <!-- 手寫區 -->
        <HandwritingCanvas
          ref="handwritingCanvas"
          class="select-none"
          :example-kana="selectedSound.kana"
          :current-type="activeTab"
          :show-example="true"
          :learning-module="'writing'"
          @changeSound="changeSound"
        />
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
const { gtag } = useGtag();

import HandwritingCanvas from "/components/HandwritingCanvas.vue";
import fiftySoundsData from "/data/fifty-sounds.json";

import { useI18n } from "vue-i18n";
const { t, locale } = useI18n();
const config = useRuntimeConfig();
const siteUrl = config.public.siteBase || "https://mygojuon.vercel.app";

// 使用 Web Audio API 進行音頻管理
const { isPlaying, play: playAudio, stop: stopAudio } = useWebAudio();

// 手寫練習頁面專屬 SEO Meta
useSeoMeta({
  title: () => t("page_meta.writing_practice.title"),
  description: () => t("page_meta.writing_practice.description"),
  keywords: () => t("meta.keywords"),
  ogTitle: () => t("page_meta.writing_practice.title"),
  ogDescription: () => t("page_meta.writing_practice.description"),
  ogImage: `${siteUrl}/favicon.png`,
  ogUrl: () =>
    `${siteUrl}${locale.value === "zh-TW" ? "" : `/${locale.value}`}/WritingPractice`,
  twitterTitle: () => t("page_meta.writing_practice.title"),
  twitterDescription: () => t("page_meta.writing_practice.description"),
  twitterImage: `${siteUrl}/favicon.png`,
});

// 添加結構化資料
const { getCourseSchema, getBreadcrumbSchema } = useStructuredData();
const pageUrl = `${siteUrl}${locale.value === "zh-TW" ? "" : `/${locale.value}`}/WritingPractice`;
useHead({
  script: [
    {
      type: "application/ld+json",
      children: JSON.stringify(
        getCourseSchema(
          t("page_meta.writing_practice.title"),
          t("page_meta.writing_practice.description"),
          pageUrl,
        ),
      ),
    },
    {
      type: "application/ld+json",
      children: JSON.stringify(
        getBreadcrumbSchema([
          { name: t("home"), url: siteUrl },
          { name: t("handwriting_practice"), url: pageUrl },
        ]),
      ),
    },
  ],
});

const fiftySounds = ref(fiftySoundsData);
const activeTab = ref("hiragana");
const selectedSound = ref({ kana: "あ", romaji: "a", evo: "安" });

// 從 localStorage 讀取 autoPlay 設定，預設為 false
const autoPlay = ref(false);

const tabs = [
  { name: "hiragana", label: "hiragana" },
  { name: "katakana", label: "katakana" },
  { name: "dakuon", label: "dakuon" },
  { name: "handakuon", label: "handakuon" },
  { name: "yoon", label: "yoon" },
];

const currentSounds = computed(() =>
  fiftySounds.value ? fiftySounds.value[activeTab.value] : [],
);

const groupedSounds = computed(() => {
  const groups = [];
  const groupSize = activeTab.value === "yoon" ? 3 : 5;
  for (let i = 0; i < currentSounds.value.length; i += groupSize) {
    groups.push(currentSounds.value.slice(i, i + groupSize));
  }
  return groups;
});

// 切換Tab時將selectedSound設為單前第一個單字
const handleTabChange = (TabPaneName) => {
  selectedSound.value = currentSounds.value[0];
};

// 監聽 selectedSound 變化，自動播放音頻（如果啟用）
watch(selectedSound, async () => {
  if (autoPlay.value) {
    await playSound();
  }
});

const findNextValidKana = (currentIndex, direction) => {
  const totalItems = currentSounds.value.length;
  let nextIndex = currentIndex;
  let loopCount = 0;

  while (loopCount < totalItems) {
    nextIndex = (nextIndex + direction + totalItems) % totalItems;
    if (currentSounds.value[nextIndex].kana) {
      return currentSounds.value[nextIndex];
    }
    loopCount++;
  }

  return null;
};

const changeSound = (type) => {
  const currentIndex = currentSounds.value.findIndex(
    (sound) => sound.kana === selectedSound.value.kana,
  );

  const nextSound =
    type === "next"
      ? findNextValidKana(currentIndex, 1)
      : findNextValidKana(currentIndex, -1);

  if (nextSound) {
    selectSound(nextSound);
  }
};

const togglePlay = async () => {
  // 每次點擊都重新播放
  await playSound();
};

const playSound = async () => {
  const audioUrl = `/sounds/${selectedSound.value.romaji}.mp3`;
  await playAudio(audioUrl);
};

const selectSound = (sound) => {
  if (sound.kana) {
    selectedSound.value = sound;
    navigator.clipboard.writeText(sound.kana);
    gtag("event", `手寫練習`);
  }
};

const isSelectedSound = (sound) =>
  selectedSound.value && selectedSound.value.kana === sound.kana;

const handleKeydown = (event) => {
  if (event.key === "ArrowLeft") {
    changeSound("prev");
  } else if (event.key === "ArrowRight") {
    changeSound("next");
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);

  // 從 localStorage 讀取 autoPlay 設定
  const savedAutoPlay = localStorage.getItem("writingPractice_autoPlay");
  if (savedAutoPlay !== null) {
    autoPlay.value = savedAutoPlay === "true";
  }

  // 從 localStorage 讀取 activeTab 設定
  const savedActiveTab = localStorage.getItem("writingPractice_activeTab");
  if (savedActiveTab !== null) {
    // 驗證 savedActiveTab 是否為有效值
    const validTabs = ["hiragana", "katakana", "dakuon", "handakuon", "yoon"];
    if (validTabs.includes(savedActiveTab)) {
      activeTab.value = savedActiveTab;
    }
  }

  // 從 localStorage 讀取 selectedSound 設定
  const savedSelectedSound = localStorage.getItem(
    "writingPractice_selectedSound",
  );
  if (savedSelectedSound !== null) {
    try {
      const parsedSound = JSON.parse(savedSelectedSound);
      // 驗證這個假名是否存在於當前的 activeTab 中
      const soundExists = currentSounds.value.find(
        (sound) => sound.kana === parsedSound.kana,
      );
      if (soundExists) {
        selectedSound.value = parsedSound;
      } else {
        // 如果不存在，使用當前列表的第一個
        selectedSound.value = currentSounds.value[0];
      }
    } catch (error) {
      console.error("Failed to parse savedSelectedSound:", error);
      selectedSound.value = currentSounds.value[0];
    }
  }
});

// 監聽 autoPlay 變化並保存到 localStorage
watch(autoPlay, (newValue) => {
  localStorage.setItem("writingPractice_autoPlay", newValue.toString());
});

// 監聽 activeTab 變化並保存到 localStorage
watch(activeTab, (newValue) => {
  localStorage.setItem("writingPractice_activeTab", newValue);
});

// 監聽 selectedSound 變化並保存到 localStorage
watch(
  selectedSound,
  (newValue) => {
    if (newValue && newValue.kana) {
      localStorage.setItem(
        "writingPractice_selectedSound",
        JSON.stringify(newValue),
      );
    }
  },
  { deep: true },
);

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
  // Web Audio API 資源會在 useWebAudio composable 中自動清理
});
</script>
