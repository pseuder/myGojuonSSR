<template>
  <div class="h-full w-full">
    <div ref="youtube" style="width: 100%" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { usePlayer } from "@vue-youtube/core";

const videoId = ref("dQw4w9WgXcQ");
const youtube = ref();

const { onReady } = usePlayer(videoId, youtube, {
  cookie: false,
  playerVars: {
    mute: 1,
  },
});

onReady((event) => {
  event.target.playVideo();
});
</script>
