<template>
  <div class="flex h-full flex-col gap-4 px-4 py-4 md:flex-row">
    <!-- 50音列表 -->
    <div class="w-full" :key="activeTab">
      <h2 class="mb-3 text-xl font-semibold">
        <el-tabs v-model="activeTab" class="w-fill mb-4 lg:max-w-md">
          <el-tab-pane
            v-for="tab in tabs"
            :key="tab.name"
            :label="t(tab.label)"
            :name="tab.name"
          />
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
            <span class="text-[12px] text-gray-600">日文字</span>
            <span>{{ selectedSound.kana }}</span>
          </div>
          <!-- 羅馬字 -->
          <div
            class="inline-flex flex-col items-center text-3xl font-bold sm:text-4xl"
            :title="t('romaji')"
          >
            <span class="text-[12px] text-gray-600">羅馬拼音</span>
            <span>{{ selectedSound.romaji }}</span>
          </div>
          <!-- 漢字來源 -->
          <div
            class="inline-flex flex-col items-center text-3xl font-bold sm:text-4xl"
            :title="t('kanji_source')"
          >
            <span class="text-[12px] text-gray-600">漢字來源</span>
            <span>{{ selectedSound.evo }}</span>
          </div>

          <!-- 自動撥放 -->
          <el-checkbox v-model="autoPlay" class="hover:cursor-pointer">
            {{ t("auto_play") }}
          </el-checkbox>

          <!-- 音檔播放控制 -->
          <audio
            ref="audioPlayer"
            :src="`/sounds/${selectedSound.romaji}.mp3`"
            @loadeddata="autoPlaySound"
            @ended="audioEnded"
          ></audio>
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
import { CaretLeft, CaretRight } from "@element-plus/icons-vue";
import { ElMessageBox, ElMessage } from "element-plus";
import HandwritingCanvas from "/components/HandwritingCanvas.vue";
import fiftySoundsData from "/data/fifty-sounds.json";

import { useI18n } from "vue-i18n";
const { t, locale } = useI18n();
const myAPI = useApi();

const fiftySounds = ref(fiftySoundsData);
const activeTab = ref("hiragana");
const selectedSound = ref({ kana: "あ", romaji: "a", evo: "安" });
const handwritingCanvas = ref(null);
const audioPlayer = ref(null);
const isPlaying = ref(false);
const autoPlay = ref(false);

const tabs = [
  { name: "hiragana", label: "hiragana" },
  { name: "katakana", label: "katakana" },
  { name: "dakuon", label: "voiced_sounds" },
  { name: "handakuon", label: "semi_voiced_sounds" },
  { name: "yoon", label: "contracted_sounds" },
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

watch(activeTab, () => {
  selectedSound.value = currentSounds.value[0];
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

    // 重製播放器圖示
    isPlaying.value = false;
  }
};

const togglePlay = () => {
  if (audioPlayer.value) {
    if (isPlaying.value) {
      audioPlayer.value.pause();
    } else {
      audioPlayer.value.play();
    }
    isPlaying.value = !isPlaying.value;
  }
};

const audioEnded = () => {
  isPlaying.value = false;
};

const playSound = () => {
  if (audioPlayer.value) {
    audioPlayer.value.currentTime = 0; // 重置音频到开始位置
    audioPlayer.value.play();
    isPlaying.value = true;
  }
};

const autoPlaySound = () => {
  if (autoPlay.value) {
    playSound();
  }
};

const selectSound = (sound) => {
  if (sound.kana) {
    selectedSound.value = sound;

    navigator.clipboard.writeText(sound.kana);

    const dataToSend = {
      learningModule: "writing",
      learningMethod: "selectSound",
      learningItem: sound.kana,
    };

    // 發送數據到後端
    myAPI.post("/record_activity", dataToSend).catch((error) => {
      console.error("Error recording activity:", error);
    });
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
  // 初始加载时播放第一个音频
  // nextTick(() => {
  //   playSound();
  // });
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
  if (audioPlayer.value) {
    audioPlayer.value.pause();
    audioPlayer.value.src = "";
  }
});
</script>
