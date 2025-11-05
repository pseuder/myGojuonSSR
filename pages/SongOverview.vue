<template>
  <div class="flex h-[88vh] w-full flex-col p-2 lg:h-full">
    <div class="mb-4 flex-none">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="w-full">
        <el-tab-pane label="ALL" name="all"> </el-tab-pane>
        <el-tab-pane
          v-for="author in allAuthors"
          :key="author.id"
          :label="author.name"
          :name="String(author.id)"
          :class="{ 'gradient-text-tech-animated': author.author == 'NELKE' }"
        >
        </el-tab-pane>
      </el-tabs>
    </div>

    <div class="flex w-full grow flex-col items-center gap-4 overflow-x-hidden">
      <!-- Author selection view -->
      <div
        v-if="activeTab === 'all'"
        class="flex w-full flex-1 flex-wrap content-start justify-center gap-4 overflow-y-auto p-2"
      >
        <template v-for="author in allAuthors" :key="author.id">
          <div
            class="flex cursor-pointer flex-col hover:scale-105"
            @click="handleAuthorSelect(author.id)"
          >
            <el-card class="h-52 w-80 p-0 md:w-96" shadow="hover">
              <NuxtImg
                :src="`/thumbnails/${author.name}.jpg`"
                class="h-full w-full"
                :alt="author.name"
                position="top"
                style="object-fit: cover; object-position: top"
              />
            </el-card>
            <div class="text-lg font-bold">
              {{ author.name }} - {{ author.song_count }} {{ t("songs") }}
            </div>
          </div>
        </template>
      </div>

      <!-- Video list view -->
      <el-space
        v-else
        ref="scrollContainer"
        class="w-full flex-1 justify-center overflow-x-hidden overflow-y-auto"
        wrap
      >
        <template v-for="video in allVideos" :key="video.source_id">
          <el-card class="h-fit w-80 md:w-96" shadow="hover">
            <div class="p-4">
              <a
                :href="resolveVideoUrl(video.source_id)"
                target="_blank"
                rel="noopener noreferrer"
                class="mb-2 block w-full"
                @click="handleVideoClick(video.source_id)"
              >
                <img
                  :src="
                    'https://i.ytimg.com/vi/' +
                    video.source_id +
                    '/hqdefault.jpg'
                  "
                  class="h-48 w-full cursor-pointer object-cover"
                  alt="video thumbnail"
                />
              </a>

              <a
                :href="resolveVideoUrl(video.source_id)"
                target="_blank"
                rel="noopener noreferrer"
                class="mb-2 block w-full truncate text-lg text-blue-400 no-underline hover:text-blue-600 hover:underline"
              >
                {{ video.name }} - {{ video.author }}
              </a>

              <div class="flex gap-2" v-if="video.tags">
                <el-tag
                  v-for="tag in video.tags?.split(',')"
                  :key="tag"
                  type="success"
                  >{{ tag }}</el-tag
                >
              </div>
            </div>
          </el-card>
        </template>
      </el-space>

      <!-- Loading indicator for infinite scroll -->
      <div
        v-if="isLoading && activeTab !== 'all'"
        class="flex justify-center py-4"
      >
        <el-icon class="is-loading">
          <Loading />
        </el-icon>
        <span class="ml-2">載入影片中...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Loading } from "@element-plus/icons-vue";

import { useI18n } from "vue-i18n";
const { t, locale } = useI18n();
const localePath = useLocalePath();

const MYAPI = useApi();
const config = useRuntimeConfig();
const siteUrl = config.public.siteBase || "https://mygojuon.vercel.app";

// 歌曲總覽頁面專屬 SEO Meta
useSeoMeta({
  title: () => t("page_meta.song_overview.title"),
  description: () => t("page_meta.song_overview.description"),
  keywords: () => t("meta.keywords"),
  ogTitle: () => t("page_meta.song_overview.title"),
  ogDescription: () => t("page_meta.song_overview.description"),
  ogImage: `${siteUrl}/favicon.png`,
  ogUrl: () => `${siteUrl}${locale.value === "zh-TW" ? "" : `/${locale.value}`}/SongOverview`,
  twitterTitle: () => t("page_meta.song_overview.title"),
  twitterDescription: () => t("page_meta.song_overview.description"),
  twitterImage: `${siteUrl}/favicon.png`,
});

// 添加結構化資料
const { getCourseSchema, getBreadcrumbSchema } = useStructuredData();
const pageUrl = `${siteUrl}${locale.value === "zh-TW" ? "" : `/${locale.value}`}/SongOverview`;
useHead({
  script: [
    {
      type: "application/ld+json",
      children: JSON.stringify(
        getCourseSchema(
          t("page_meta.song_overview.title"),
          t("page_meta.song_overview.description"),
          pageUrl
        )
      ),
    },
    {
      type: "application/ld+json",
      children: JSON.stringify(
        getBreadcrumbSchema([
          { name: t("home"), url: siteUrl },
          { name: t("song_practice"), url: pageUrl },
        ])
      ),
    },
  ],
});

const router = useRouter();
const route = useRoute();
const allVideos = ref([]);
const allAuthors = ref([]);
const selectedAuthor = ref(null);
const activeTab = ref("all");

const page_size = ref(10);
const page_number = ref(1);
const total = ref(0);
const hasMore = ref(true);

const isLoading = ref(true);

