<template>
  <!-- 頁面結構基本不變 -->
  <div class="flex h-full flex-col lg:overflow-hidden">
    <div
      v-if="currentVideo"
      class="flex h-full flex-col gap-4 px-4 py-4 md:px-10 lg:flex-row"
    >
      <!-- 影片播放器+功能列 -->
      <div class="flex h-full flex-col lg:w-1/2">
        <div class="shrink-0">
          <!-- 影片標題＋作者 -->
          <div class="gradient-text-tech-animated">
            {{ currentVideo.name }} - {{ currentVideo.author }}
          </div>
          <!-- 標籤 -->
          <div class="mb-4 flex flex-wrap items-center gap-2">
            <template v-for="tag in currentVideo.tags?.split(',')" :key="tag">
              <el-tag type="info">{{ tag }}</el-tag>
            </template>
          </div>
        </div>

        <!-- 影片播放器 -->
        <div
          id="player-container"
          ref="playerContainerRef"
          class="flex-1 overflow-auto"
        >
          <div
            id="player"
            ref="playerRef"
            class="aspect-video w-full lg:h-full"
          ></div>
        </div>

        <!-- 功能列 -->
        <div class="flex shrink-0 flex-col gap-2">
          <div class="my-4 flex h-full w-full flex-col items-center gap-2">
            <div class="flex w-full flex-row">
              <div class="flex w-full flex-1 flex-col justify-between gap-4">
                <div
                  class="cursor-pointer hover:text-blue-500"
                  @click="goToPreviousLyric()"
                >
                  <el-tag type="warning">A</el-tag>{{ t("jump_previous_line") }}
                </div>
                <div
                  class="cursor-pointer hover:text-blue-500"
                  @click="goToNextLyric()"
                >
                  <el-tag type="warning">D</el-tag>{{ t("jump_next_line") }}
                </div>
                <div
                  class="cursor-pointer hover:text-blue-500"
                  @click="toggleLoopCurrentLyric()"
                >
                  <el-tag type="warning">S</el-tag>
                  <span v-if="isLooping" class="text-red-600">
                    {{ t("stop_looping") }}</span
                  >
                  <span v-else> {{ t("loop_playback") }}</span>
                </div>
              </div>

              <div class="flex flex-1 flex-col gap-1">
                <el-checkbox v-model="autoScroll">{{
                  t("scrolling")
                }}</el-checkbox>
                <el-checkbox v-model="autoPlayNext">{{
                  t("auto_play_next_song")
                }}</el-checkbox>
                <el-input-number
                  v-model="playbackRate"
                  :precision="1"
                  :step="0.1"
                  :max="2"
                  :min="0.3"
                  @change="changePlaybackRate(playbackRate)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 歌詞  -->
      <el-scrollbar class="h-full overflow-x-auto lg:w-1/2">
        <!-- <el-button type="warning" size="small" @click="handleCopyLyrics" plain>
          複製歌詞
        </el-button> -->
        <div class="">
          <div
            v-for="(line, index) in lyrics"
            :key="index"
            :id="`lyric-${index}`"
            :class="{ 'bg-yellow-200': currentLyricIndex === index }"
            class="flex items-center gap-4 py-2"
          >
            <div class="flex flex-shrink-0 items-center">
              <el-button
                type="text"
                plain
                @click="handleStartVideoClick(line.timestamp)"
              >
                <el-icon :size="25" title="跳轉到此">
                  <Right />
                </el-icon>
              </el-button>

              <!-- <el-button
                type="text"
                plain
                @click="togglePlayPause"
                style="margin-left: 4px"
              >
                <el-icon :size="25">
                  <VideoPause v-if="isPlaying" />
                  <VideoPlay v-else />
                </el-icon>
              </el-button> -->
            </div>
            <div class="flex flex-wrap gap-2">
              <template v-for="(ly, lyIndex) in line.lyrics" :key="lyIndex">
                <div class="flex flex-col items-center justify-center">
                  <div class="h-3 text-sm">
                    {{ display_mode === "both" ? ly.cvt : "" }}
                  </div>
                  <div class="text-xl">
                    {{ ly.ori }}
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </el-scrollbar>
    </div>
    <!-- 增加載入中狀態顯示 -->
    <div v-else class="flex h-full items-center justify-center">
      <p>Loading song...</p>
    </div>

    <!-- 浮動播放/暫停按鈕 (只在小於lg螢幕時顯示) -->
    <div v-if="currentVideo" class="fixed right-4 bottom-4 z-50 lg:hidden">
      <el-button type="primary" size="large" circle @click="togglePlayPause">
        <el-icon :size="24">
          <VideoPause v-if="isPlaying" />
          <VideoPlay v-else />
        </el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { VideoPause, VideoPlay, Right } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const MYAPI = useApi();
