// composables/useAuth.js

/**
 * @typedef {object} UserInfo
 * @property {string} name - 用戶名稱
 * @property {string} email - 用戶電郵
 * @property {string} picture - 用戶頭像 URL
 * @property {string} sub - 用戶的唯一標識符 (Subject)
 */

// 1. 使用 useState 創建一個全局、響應式的狀態
//    這個狀態在客戶端和服務端之間同步
const useUser = () => useState("user", () => null);
const useIsLogin = () => useState("isLogin", () => false);

export const useAuth = () => {
  const user = useUser();
  const isLogin = useIsLogin();

  // 2. 在客戶端初始化狀態，從 localStorage 讀取
  const initializeAuth = () => {
    // 確保只在客戶端執行
    if (process.client) {
      const token = localStorage.getItem("myGojuon_token");
      const storedUser = localStorage.getItem("myGojuon_userInfo");
      if (token && storedUser) {
        // 這裡可以加入 isTokenExpired 的檢查
        isLogin.value = true;
        user.value = JSON.parse(storedUser);
      }
    }
  };

  const getUserInfo = () => {
    if (process.client) {
      return JSON.parse(localStorage.getItem("myGojuon_userinfo"));
    }
  };

  /**
   * 登入成功後的操作
   * @param {string} token - 身份驗證令牌 (JWT)
   * @param {UserInfo} userInfo - 從伺服器獲取的用戶信息
   */
  const setLoginInfo = (token, userInfo) => {
    if (process.client) {
      localStorage.setItem("myGojuon_token", token);
      localStorage.setItem("myGojuon_userInfo", JSON.stringify(userInfo));
      isLogin.value = true;
      user.value = userInfo;
    }
  };

  // 登出操作
  const logout = () => {
    if (process.client) {
      localStorage.removeItem("myGojuon_token");
      localStorage.removeItem("myGojuon_userInfo");
      isLogin.value = false;
      user.value = null;
    }
  };

  return {
    user,
    isLogin,
    initializeAuth,
    getUserInfo,
    setLoginInfo,
    logout,
  };
};
