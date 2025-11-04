<!-- components/MyGoogleLogin.vue -->
<template>
  <div class="mr-2 flex h-full w-full items-center overflow-hidden">
    <!-- 使用從 useAuth 來的響應式 isLogin 狀態 -->
    <template v-if="isLogin && user">
      <div class="flex items-center">
        <el-popover
          placement="bottom"
          :width="100"
          trigger="click"
          popper-class="logout-popover"
        >
          <template #reference>
            <div
              class="w-20 cursor-pointer truncate text-blue-400 hover:text-blue-600"
            >
              {{ user.name }}
            </div>
          </template>
          <div class="flex flex-col items-center gap-2">
            <div>{{ t("left_points") }}: ∞</div>
            <el-button
              @click="handleLogout"
              type="danger"
              plain
              size="small"
              class="w-full"
            >
              {{ t("logout") }}
            </el-button>
          </div>
        </el-popover>
      </div>
    </template>
    <template v-else>
      <ClientOnly>
        <GoogleLogin :callback="handleLoginCallback" prompt />
        <template #fallback>
          <el-button loading>{{ t("loading_login") }}</el-button>
        </template>
      </ClientOnly>
    </template>
  </div>
</template>

<script setup>
import { decodeCredential } from "vue3-google-login";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";

const { t } = useI18n();

const { user, isLogin, setLoginInfo, logout } = useAuth();
const myAPI = useApi();

const handleLoginCallback = async (response) => {
  const userData = decodeCredential(response.credential);
  const { name, email, picture, sub } = userData;

  try {
    let api_params = {
      email: email,
      name: name,
      picture: picture,
      sub: sub,
    };
    const res = await myAPI.post("/login", api_params);

    // 更新全局狀態和 localStorage
    setLoginInfo(res.data.token, { email, name, picture, sub });

    ElMessage.success(t("login_success"));
  } catch (error) {
    console.error("登入時發生錯誤:", error);
    ElMessage.error(t("login_fail"));
  }
};

const handleLogout = () => {
  logout();
  ElMessage.success(t("logout_success"));
};
</script>