const router = useRouter();
const route = useRoute();

// 使用 Nuxt 的 useRuntimeConfig 獲取環境變數，更安全
const config = useRuntimeConfig();

// --- 數據獲取與 SEO ---

// 從路由參數獲取影片 ID，注意是 uid
const videoId = computed(() => route.params.uid);

const uid = route.params.uid;

const {
  data: videoData,
  pending,
  error,
  refresh: refreshVideoData,
} = await useAsyncData(
  () => `song-${route.params.uid}`, // 使用函數讓快取鍵響應式更新
  async () => {
    try {
      const currentUid = route.params.uid; // 使用當前路由的 uid
      const response = await MYAPI.get(`/get_video/${currentUid}`);
      if (!response.data) {
        // 在 Nuxt 中，建議這樣拋出一個帶有狀態碼的錯誤
        throw createError({
          statusCode: 404,
          statusMessage: "Song Not Found",
          fatal: true,
        });
      }
      return response.data; // 只返回需要的資料部分
    } catch (err) {
      console.error("Error fetching video data:", err);
      throw createError({
        statusCode: 500,
        statusMessage: "無法載入歌曲資訊",
        fatal: true,
      });
    }
  },
  {
    // 當路由參數改變時自動重新獲取數據
    watch: [() => route.params.uid],
  },
);

// 確保當 videoData 變化時，相關變數也跟著更新
const currentVideo = computed(() => videoData.value);
const lyrics = computed(() => {
  if (videoData.value?.converted) {
    try {
      return JSON.parse(videoData.value.converted);
    } catch (e) {
      console.error("Failed to parse lyrics JSON", e);
      return [];
    }
  }
  return [];
});

// 當 currentVideo 變化時，meta 標籤會自動更新
useSeoMeta({
  title: () =>
    `${currentVideo.value?.name || "歌曲"} - ${currentVideo.value?.author || "演唱者"} | 日語歌曲練習`,
  description: () =>
    `${currentVideo.value?.name} by ${currentVideo.value?.author} KTV歌詞, 平假名歌詞對照`,
  keywords: () =>
    `${currentVideo.value?.name}, ${currentVideo.value?.author}, ${currentVideo.value?.tags}, 日語歌曲, 日文歌曲, 平假名歌詞對照`,
  ogTitle: () =>
    `${currentVideo.value?.name} - ${currentVideo.value?.author} | 日語歌曲練習`,
  ogDescription: () =>
    `練習日語歌曲《${currentVideo.value?.name}》by ${currentVideo.value?.author}。提供平假名歌詞對照、時間軸High Light、循環播放、速度調整等功能，幫助您學習日語歌曲。`,
  twitterCard: "summary",
});

