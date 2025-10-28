<template>
  <div class="flex h-full flex-col gap-4 px-4 py-4 md:flex-row">
    <!-- 左側50音列表 -->
    <div class="flex w-full flex-col gap-2 md:gap-4">
      <div class="flex items-center gap-4">
        <audio
          ref="audioPlayer"
          :src="`/sounds/${selectedSound.romaji}.mp3`"
          @ended="audioEnded"
        ></audio>

        <div class="hover:cursor-pointer" @click="togglePlay">
          <img
            v-if="isPlaying"
            src="/images/volume2.png"
            alt="暫停"
            class="h-8 w-8"
          />
          <img v-else src="/images/volume.png" alt="播放" class="h-8 w-8" />
        </div>

        <!-- 選擇字符集 -->
        <el-select
          v-model="activeTab"
          placeholder="選擇字符集"
          style="width: 130px"
        >
          <el-option key="hiragana" :label="t('hiragana')" value="hiragana" />
          <el-option key="katakana" :label="t('katakana')" value="katakana" />
          <el-option key="dakuon" :label="t('voiced_sounds')" value="dakuon" />
          <el-option
            key="handakuon"
            :label="t('semi_voiced_sounds')"
            value="handakuon"
          />
          <el-option key="yoon" :label="t('contracted_sounds')" value="yoon" />
          <el-option
            key="special"
            :label="t('special_sounds')"
            value="special"
            :disabled="specialLearningList.length === 0"
          />
        </el-select>

        <!-- 隨機、循序模式切換 -->
        <el-switch
          v-model="isRandomMode"
          :active-text="t('random')"
          :inactive-text="t('sequential')"
          @change="handleModeChange"
        />

        <!-- 靠左/靠右 -->
        <!-- <el-switch
          v-model="isRightAligned"
          active-text="靠右"
          inactive-text="靠左"
        /> -->
      </div>

      <!-- 預測值/信心值/Round -->
      <div class="flex items-center gap-4">
        <el-button @click="doSpecialLearning" type="text">
          <img
            src="/images/student.png"
            alt="進行特別學習"
            class="inline-block h-8 w-8"
          />
        </el-button>

        <div>{{ t("predicted_value") }}：{{ predictKana }}</div>
        <div>{{ t("confidence_level") }}：{{ predictConfidence }}</div>
      </div>

      <!-- 加入特別學習 -->
      <div class="flex items-center justify-between gap-2">
        <el-popover placement="bottom" :width="fit - content" trigger="click">
          <template #reference>
            <el-tag type="success" class="text-lg hover:cursor-pointer"
              >Round {{ round }} - {{ completedInRound }} /
              {{ totalInRound }}</el-tag
            >
          </template>

          <div class="sound-grid">
            <div
              v-for="(count, sound) in soundCounts"
              :key="sound"
              class="sound-item"
            >
              <span class="sound">{{ sound }}</span>
              <span
                class="count"
                :class="{
                  active1: count == 1,
                  active2: count == 2,
                  active3: count == 3,
                  active: count > 3,
                }"
                >{{ count }}</span
              >
            </div>
          </div>
        </el-popover>

        <div class="flex items-center gap-4 md:gap-8">
          <img
            src="/images/arrow-circle-left-solid.svg"
            alt="上一個"
            class="h-10 w-10 cursor-pointer md:h-8 md:w-8"
            @click="changeSound('prev')"
          />
          <img
            src="/images/arrow-circle-right-solid.svg"
            alt="下一個"
            class="h-10 w-10 cursor-pointer md:h-8 md:w-8"
            @click="changeSound('next')"
          />
        </div>
      </div>

      <!-- 第4列 -->
      <div
        class="flex items-center"
        :class="isRightAligned ? 'justify-end' : 'justify-start'"
      >
        <el-badge :value="specialLearningList.length" class="mr-2">
          <el-button
            @click="specialLearningListDialogVisible = true"
            type="text"
          >
            <el-icon :size="30"><List /></el-icon>
          </el-button>
        </el-badge>

        <el-button @click="addSpecialLearning" type="text">
          <el-icon :size="30"><CirclePlusFilled /></el-icon>
        </el-button>

        <el-button
          v-show="isLogin"
          id="ai-recognition-button"
          @click="handwritingCanvas.sendCanvasImageToBackend()"
          class="tech-gradient-button h-12 w-full text-[18px]"
          :disabled="handwritingCanvas?.isSending"
        >
          {{ t("ai_recognition") }}
          <img
            class="ml-2 h-6 w-6"
            :class="{ 'animate-spin': handwritingCanvas?.isSending }"
            src="/images/stars.png"
            alt=""
          />
        </el-button>
        <el-button
          v-show="!isLogin"
          type="primary"
          class="h-12 w-full"
          disabled
        >
          {{ t("login_to_enable_ai_recognition") }}
        </el-button>
      </div>

      <el-tag
        class="hover:cursor-pointer"
        @click="showCurrentWord = !showCurrentWord"
        type="danger"
      >
        {{ showCurrentWord ? t("hide_answer") : t("show_answer") }}
      </el-tag>

      <div v-if="showCurrentWord" class="rounded-lg bg-gray-100 p-4">
        <div class="flex justify-between md:flex-col">
          <p>
            <strong>{{ t("japanese") }}：</strong>{{ selectedSound.kana }}
          </p>
          <p>
            <strong>{{ t("romaji") }}：</strong>{{ selectedSound.romaji }}
          </p>
          <p>
            <strong>{{ t("kanji_source") }}：</strong>{{ selectedSound.evo }}
          </p>
        </div>
      </div>
    </div>
    <!-- 右側手寫區 -->
    <div class="w-full content-center select-none">
      <el-card>
        <HandwritingCanvas
          ref="handwritingCanvas"
          @auto-detect="autoDetect"
          :example-kana="selectedSound.kana"
          :show-example="false"
          :current-type="activeTab"
          :learning-module="'listening'"
          :show-change-sound-buttons="false"
          :selected-sound="selectedSound"
        />
      </el-card>
    </div>

    <!-- Special Learning List Dialog -->
    <el-dialog
      v-model="specialLearningListDialogVisible"
      :title="t('special_learning_list')"
      class="w-[90vw] max-w-[500px]"
    >
      <template #title>
        <div class="items center flex justify-between">
          <span>{{ t("special_learning_list") }}</span>
          <el-button
            @click="handleClearSpecialLearningList"
            type="text"
            style="font-size: 35px; padding: 0; margin: 0; line-height: 1"
          >
            <img
              src="/images/broom.png"
              alt=""
              class="h-10 w-10 cursor-pointer"
              :class="{ 'rotate-animation': isRotating }"
            />
          </el-button>
        </div>
      </template>

      <div v-if="specialLearningList.length === 0">
        {{ t("no_special_learning_words") }}
      </div>
      <div class="max-h-[70vh] overflow-auto" v-else>
        <div
          v-for="(item, index) in specialLearningList"
          :key="index"
          class="mt-2 flex items-center justify-between"
        >
          <span>{{ t(item.type) }} - {{ item.kana }}</span>
          <el-button type="danger" @click="removeSpecialLearning(index)"
            ><el-icon><Delete /></el-icon
          ></el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch, nextTick } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
