<template>
  <div class="flex h-full flex-col gap-4 px-4 py-4">
    <!-- filter bar -->
    <div class="flex items-center justify-between">
      <el-input
        v-model="filterText"
        placeholder="請輸入作者名稱進行過濾"
        class="w-full"
        clearable
      />
    </div>
    <!-- *** 主要修改點 1: 加上 ref *** -->
    <el-table
      ref="authorTableRef"
      :data="filteredTableData"
      style="width: 100%"
      highlight-current-row
      row-key="id"
    >
      <el-table-column
        prop="name"
        label="作者"
        min-width="180"
        sortable
      ></el-table-column>
      <el-table-column
        prop="song_count"
        label="歌曲數量"
        min-width="100"
        sortable
      ></el-table-column>
      <el-table-column
        prop="is_public"
        label="公開"
        min-width="100"
        sortable
      ></el-table-column>
      <el-table-column
        prop="display_order"
        label="顯示順序"
        min-width="100"
        sortable
      ></el-table-column>
      <el-table-column label="操作" width="180">
        <template #header>
          <div class="text-center">
            <el-button type="success" @click="handleAdd">新增歌曲</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>

  <el-dialog
    :title="dialogTitle"
    v-model="dialogVisible"
    width="80%"
    top="5vh"
    style="height: 85vh; overflow: auto"
    body-class="h-[85%]"
  >
    <div class="h-full">
      <el-form
        :model="formData"
        ref="form"
        label-width="80px"
        label-position="left"
        v-loading="dialogLoading"
        class="h-full overflow-auto"
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
          <el-input
            v-model="formData.tags"
            placeholder="請用逗號分隔"
          ></el-input>
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
    </div>
    <template #footer>
      <div class="shrink-0 text-right">
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
import { ref, onMounted, computed } from "vue";
import { ElMessage } from "element-plus";
import Sortable from "sortablejs";

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
const dialogLoading = ref(false);
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

const authorTableRef = ref(null);

const filteredTableData = computed(() => {
  if (!filterText.value) {
    return tableData.value;
  }
  const lowerCaseFilter = filterText.value.toLowerCase();
  return tableData.value.filter((item) => {
    return item.name && item.name.toLowerCase().includes(lowerCaseFilter);
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
  dialogLoading.value = true;
  MYAPI.get("/get_video/" + row.source_id).then((res) => {
    let data = res["data"];
    formData.value = { ...row };
    formData.value.is_public = data.is_public === 1;
    formData.value.original = data.original;
    formData.value.converted = data.converted;
    isEdit.value = true;
    dialogLoading.value = false;
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
  dialogLoading.value = true;
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
  dialogLoading.value = false;
};

const fetchData = () => {
  MYAPI.get("/get_all_authors").then((res) => {
    if (res["status"] == "success") {
      tableData.value = res["data"];

      nextTick(() => {
        initSortable();
      });
    } else {
      ElMessage({
        type: res["status"],
        message: res["message"],
      });
    }
  });
};

const initSortable = () => {
  debugger;
  // 如果 authorTableRef 不存在，則不執行
  if (!authorTableRef.value) return;

  // 獲取 el-table 的 tbody 元素
  const tbody = authorTableRef.value.$el.querySelector(
    ".el-table__body-wrapper tbody",
  );

  Sortable.create(tbody, {
    animation: 150, // 拖曳動畫時間
    // 拖曳結束後觸發的事件
    onEnd: async (evt) => {
      const { oldIndex, newIndex } = evt;

      // 如果位置沒有改變，則不執行任何操作
      if (oldIndex === newIndex) {
        return;
      }

      // 1. 更新前端數據順序，讓畫面保持同步
      const itemToMove = tableData.value.splice(oldIndex, 1)[0];
      tableData.value.splice(newIndex, 0, itemToMove);

      // 2. 準備要送到後端的資料
      const orderData = tableData.value.map((item, index) => {
        // 更新本地的 display_order，雖然不是必須，但保持資料一致性是個好習慣
        item.display_order = index + 1;
        return {
          id: item.id,
          display_order: index + 1, // 順序從 1 開始
        };
      });

      console.log("更新的順序資料:", orderData);

      // 3. 呼叫 API 更新後端資料庫
      // await updateAuthorOrder(orderData);
    },
  });
};

// *** 主要修改點 6: 新增更新排序到後端的方法 ***
const updateAuthorOrder = async (orderData) => {
  try {
    const res = await MYAPI.post("/update_authors_order", {
      orders: orderData,
    });
    if (res.status === "success") {
      ElMessage.success("作者順序更新成功！");
      // 可以選擇重新獲取一次資料，以確保完全同步
      // fetchData();
    } else {
      ElMessage.error(res.message || "更新順序失敗");
      // 如果更新失敗，最好是重新載入資料以還原順序
      fetchData();
    }
  } catch (error) {
    console.error("更新作者順序時發生錯誤:", error);
    ElMessage.error("更新順序時發生網路錯誤");
    // 出錯時也還原順序
    fetchData();
  }
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