// 使用 useHead 處理 JSON-LD 結構化數據
useHead({
  script: [
    {
      type: "application/ld+json",
      // 使用 getter 函數使其響應式
      children: () =>
        JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: `${currentVideo.value?.name} - ${currentVideo.value?.author} | 日語歌曲練習`,
          description: `練習日語歌曲《${currentVideo.value?.name}》by ${currentVideo.value?.author}。`,
          url: `http://localhost:3000${route.fullPath}`, // 正式環境請換成你的網域
          mainEntity: {
            "@type": "MusicRecording",
            name: currentVideo.value?.name,
            byArtist: { "@type": "Person", name: currentVideo.value?.author },
            inLanguage: "ja",
          },
        }),
    },
  ],
  // 處理 YouTube API script 的載入
  script: [
    { src: "https://www.youtube.com/iframe_api", async: true, defer: true },
  ],
});

// --- 播放器與互動邏輯  ---

const playerRef = ref(null);
let player = null;
const currentLyricIndex = ref(-1);

const display_mode = ref("both");
const playbackRate = ref(1);
const autoScroll = ref(true);
const autoPlayNext = ref(false);
const isPlaying = ref(false);
const isLooping = ref(false);
const loopStart = ref(0);
const loopEnd = ref(0);

const allVideos = ref([]);
const fetchAllVideos = async () => {
  try {
    // 使用 $fetch
    const params = {
      author_id: currentVideo.value?.author_id || "",
    };
    const res = await MYAPI.get("/get_all_videos", params);
    allVideos.value = res.data.data;
  } catch (error) {
    console.error("Error fetching all videos:", error);
    ElMessage.error("無法獲取所有歌曲列表");
    allVideos.value = [];
  }
};

const authorFilteredVideos = computed(() => {
  if (
    !currentVideo.value ||
    !currentVideo.value.author ||
    !allVideos.value.length
  ) {
    return [];
  }
  return allVideos.value
    .filter((video) => video.author === currentVideo.value.author)
    .sort((a, b) => a.uid - b.uid);
});

const currentVideoIndexInAuthorList = computed(() => {
  if (!currentVideo.value || !authorFilteredVideos.value.length) {
    return -1;
  }
  // 注意：原來的 videoId 是 YouTube ID，這裡假設 uid 是影片的唯一標識符
  return authorFilteredVideos.value.findIndex(
    (v) => v.source_id === videoId.value,
  );
});

// 解析時間戳
const parseTimeToSeconds = (timeString) => {
  if (!timeString) return 0;
  const timeStringmatch = timeString.match(/\[(\d+):(\d+\.\d+)\]/);
  if (timeStringmatch) {
    return parseInt(timeStringmatch[1]) * 60 + parseFloat(timeStringmatch[2]);
  }
  return 0;
};

// YouTube Player 初始化
const initializePlayer = () => {
  // 確保 YT API 已載入且在客戶端環境
  if (
    typeof window.YT === "undefined" ||
    typeof window.YT.Player === "undefined"
  ) {
    // 如果 API 還沒好，稍後再試
    setTimeout(initializePlayer, 100);
    return;
  }

  if (!playerRef.value) return;

  // 如果已有播放器實例，先銷毀
  if (player) {
    player.destroy();
    player = null;
  }

  player = new window.YT.Player(playerRef.value, {
    videoId: videoId.value, // 直接使用 videoId
    height: "100%",
    width: "100%",
    playerVars: { autoplay: 1, playsinline: 1 },
    events: {
      onReady: (event) => {
        setInterval(updateCurrentLyric, 100);
        event.target.setPlaybackRate(playbackRate.value);
      },
      onStateChange: (event) => {
        isPlaying.value = event.data === window.YT.PlayerState.PLAYING;
        if (event.data === window.YT.PlayerState.ENDED) {
          playNextSong();
          player.seekTo(0);
        }
      },
      onError: (event) => {
        console.error("YouTube Player Error:", event.data);
        ElMessage.error(`播放器錯誤: ${event.data}`);
      },
    },
  });
};

