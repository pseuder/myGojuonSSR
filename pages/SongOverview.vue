<template>
  <div class="flex h-[88vh] w-full p-2">
    <div
      class="h-full max-w-[30vw] flex-none overflow-x-hidden overflow-y-auto"
    >
      <el-menu
        :default-active="selectedAuthor || 'all'"
        class="w-fit"
        @select="handleSelect"
      >
        <el-menu-item index="all">
          <span>全部</span>
        </el-menu-item>
        <el-menu-item
          v-for="author in allAuthors"
          :key="author.author"
          :index="author.author"
          :class="{ 'gradient-text-tech-animated': author.author == 'NELKE' }"
        >
          <span>{{ author.author }}</span>
        </el-menu-item>
      </el-menu>
    </div>

    <div class="flex h-full grow flex-col items-center gap-4 overflow-x-hidden">
      <el-space
        class="flex-1 justify-center overflow-y-auto"
        style="width: 100%"
        wrap
        v-if="filteredVideos.length > 0"
      >
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

      <el-pagination
        v-if="filteredVideos.length > 0"
        background
        layout="sizes, prev, pager, next"
        :total="total"
        :page-size="page_size"
        :current-page="page_number"
        :page-sizes="[10, 50, 100, 500]"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
        class="mt-4 flex-none"
      />
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

const page_size = ref(10);
const page_number = ref(1);
const total = ref(0);

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

const handleSelect = (index) => {
  if (index === "all") {
    selectedAuthor.value = null;
    router.push({ query: {} });
  } else {
    selectedAuthor.value = index;
    router.push({ query: { author: index } });
  }
  page_number.value = 1;
  fetchVideos();
};

const handleCurrentChange = (val) => {
  page_number.value = val;
  fetchVideos();
};

const handleSizeChange = (val) => {
  page_size.value = val;
  fetchVideos();
};

const fetchVideos = async () => {
  const params = {
    page_size: page_size.value,
    page_number: page_number.value,
  };
  if (selectedAuthor.value) {
    params.author = selectedAuthor.value;
  }
  let res = await MYAPI.get("/get_all_videos", params);

  if (res["status"] == "success") {
    allVideos.value = res.data.data;
    total.value = res.data.total;
  } else {
    ElMessage({
      type: res["status"],
      message: res["message"],
    });
  }

  if (allAuthors.value.length === 0) {
    res = await MYAPI.get("/get_all_authors");
    allAuthors.value = res.data;
  }
};

onMounted(() => {
  const author = route.query.author;
  if (author) {
    selectedAuthor.value = author;
  }

  fetchVideos();
});
</script>

<style scoped>
.gradient-text-tech-animated {
  background: linear-gradient(120deg, #4caf50, #2196f3, #673ab7, #4caf50);
  background-size: 300% 100%;
  -webkit-background-clip: text; /* 為了 Safari 瀏覽器 */
  background-clip: text;
  color: black; /* 文字顏色設為透明，顯示背景漸層 */
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
