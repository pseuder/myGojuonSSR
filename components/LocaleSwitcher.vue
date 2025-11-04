// LocaleSwitcher.vue
<template>
  <el-popover placement="bottom" :width="150" trigger="click">
    <el-menu
      class="user-select-none"
      :default-active="currentLocale"
      @select="handleSelect"
    >
      <el-menu-item :index="LOCALE_TW">中文</el-menu-item>
      <el-menu-item :index="LOCALE_EN">English</el-menu-item>
    </el-menu>

    <template #reference>
      <img
        title="language"
        src="/images/language.svg"
        alt="language"
        class="h-10 w-10 cursor-pointer transition-transform hover:scale-110"
      />
    </template>
  </el-popover>
</template>

<script setup>
import { computed, defineEmits } from "vue";
import { useI18n } from "vue-i18n";

const { locale, setLocale } = useI18n();
const currentLocale = computed(() => locale.value);

const LOCALE_TW = "zh-TW";
const LOCALE_EN = "en";

const emit = defineEmits(["update:locale"]);

const handleSelect = (lang) => {
  // locale.value = lang;
  setLocale(lang);
  localStorage.setItem("myGojuon_lang", JSON.stringify({ locale: lang }));
  emit("update:locale", lang);
};
</script>