const playNextSong = () => {
  // 如果未勾選自動播放，只重播當前歌曲
  if (!autoPlayNext.value) {
    if (player && player.seekTo) player.seekTo(0);
    return;
  }

  if (currentVideoIndexInAuthorList.value === -1) {
    if (player && player.seekTo) player.seekTo(0);
    return;
  }

  const nextIndex = currentVideoIndexInAuthorList.value + 1;
  if (nextIndex < authorFilteredVideos.value.length) {
    const nextSong = authorFilteredVideos.value[nextIndex];
    ElMessage.info(`即將播放下一首: ${nextSong.name}`);
    // [變更] 使用 Nuxt router 導航
    router.push(`/SongPractice/${nextSong.source_id}`);
  } else {
    ElMessage.info("已是此歌手的最後一首歌，將從頭播放目前歌曲。");
    if (player && player.seekTo) player.seekTo(0);
  }
};

// 當 videoId 改變時，重新初始化播放器
watch(videoId, async (newId, oldId) => {
  if (newId && newId !== oldId && process.client) {
    // 重置狀態
    currentLyricIndex.value = -1;
    isLooping.value = false;

    // 手動刷新數據以確保獲取新歌曲的信息
    await refreshVideoData();

    // 重新獲取所有影片列表（因為可能切換到不同歌手）
    await fetchAllVideos();

    // 重新初始化播放器
    initializePlayer();
  }
});

// 監聽自動播放, 播放速率和自動滾動的變化
watch(autoPlayNext, (newValue) => {
  if (process.client) {
    localStorage.setItem("myGojuon_autoPlayNext", JSON.stringify(newValue));
  }
});

watch(playbackRate, (newValue) => {
  if (process.client) {
    localStorage.setItem("myGojuon_playbackRate", JSON.stringify(newValue));
  }
});

watch(autoScroll, (newValue) => {
  if (process.client) {
    localStorage.setItem("myGojuon_autoScroll", JSON.stringify(newValue));
  }
});

// --- 以下是大部分可以保留的客戶端互動邏輯 ---

const updateCurrentLyric = () => {
  if (
    player &&
    typeof player.getCurrentTime === "function" &&
    lyrics.value.length > 0
  ) {
    const currentTime = player.getCurrentTime();
    if (isLooping.value && loopEnd.value > 0 && currentTime >= loopEnd.value) {
      player.seekTo(loopStart.value);
      return;
    }
    for (let i = 0; i < lyrics.value.length; i++) {
      const lineStartTime = parseTimeToSeconds(lyrics.value[i].timestamp);
      const nextLineStartTime =
        i < lyrics.value.length - 1
          ? parseTimeToSeconds(lyrics.value[i + 1].timestamp)
          : player.getDuration() || Infinity;
      if (currentTime >= lineStartTime && currentTime < nextLineStartTime) {
        if (currentLyricIndex.value !== i) {
          currentLyricIndex.value = i;
          if (autoScroll.value) scrollToCurrentLyric(i);
        }
        break;
      }
    }
  }
};

