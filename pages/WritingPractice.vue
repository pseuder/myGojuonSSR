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
          :learning-module="LEARNING_MODULE"
          @changeSound="changeSound"
        />
      </el-card>
    </div>
  </div>
</template>

<script setup>
// ============================================================
// Imports & Composables
// ============================================================
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import HandwritingCanvas from "/components/HandwritingCanvas.vue";
import fiftySoundsData from "/data/fifty-sounds.json";

const { t, locale } = useI18n();
const { gtag } = useGtag();
const config = useRuntimeConfig();
const siteUrl = config.public.siteBase || "https://mygojuon.vercel.app";
const { isPlaying, play: playAudio, stop: stopAudio } = useWebAudio();
const { getCourseSchema, getBreadcrumbSchema } = useStructuredData();

// ============================================================
// Constants
// ============================================================
const STORAGE_KEYS = {
  AUTO_PLAY: "writingPractice_autoPlay",
  ACTIVE_TAB: "writingPractice_activeTab",
  SELECTED_SOUND: "writingPractice_selectedSound",
};

const TAB_TYPES = {
  HIRAGANA: "hiragana",
  KATAKANA: "katakana",
  DAKUON: "dakuon",
  HANDAKUON: "handakuon",
  YOON: "yoon",
};

const KEYBOARD_KEYS = {
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
};

const SOUND_DIRECTION = {
  NEXT: "next",
  PREV: "prev",
};

const GROUP_SIZES = {
  YOON: 3,
  DEFAULT: 5,
};

const AUDIO_CONFIG = {
  SOUNDS_PATH: "/sounds/",
  FILE_EXTENSION: ".mp3",
};

const LEARNING_MODULE = "writing";

// ============================================================
// SEO & Meta
// ============================================================
const pageUrl = `${siteUrl}${locale.value === "zh-TW" ? "" : `/${locale.value}`}/WritingPractice`;

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

// ============================================================
// Data & State
// ============================================================
const fiftySounds = fiftySoundsData;
const activeTab = ref(TAB_TYPES.HIRAGANA);
const selectedSound = ref({ kana: "あ", romaji: "a", evo: "安" });
const autoPlay = ref(false);

const tabs = [
  { name: TAB_TYPES.HIRAGANA, label: "hiragana" },
  { name: TAB_TYPES.KATAKANA, label: "katakana" },
  { name: TAB_TYPES.DAKUON, label: "dakuon" },
  { name: TAB_TYPES.HANDAKUON, label: "handakuon" },
  { name: TAB_TYPES.YOON, label: "yoon" },
];

// ============================================================
// Computed Properties
// ============================================================
const currentSounds = computed(() => fiftySounds[activeTab.value] ?? []);

const groupedSounds = computed(() => {
  const groups = [];
  const groupSize = activeTab.value === TAB_TYPES.YOON ? GROUP_SIZES.YOON : GROUP_SIZES.DEFAULT;
  for (let i = 0; i < currentSounds.value.length; i += groupSize) {
    groups.push(currentSounds.value.slice(i, i + groupSize));
  }
  return groups;
});

// ============================================================
// Sound Selection & Navigation
// ============================================================
const selectSound = (sound) => {
  if (sound.kana) {
    selectedSound.value = sound;
    navigator.clipboard.writeText(sound.kana);
    gtag("event", `手寫練習`);
  }
};

const isSelectedSound = (sound) =>
  selectedSound.value && selectedSound.value.kana === sound.kana;

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
    type === SOUND_DIRECTION.NEXT
      ? findNextValidKana(currentIndex, 1)
      : findNextValidKana(currentIndex, -1);

  if (nextSound) {
    selectSound(nextSound);
  }
};

const handleTabChange = (TabPaneName) => {
  selectedSound.value = currentSounds.value[0];
};

// ============================================================
// Audio Playback
// ============================================================
const playSound = async () => {
  stopAudio(); // 先停止當前播放
  const audioUrl = `${AUDIO_CONFIG.SOUNDS_PATH}${selectedSound.value.romaji}${AUDIO_CONFIG.FILE_EXTENSION}`;
  await playAudio(audioUrl);
};

const togglePlay = async () => {
  await playSound();
};

// ============================================================
// Keyboard Events
// ============================================================
const handleKeydown = (event) => {
  if (event.key === KEYBOARD_KEYS.ARROW_LEFT) {
    changeSound(SOUND_DIRECTION.PREV);
  } else if (event.key === KEYBOARD_KEYS.ARROW_RIGHT) {
    changeSound(SOUND_DIRECTION.NEXT);
  }
};

// ============================================================
// LocalStorage Persistence
// ============================================================
const loadPreferences = () => {
  // localStorage 在 SSR 階段不存在, 加入環境檢查
  if (typeof window === "undefined") return;

  // 讀取 autoPlay 設定
  const savedAutoPlay = localStorage.getItem(STORAGE_KEYS.AUTO_PLAY);
  if (savedAutoPlay !== null) {
    autoPlay.value = savedAutoPlay === "true";
  }

  // 讀取 activeTab 設定
  const savedActiveTab = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB);
  if (savedActiveTab !== null) {
    const validTabs = Object.values(TAB_TYPES);
    if (validTabs.includes(savedActiveTab)) {
      activeTab.value = savedActiveTab;
    }
  }

  // 讀取 selectedSound 設定
  const savedSelectedSound = localStorage.getItem(STORAGE_KEYS.SELECTED_SOUND);
  if (savedSelectedSound !== null) {
    try {
      const parsedSound = JSON.parse(savedSelectedSound);
      const soundExists = currentSounds.value.find(
        (sound) => sound.kana === parsedSound.kana,
      );
      if (soundExists) {
        selectedSound.value = parsedSound;
      } else {
        selectedSound.value = currentSounds.value[0];
      }
    } catch (error) {
      console.error("Failed to parse savedSelectedSound:", error);
      selectedSound.value = currentSounds.value[0];
    }
  }
};

// 監聽並保存用戶偏好設定
watch(autoPlay, (newValue) => {
  localStorage.setItem(STORAGE_KEYS.AUTO_PLAY, newValue.toString());
});

watch(activeTab, (newValue) => {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, newValue);
});

watch(
  selectedSound,
  (newValue) => {
    if (newValue && newValue.kana) {
      localStorage.setItem(
        STORAGE_KEYS.SELECTED_SOUND,
        JSON.stringify(newValue),
      );
    }
  },
  { deep: true },
);

// ============================================================
// Auto Play Feature
// ============================================================
watch(selectedSound, async () => {
  if (autoPlay.value) {
    await playSound();
  }
});

// ============================================================
// Lifecycle Hooks
// ============================================================
onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
  loadPreferences();
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
  // Web Audio API 資源會在 useWebAudio composable 中自動清理
});
</script>
