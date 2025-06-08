// plugins/google-login.client.ts
import vue3GoogleLogin from "vue3-google-login";

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const googleClientId = config.public.googleClientId;

  if (!googleClientId) {
    console.warn("Google Client ID is not configured.");
    return;
  }

  nuxtApp.vueApp.use(vue3GoogleLogin, {
    clientId: googleClientId,
  });
});