const scrollToCurrentLyric = (index) => {
  // `document` 只能在客戶端使用
  if (process.client) {
    const lyricElement = document.getElementById(`lyric-${index}`);
    if (lyricElement) {
      lyricElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
};

const startVideo = (time) => {
  if (player && player.seekTo) {
    player.seekTo(parseTimeToSeconds(time));
    player.playVideo();
  }
};

const handleStartVideoClick = (time) => {
  if (isLooping.value) toggleLoopCurrentLyric();
  startVideo(time);
};

const togglePlayPause = () => {
  if (player) {
    isPlaying.value ? player.pauseVideo() : player.playVideo();
  }
};

const changePlaybackRate = (value) => {
  if (player && player.setPlaybackRate) {
    player.setPlaybackRate(value);
  }
};

const goToPreviousLyric = () => {
  if (currentLyricIndex.value > 0 && lyrics.value.length > 0) {
    startVideo(lyrics.value[currentLyricIndex.value - 1].timestamp);
  }
};

const goToNextLyric = () => {
  if (currentLyricIndex.value < lyrics.value.length - 1) {
    startVideo(lyrics.value[currentLyricIndex.value + 1].timestamp);
  }
};

const toggleLoopCurrentLyric = () => {
  if (lyrics.value.length === 0 || currentLyricIndex.value < 0) {
    ElMessage.warning("沒有可循環的歌詞行");
    return;
  }
  isLooping.value = !isLooping.value;
  if (isLooping.value) {
    loopStart.value = parseTimeToSeconds(
      lyrics.value[currentLyricIndex.value].timestamp,
    );
    loopEnd.value =
      currentLyricIndex.value < lyrics.value.length - 1
        ? parseTimeToSeconds(
            lyrics.value[currentLyricIndex.value + 1].timestamp,
          )
        : player && player.getDuration
          ? player.getDuration()
          : Infinity;
    ElMessage.success("開始循環當前行");
  } else {
    loopStart.value = 0;
    loopEnd.value = 0;
    ElMessage.info("停止循環");
  }
};

const handleCopyLyrics = () => {
  // `navigator` 只能在客戶端使用
  if (process.client) {
    let result = "";
    for (const line of lyrics.value) {
      let combinedLyric = "";
      for (const lyric of line.lyrics) combinedLyric += `${lyric.ori}`;
      result += `${line.timestamp}${combinedLyric}\n`;
    }
    navigator.clipboard.writeText(result);
    ElMessage.success("複製成功");
  }
};

const handleKeyPress = (event) => {
  if (
    process.client &&
    (document.activeElement.tagName === "INPUT" ||
      document.activeElement.tagName === "TEXTAREA")
  ) {
    return;
  }
  switch (event.key.toLowerCase()) {
    case "a":
      goToPreviousLyric();
      break;
    case "d":
      goToNextLyric();
      break;
    case "s":
      toggleLoopCurrentLyric();
      break;
  }
};

// onMounted 只在客戶端執行，是放置客戶端專用邏輯的最佳位置
onMounted(() => {
  // 確保在客戶端環境下執行
  if (process.client) {
    // 載入本地存儲的設定
    const savedAutoPlayNext = localStorage.getItem("myGojuon_autoPlayNext");
    const savedPlaybackRate = localStorage.getItem("myGojuon_playbackRate");
    const savedAutoScroll = localStorage.getItem("myGojuon_autoScroll");

    if (savedAutoPlayNext !== null) {
      autoPlayNext.value = JSON.parse(savedAutoPlayNext);
    }
    if (savedPlaybackRate !== null) {
      playbackRate.value = JSON.parse(savedPlaybackRate);
    }
    if (savedAutoScroll !== null) {
      autoScroll.value = JSON.parse(savedAutoScroll);
    }

    fetchAllVideos();

    // 監聽 YouTube API 是否準備就緒
    window.onYouTubeIframeAPIReady = () => {
      initializePlayer();
    };

    // 如果 API 已經載入，直接初始化
    if (window.YT && window.YT.Player) {
      initializePlayer();
    }

    const dataToSend = {
      learningModule: "song",
      learningMethod: "get_video",
      learningItem: videoId.value,
    };

    // 發送數據到後端
    MYAPI.post("/record_activity", dataToSend).catch((error) => {
      console.error("Error recording activity:", error);
    });

    window.addEventListener("keypress", handleKeyPress, true);
  }
});

onUnmounted(() => {
  if (process.client) {
    if (player) {
      player.destroy();
      player = null;
    }
    window.removeEventListener("keypress", handleKeyPress);
    // onYouTubeIframeAPIReady 設為 null，避免組件卸載後觸發
    window.onYouTubeIframeAPIReady = null;
  }
});
</script>

<!-- <style> 區塊保持不變 -->
<style scoped>
/* ... 您的樣式 ... */
.gradient-text-tech-animated {
  background: linear-gradient(120deg, #4caf50, #2196f3, #673ab7, #4caf50);
  background-size: 300% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: bold;
  font-size: 1.5rem;
  letter-spacing: 0.5px;
  animation: gradient-animation 8s ease infinite;
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
