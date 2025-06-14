<template>
  <div class="flex flex-col gap-4 px-10 py-4">
    <el-space class="mb-4 flex w-full items-center gap-4 select-none" wrap>
      <el-tag
        class="cursor-pointer text-blue-400 hover:text-blue-600 hover:underline"
        @click="resetFilter"
      >
        全部
      </el-tag>
      <el-tag
        v-for="author in allAuthors"
        :key="author.author"
        class="cursor-pointer text-blue-400 hover:text-blue-600 hover:underline"
        :class="[
          author.author === 'NELKE' ? 'gradient-text-tech-animated' : '',
        ]"
        @click="filterByAuthor(author.author)"
      >
        {{ author.author }}
      </el-tag>
    </el-space>
    <div class="flex items-center gap-4">
      <el-space class="justify-center" style="width: 100%" wrap>
        <template v-for="video in filteredVideos" :key="video.source_id">
          <el-card class="w-full max-w-[380px]" shadow="hover">
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
                {{ video.name }}
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";

const MYAPI = useApi();

const router = useRouter();
const route = useRoute();
const allVideos = ref([]);
const allAuthors = ref([]);
const selectedAuthor = ref(null);

const page_size = ref(50);
const page_number = ref(1);

const filteredVideos = computed(() => {
  if (selectedAuthor.value) {
    return allVideos.value.filter(
      (video) => video.author === selectedAuthor.value,
    );
  }
  return allVideos.value;
});

// 輔助函式: 解析路由
const resolveVideoUrl = (source_id) => {
  return "/SongPractice/" + source_id;
};

const filterByAuthor = (authorName) => {
  selectedAuthor.value = authorName;
  router.push({ query: { author: authorName } });
};

const resetFilter = () => {
  selectedAuthor.value = null;
  router.push({ query: {} });
};

const fetchVideos = async () => {
  let res = await MYAPI.get("/get_all_videos", {
    page_size: page_size.value,
    page_number: page_number.value,
  });
  allVideos.value = res.data;

  res = await MYAPI.get("/get_all_authors");
  allAuthors.value = res.data;
};

onMounted(() => {
  fetchVideos().then(() => {
    const author = route.query.author;
    if (author) {
      selectedAuthor.value = author;
    }
  });
});
</script>

<style scoped>
.gradient-text-tech-animated {
  background: linear-gradient(120deg, #4caf50, #2196f3, #673ab7, #4caf50);
  background-size: 300% 100%;
  -webkit-background-clip: text; /* 為了 Safari 瀏覽器 */
  background-clip: text;
  color: transparent; /* 文字顏色設為透明，顯示背景漸層 */
  animation: gradient-animation 8s ease infinite;
  background-color: #ecf5ff; /* 指定背景顏色 */
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