import { Delete, List, CirclePlusFilled } from "@element-plus/icons-vue";
import HandwritingCanvas from "@/components/HandwritingCanvas.vue";
import fiftySoundsData from "@/data/fifty-sounds.json";
import { useI18n } from "vue-i18n";
const { t, locale } = useI18n();

import { useAuth } from "~/composables/useAuth";
const { user } = useAuth();

const MYAPI = useApi();

const { gtag } = useGtag();

const fiftySounds = ref(fiftySoundsData);
const activeTab = ref("hiragana");
const selectedSound = ref({
  kana: "あ",
  romaji: "a",
  evo: "安",
  type: "hiragana",
});
const handwritingCanvas = ref(null);
const audioPlayer = ref(null);
const isPlaying = ref(false);
const isRandomMode = ref(false);
const isRightAligned = ref(true);
const showCurrentWord = ref(false);

const specialLearningList = ref([]);
const specialLearningListDialogVisible = ref(false);

const predictKana = ref("");
const predictConfidence = ref(0);

const soundCounts = reactive({});
const round = ref(1);

const isLogin = computed(() => !!user.value);

const currentSounds = computed(() => {
  if (activeTab.value === "special") {
    return specialLearningList.value;
  }
  return fiftySounds.value ? fiftySounds.value[activeTab.value] : [];
});

const totalInRound = computed(
  () => currentSounds.value.filter((sound) => sound.kana).length,
);

const completedInRound = computed(
  () =>
    currentSounds.value.filter(
      (sound) => sound.kana && soundCounts[sound.kana] >= round.value,
    ).length,
);

// 監聽 currentSounds 的變化，如果變化則重新初始化計數器
watch(currentSounds, () => {
  initializeCounts();
  round.value = 1;
});

