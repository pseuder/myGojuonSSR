<template>
  <div class="flex h-[88vh] w-full flex-col p-2">
    <div class="mb-4 flex-none">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="w-full">
        <el-tab-pane label="全部" name="all"> </el-tab-pane>
        <el-tab-pane
          v-for="author in allAuthors"
          :key="author.id"
          :label="author.name"
          :name="author.id"
          :class="{ 'gradient-text-tech-animated': author.author == 'NELKE' }"
        >
        </el-tab-pane>
      </el-tabs>
    </div>

    <div
      class="flex h-full w-full grow flex-col items-center gap-4 overflow-x-hidden"
    >
      <el-space
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
      <div v-if="isLoading" class="flex justify-center py-4">
        <el-icon class="is-loading">
          <Loading />
        </el-icon>
        <span class="ml-2">載入影片中...</span>
      </div>

      <!-- End of data indicator -->
      <div
        v-if="!hasMore && allVideos.length > 0"
        class="flex justify-center py-4 text-gray-500"
      >
        已載入全部影片 (共 {{ total }} 部)
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Loading } from "@element-plus/icons-vue";

const MYAPI = useApi();

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
  return "/SongPractice/" + source_id;
};

const handleTabChange = async (tabName) => {
  if (tabName === "all") {
    selectedAuthor.value = null;
    router.push({ query: {} });
  } else {
    selectedAuthor.value = tabName;
    router.push({ query: { author: tabName } });
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

  const params = {
    page_size: page_size.value,
    page_number: page_number.value,
  };
  if (selectedAuthor.value) {
    params.author_id = selectedAuthor.value;
  }

  try {
    let res = await MYAPI.get("/get_all_videos", params);

    if (res["status"] == "success") {
      const newVideos = res.data.data;
      total.value = res.data.total;

      if (isAppend) {
        // Append new videos to existing list
        allVideos.value = [...allVideos.value, ...newVideos];
      } else {
        // Replace videos for initial load or tab change
        allVideos.value = newVideos;
      }

      // Check if there are more videos to load
      hasMore.value =
        newVideos.length === page_size.value &&
        allVideos.value.length < total.value;
    } else {
      ElMessage({
        type: res["status"],
        message: res["message"],
      });
    }

    // Load authors only once
    if (allAuthors.value.length === 0) {
      res = await MYAPI.get("/get_all_authors");
      allAuthors.value = res.data;
    }
  } catch (error) {
    console.error("Error fetching videos:", error);
    ElMessage({
      type: "error",
      message: "載入影片時發生錯誤",
    });
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  const author_id = route.query.author;
  console.log("Author ID:", author_id);
  if (author_id) {
    selectedAuthor.value = author_id;
    activeTab.value = Number(author_id);
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
  -webkit-background-clip: text; /* 為了 Safari 瀏覽器 */
  background-clip: text;
  color: transparent; /* 文字顏色設為透明，顯示背景漸層 */
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
</style>
