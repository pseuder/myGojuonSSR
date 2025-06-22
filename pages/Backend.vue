<template>
  <div class="flex h-full flex-col gap-4 px-4 py-4">
    <!-- filter bar -->
    <div class="flex items-center justify-between">
      <el-input
        v-model="filterText"
        placeholder="請輸入影片名稱、作者進行過濾"
        class="w-full"
        clearable
      />
    </div>
    <el-table
      :data="filteredTableData"
      style="width: 100%"
      highlight-current-row
    >
      <el-table-column prop="id" label="id" min-width="50"></el-table-column>
      <el-table-column
        prop="name"
        label="影片名稱"
        min-width="180"
      ></el-table-column>
      <el-table-column
        prop="author"
        label="作者"
        min-width="100"
      ></el-table-column>
      <el-table-column prop="tags" label="影片標籤" min-width="200">
        <template #default="scope">
          <el-tag
            v-for="tag in scope.row.tags?.split(',')"
            :key="tag"
            type="success"
            class="mb-1"
            >{{ tag }}</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column prop="is_public" label="公開" min-width="200">
        <template #default="scope">
          <el-tag v-if="scope.row.is_public" type="success">公開</el-tag>
          <el-tag v-else type="danger">未公開</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="影片縮圖" min-width="100">
        <template #default="scope">
          <a
            :href="resolveVideoUrl(scope.row.source_id)"
            target="_blank"
            rel="noopener noreferrer"
            class="mb-2 block w-full"
          >
            <img
              :src="
                'https://img.youtube.com/vi/' +
                scope.row.source_id +
                '/hqdefault.jpg'
              "
              alt="video thumbnail"
              class="h-24 w-24 object-cover"
            />
          </a>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #header>
          <div class="text-center">
            <el-button type="success" @click="handleAdd">新增</el-button>
          </div>
        </template>

        <template #default="scope">
          <div class="text-center">
            <el-button type="danger" @click="handleDelete(scope.row)"
              >刪除</el-button
            >
            <el-button type="primary" @click="handleEdit(scope.row)"
              >編輯</el-button
            >
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>

  <el-dialog
    :title="dialogTitle"
    v-model="dialogVisible"
    v-loading="dialogtLoading"
    width="80%"
    top="5vh"
    style="height: 85vh; overflow: auto"
  >
    <el-form
      :model="formData"
      ref="form"
      label-width="80px"
      label-position="left"
    >
      <el-form-item label="影片名稱" prop="name">
        <el-input v-model="formData.name"></el-input>
      </el-form-item>
      <el-form-item label="作者" prop="author">
        <el-input v-model="formData.author"></el-input>
      </el-form-item>
      <el-form-item label="影片ID" prop="source_id">
        <el-input v-model="formData.source_id"></el-input>
      </el-form-item>
      <el-form-item label="影片標籤" prop="tags">
        <el-input v-model="formData.tags" placeholder="請用逗號分隔"></el-input>
      </el-form-item>
      <el-form-item label="公開" prop="is_public">
        <el-switch v-model="formData.is_public"></el-switch>
      </el-form-item>
      <el-form-item label="歌詞" prop="original">
        <div class="flex w-full">
          <el-input
            v-model="formData.original"
            class="flex-1"
            type="textarea"
            rows="15"
          ></el-input>
          <el-input
            v-model="formData.converted"
            class="flex-1"
            type="textarea"
            rows="15"
            v-loading="convertLoading"
          ></el-input>
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="text-right">
        <el-button @click="convert_lyrics">取得轉換歌詞</el-button>
        <el-button type="primary" @click="saveVideo">{{
          isEdit ? "更新" : "新增"
        }}</el-button>
        <el-button @click="dialogVisible = false">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

definePageMeta({
  middleware: [
    function (to, from) {
      if (process.client) {
        const storedUser = localStorage.getItem("myGojuon_userInfo");
        let user = null;
        if (storedUser) {
          user = JSON.parse(storedUser);
        }
        const isAdmin = user?.email === "iop890520@gmail.com";
        if (!isAdmin) {
          return navigateTo("/404", { replace: true });
        }
      }
    },
  ],
});