// 初始化計數器
const initializeCounts = () => {
  // reset soundCounts
  Object.keys(soundCounts).forEach((key) => delete soundCounts[key]);
  currentSounds.value.forEach((sound) => {
    if (sound.kana) {
      soundCounts[sound.kana] = 0;
    }
  });
};

initializeCounts();

watch(
  selectedSound,
  (newSound, oldSound) => {
    if (newSound !== oldSound) {
      if (audioPlayer.value) {
        audioPlayer.value.load();
        nextTick(() => {
          playSound();
        });
      }
    }
  },
  { deep: true },
);

watch(activeTab, () => {
  selectedSound.value = currentSounds.value[0];

  // 重置soundCounts
  initializeCounts();
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

const handleModeChange = () => {
  ElMessage.success(
    isRandomMode.value ? t("switch_to_random") : t("switch_to_sequential"),
  );
};

const getRandomSound = () => {
  const validSounds = currentSounds.value.filter((sound) => sound.kana);
  const availableSounds = validSounds.filter(
    (sound) => soundCounts[sound.kana] < round.value,
  );

  if (availableSounds.length === 0) {
    // 所有音都已經出現了，開始新的一輪
    round.value++;
    return getRandomSound(); // 遞迴調用以獲取新一輪的聲音
  }

  const randomIndex = Math.floor(Math.random() * availableSounds.length);
  const selectedSound = availableSounds[randomIndex];
  // soundCounts[selectedSound.kana]++;

  return selectedSound;
};

const changeSound = (type) => {
  if (isRandomMode.value) {
    selectSound(getRandomSound());
  } else {
    const currentIndex = currentSounds.value.findIndex(
      (sound) => sound.kana === selectedSound.value.kana,
    );

    const nextSound =
      type === "next"
        ? findNextValidKana(currentIndex, 1)
        : findNextValidKana(currentIndex, -1);

    if (nextSound) {
      // Increment the count for the current sound before moving to the next
      // soundCounts[selectedSound.value.kana]++;
      selectSound(nextSound);
    }
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

const selectSound = (sound) => {
  if (sound.kana) {
    selectedSound.value = sound;
    gtag("event", "學習行為", {
      使用模組: "聽寫練習",
      模組功能: "切換音節",
      項目名稱: sound.kana,
    });
  }
};

const clearSelectedSound = () => {
  selectedSound.value = null;
};

// 特殊對應關係配置
const SPECIAL_KANA_MATCHES = {
  ニ: ["ニ", "二"],
  ホ: ["ホ", "木"],
  ヲ: ["ヲ", "ヨ", "ケ"],
  ン: ["ン", "ソ", "ン"],
  づ: ["づ", "ブ"],
  ん: ["ん", "は", "ひ", "ほ"],
  ヌ: ["ヌ", "又"],
  エ: ["エ", "工", "エ"],
  ロ: ["ロ", "口", "口", "囗"],
  ヘ: ["ヘ", "ㄟ"],
  メ: ["メ", "シ"],
  オ: ["オ", "才"],
};

const autoDetect = (predict_res) => {
  if (predict_res === "ERR_NETWORK") {
    ElMessage.error(t("network_error"));
    return;
  } else if (predict_res === "ERR_SERVER") {
    ElMessage.error(t("server_error"));
    return;
  }

  if (predict_res.status == "error") {
    ElMessage.error(predict_res["message"] ?? "伺服器錯誤");
    return;
  }

  const { predicted_hiragana, confidence } = predict_res.data;
  const currentKana = selectedSound.value.kana;

  // 更新預測結果
  predictKana.value = predicted_hiragana;
  predictConfidence.value = confidence;

  // 檢查是否匹配
  const isCorrect = checkKanaMatch(currentKana, predicted_hiragana);

  if (isCorrect) {
    handleCorrectPrediction(currentKana);
  } else {
    handleIncorrectPrediction(predicted_hiragana);
  }

  try {
    const dataToSend = {
      learningModule: "listening",
      learningMethod: "predict",
      learningItem: currentKana,
      correctness: isCorrect,
    };

    gtag("event", "學習行為", {
      使用模組: "聽寫練習",
      模組功能: "影像辨識",
      項目名稱: currentKana,
    });
  } catch (error) {
    console.error("Error recording activity:", error);
  }
};

// 檢查假名是否匹配
const areEqual = (strA, strB) => {
  // 1. 先對字串進行規範化 (去除空格)
  const normalizedA = strA.replace(/\s/g, "");
  const normalizedB = strB.replace(/\s/g, "");

  // 2. 嚴格比較 (您的原始邏輯 - 不考慮大小寫/重音)
  const isStrictlyEqual =
    normalizedA.localeCompare(normalizedB, "ja", {
      sensitivity: "base",
    }) === 0;

  if (isStrictlyEqual) {
    return true; // 如果嚴格相等，直接返回 true
  }

  // 3. 部分包含檢查 (新的機制)
  const isPartialMatch = normalizedB.includes(normalizedA);

  return isPartialMatch;
};

const checkKanaMatch = (currentKana, predictedKana) => {
  // 檢查特殊情況
  if (currentKana in SPECIAL_KANA_MATCHES) {
    return SPECIAL_KANA_MATCHES[currentKana].includes(predictedKana);
  }
  // 一般情況
  return areEqual(currentKana, predictedKana);
};

// 處理正確預測
const handleCorrectPrediction = (currentKana) => {
  predictKana.value = currentKana;
  ElMessage.success(t("corrent") + `！: ${currentKana}`);
  soundCounts[currentKana]++;
  changeSound("next");
};

// 處理錯誤預測
const handleIncorrectPrediction = (predictedKana) => {
  ElMessage.error(t("incorrect") + `！: ${predictedKana}`);
};

// Special Learning Functions
const loadSpecialLearningList = () => {
  const list = localStorage.getItem("specialLearningList");
  if (list) {
    specialLearningList.value = JSON.parse(list);
  }
};

const saveSpecialLearningList = () => {
  localStorage.setItem(
    "specialLearningList",
    JSON.stringify(specialLearningList.value),
  );
};

const addSpecialLearning = () => {
  if (!selectedSound.value) return;
  const isExist = specialLearningList.value.some(
    (item) => item.kana === selectedSound.value.kana,
  );
  if (isExist) {
    ElMessage.info(t("already_in_special_learning"));
    return;
  }
  specialLearningList.value.push(selectedSound.value);
  saveSpecialLearningList();
  ElMessage.success(t("add_to_special_learning_success"));

  gtag("event", "學習行為", {
    使用模組: "聽寫練習",
    模組功能: "增加特別學習",
    項目名稱: selectedSound.value.kana,
  });
};

const doSpecialLearning = () => {
  if (specialLearningList.value.length === 0) {
    ElMessage.warning(t("special_learning_list_empty"));
    return;
  }
  activeTab.value = "special";
  ElMessage.success(t("start_special_learning"));
};

const removeSpecialLearning = (index) => {
  specialLearningList.value.splice(index, 1);
  saveSpecialLearningList();

  // if current mode is special, and list is empty, switch to hiragana
  if (activeTab.value === "special" && specialLearningList.value.length === 0) {
    activeTab.value = "hiragana";
  }
};

const handleClearSpecialLearningList = () => {
  ElMessageBox.confirm(t("clear_special_learning_list_confirm"), t("warning"), {
    confirmButtonText: t("confirm"),
    cancelButtonText: t("cancel"),
    type: "warning",
  })
    .then(() => {
      specialLearningList.value = [];
      saveSpecialLearningList();
      ElMessage.success(t("special_learning_list_cleared"));

      specialLearningListDialogVisible.value = false;
    })
    .catch(() => {
      ElMessage.info(t("cancelled"));
    });
};

const isSelectedSound = (sound) =>
  selectedSound.value && selectedSound.value.kana === sound.kana;

onMounted(() => {
  loadSpecialLearningList();
  nextTick(() => {
    playSound();
  });
});
</script>

<style scoped>
.tech-gradient-button {
  background: linear-gradient(45deg, #6a11cb 0%, #2575fc 100%) !important;
  color: white !important;
  border: none;
  transition:
    transform 0.2s ease-in-out,
    box-shadow 0.3s ease;
}

h3 {
  margin: 0 0 10px;
  text-align: center;
  color: #333;
  font-size: 16px;
}

.sound-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 5px;
}

.sound-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #fff;
  padding: 3px;
  border-radius: 4px;
  font-size: 12px;
}

.sound {
  font-weight: bold;
  width: max-content;
}

.count {
  margin-top: 2px;
  background-color: #e0e0e0;
  color: #666;
  padding: 1px 4px;
  border-radius: 8px;
  font-size: 10px;
}

.count.active1 {
  background-color: #4caf50;
  color: white;
}

.count.active2 {
  background-color: #2196f3;
  color: white;
}

.count.active3 {
  background-color: #ff9800;
  color: white;
}

.count.active {
  background-color: #f44336;
  color: white;
}
</style>