// Ref for scrollable container
const scrollContainer = ref(null);

// Load more videos when scrolling to bottom
const loadMoreVideos = async () => {
  if (isLoading.value || !hasMore.value) {
    return;
  }

  page_number.value += 1;
  await fetchVideos(true);
};

// Scroll event handler for infinite scroll
const handleScroll = () => {
  if (!scrollContainer.value) return;

  const element = scrollContainer.value.$el;
  const scrollTop = element.scrollTop;
  const scrollHeight = element.scrollHeight;
  const clientHeight = element.clientHeight;

  // Trigger load more when user scrolls to within 100px of bottom
  const threshold = 100;
  if (scrollTop + clientHeight >= scrollHeight - threshold) {
    loadMoreVideos();
  }
};

// 輔助函式: 解析路由
const resolveVideoUrl = (source_id) => {
  return localePath("/SongPractice/" + source_id);
};

const handleAuthorSelect = (authorId) => {
  const authorIdStr = String(authorId);
  activeTab.value = authorIdStr;
  handleTabChange(authorIdStr);
};

const handleVideoClick = (source_id) => {
  const dataToSend = {
    source_id: source_id,
  };

  // 發送數據到後端
  MYAPI.post("/record_song_activity", dataToSend).catch((error) => {
    console.error("Error recording activity:", error);
  });
};

const handleTabChange = async (tabName) => {
  if (tabName === "all") {
    selectedAuthor.value = null;
    router.push({
      query: {},
    });
  } else {
    selectedAuthor.value = tabName;
    router.push({
      query: {
        author: tabName,
      },
    });
  }
  // Reset for new tab
  page_number.value = 1;
  allVideos.value = [];
  hasMore.value = true;
  await fetchVideos();

  // Re-add scroll event listener after tab change
  await nextTick();
  if (scrollContainer.value) {
    const element = scrollContainer.value.$el;
    // Remove existing listener first to avoid duplicates
    element.removeEventListener("scroll", handleScroll);
    // Add the listener again
    element.addEventListener("scroll", handleScroll);
  }
};

const fetchVideos = async (isAppend = false) => {
  isLoading.value = true;

  // const params = {
  //   page_size: page_size.value,
  //   page_number: page_number.value,
  // };

  const params = {};

  if (selectedAuthor.value) {
    params.author_id = selectedAuthor.value;
  }

  try {
    // Fetch authors first if not already loaded
    if (allAuthors.value.length === 0) {
      const authorRes = await MYAPI.get("/get_all_authors");
      allAuthors.value = authorRes.data;
    }

    // If a specific author is selected, fetch their videos
    if (selectedAuthor.value) {
      const videoRes = await MYAPI.get("/get_all_videos", params);
      if (videoRes["status"] == "success") {
        const newVideos = videoRes.data.data;
        total.value = videoRes.data.total;

        if (isAppend) {
          allVideos.value = [...allVideos.value, ...newVideos];
        } else {
          allVideos.value = newVideos;
        }

        hasMore.value =
          newVideos.length === page_size.value &&
          allVideos.value.length < total.value;
      } else {
        ElMessage({
          type: videoRes["status"],
          message: videoRes["message"],
        });
      }
    } else {
      // When 'all' is selected, we don't fetch videos, just clear the list
      allVideos.value = [];
      total.value = 0;
      hasMore.value = false;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    ElMessage({
      type: "error",
      message: "載入資料時發生錯誤",
    });
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  const author_id = route.query.author;
  if (author_id) {
    selectedAuthor.value = author_id;
    activeTab.value = author_id;
  } else {
    activeTab.value = "all";
  }
  await fetchVideos();

  // Add scroll event listener for infinite scroll after DOM is ready
  await nextTick();
  if (scrollContainer.value) {
    const element = scrollContainer.value.$el;
    element.addEventListener("scroll", handleScroll);
  }
});

onUnmounted(() => {
  // Remove scroll event listener
  if (scrollContainer.value) {
    const element = scrollContainer.value.$el;
    element.removeEventListener("scroll", handleScroll);
  }
});
</script>

<style scoped>
.gradient-text-tech-animated :deep(.el-tabs__item) {
  background: linear-gradient(120deg, #4caf50, #2196f3, #673ab7, #4caf50);
  background-size: 300% 100%;
  -webkit-background-clip: text;
  /* 為了 Safari 瀏覽器 */
  background-clip: text;
  color: transparent;
  /* 文字顏色設為透明，顯示背景漸層 */
  animation: gradient-animation 8s ease infinite;
  font-weight: bold;
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

:deep(.el-tabs__content) {
  display: none;
}

.thumbnail-background::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* 变淡效果：50% 透明度的白色叠加层 */
  background-color: rgba(255, 255, 255, 0.2);
}

.thumbnail-text {
  position: relative;
  z-index: 2;
  /* 确保文字在半透明层之上 */

  color: white;
  /* 文字颜色设置为白色 */

  /* 使用 text-shadow 模拟黑框 (描边) */
  /* 设置四个方向的黑色阴影，偏移量和模糊半径为 0 */
  text-shadow:
    -1px -1px 0 #000,
    1px -1px 0 #000,
    -1px 1px 0 #000,
    1px 1px 0 #000;
}

:deep(.el-card__body) {
  height: 100%;
  width: 100%;
  padding: 0px;
}
</style>