const MYAPI = useApi();

const tableData = ref([]);
const dialogVisible = ref(false);
const dialogtLoading = ref(false);
const isEdit = ref(false);
const filterText = ref("");
const dialogTitle = computed(() => (isEdit.value ? "編輯歌曲" : "新增歌曲"));
const convertLoading = ref(false);
const form = ref(null);
const formData = ref({
  id: "",
  source_id: "",
  name: "",
  author: "",
  tags: "",
  is_public: false,
  original: "",
  converted: "",
});

const filteredTableData = computed(() => {
  if (!filterText.value) {
    return tableData.value;
  }
  const lowerCaseFilter = filterText.value.toLowerCase();
  return tableData.value.filter((item) => {
    return (
      item.name.toLowerCase().includes(lowerCaseFilter) ||
      item.author.toLowerCase().includes(lowerCaseFilter) ||
      item.tags?.toLowerCase().includes(lowerCaseFilter)
    );
  });
});

const handleAdd = () => {
  resetForm();
  isEdit.value = false;
  dialogVisible.value = true;
};

const handleEdit = (row) => {
  resetForm();
  dialogVisible.value = true;
  dialogtLoading.value = true;
  MYAPI.get("/get_video/" + row.source_id).then((res) => {
    let data = res["data"];
    formData.value = { ...row };
    formData.value.is_public = data.is_public === 1;
    formData.value.original = data.original;
    formData.value.converted = data.converted;
    isEdit.value = true;
    dialogtLoading.value = false;
  });
};

const handleDelete = (row) => {
  ElMessageBox.confirm("確定刪除此影片嗎?", "提示", {
    confirmButtonText: "OK",
    cancelButtonText: "Cancel",
    type: "warning",
  })
    .then(async () => {
      await MYAPI.del("/delete_video/" + row.id);
      fetchData();
      dialogVisible.value = false;
      ElMessage({
        type: "success",
        message: "刪除成功",
      });
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "已取消刪除",
      });
    });
};

function customStringify(obj) {
  return (
    JSON.stringify(obj, null, 2)
      // 處理 lyrics 內部的物件格式
      .replace(
        /{\s*"cvt":\s*"([^"]*)",\s*"ori":\s*"([^"]*)"\s*}/g,
        '{"cvt": "$1","ori": "$2"}',
      )
      // 修正最後一個逗號後的換行
      .replace(/},\s+]/g, "},\n  ]")
  );
}

const convert_lyrics = async () => {
  convertLoading.value = true;
  let res = await MYAPI.post("/convert_lyrics", {
    lyrics: formData.value.original,
  });

  if (res["status"] === "success") {
    formData.value.converted = customStringify(res["data"]);
  } else {
    console.error(res);
  }

  ElMessage({
    type: "success",
    message: "轉換成功",
  });

  convertLoading.value = false;
};

const saveVideo = async () => {
  // let myFromData = JSON.parse(JSON.stringify(formData.value));
  // myFromData.converted = JSON.parse(myFromData.converted);
  dialogtLoading.value = true;
  let res = await MYAPI.post("/upsert_video", formData.value);

  if (res["status"] === "success") {
    fetchData();
    // dialogVisible.value = false;
  } else {
    console.error(res);
  }

  ElMessage({
    type: res["status"],
    message: res["message"],
  });
  dialogtLoading.value = false;
};

const fetchData = () => {
  MYAPI.get("/get_all_videos").then((res) => {
    if (res["status"] == "success") {
      tableData.value = res["data"]["data"];
    } else {
      ElMessage({
        type: res["status"],
        message: res["message"],
      });
    }
  });
};

const resetForm = () => {
  formData.value = {
    id: "",
    source_id: "",
    name: "",
    author: "",
    tags: "",
    is_public: false,
    original: "",
    converted: "",
  };
};

const resolveVideoUrl = (source_id) => {
  return "/SongPractice/" + source_id;
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped></style>
