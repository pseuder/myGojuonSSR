/**
 * 音檔預載管理 Composable
 * 用於預先載入音檔到記憶體，減少播放延遲
 */
export const useAudioPreloader = () => {
  // 使用 Map 快取所有已載入的 Audio 物件
  const audioCache = new Map();
  const loadingPromises = new Map();
  const isPlaying = ref(false);
  const currentAudio = ref(null);

  /**
   * 預載單一音檔
   * @param {string} romaji - 羅馬拼音
   * @returns {Promise<Audio>}
   */
  const preloadAudio = (romaji) => {
    // 如果已經載入過，直接返回
    if (audioCache.has(romaji)) {
      return Promise.resolve(audioCache.get(romaji));
    }

    // 如果正在載入中，返回現有的 Promise
    if (loadingPromises.has(romaji)) {
      return loadingPromises.get(romaji);
    }

    // 開始載入音檔
    const loadPromise = new Promise((resolve, reject) => {
      const audio = new Audio(`/sounds/${romaji}.mp3`);

      // 監聽載入完成事件
      audio.addEventListener(
        "canplaythrough",
        () => {
          audioCache.set(romaji, audio);
          loadingPromises.delete(romaji);
          resolve(audio);
        },
        { once: true },
      );

      // 監聽錯誤事件
      audio.addEventListener(
        "error",
        (error) => {
          console.error(`Failed to load audio: ${romaji}`, error);
          loadingPromises.delete(romaji);
          reject(error);
        },
        { once: true },
      );

      // 開始載入
      audio.load();
    });

    loadingPromises.set(romaji, loadPromise);
    return loadPromise;
  };

  /**
   * 批次預載多個音檔
   * @param {Array<string>} romajiList - 羅馬拼音列表
   * @returns {Promise<Array>}
   */
  const preloadSounds = async (romajiList) => {
    const validRomaji = romajiList.filter((r) => r && r.trim() !== "");

    // 過濾掉已經載入的音檔
    const toLoad = validRomaji.filter((r) => !audioCache.has(r));

    if (toLoad.length === 0) {
      return Promise.resolve([]);
    }

    console.log(`Preloading ${toLoad.length} audio files...`);

    // 批次載入，使用 Promise.allSettled 避免單一失敗影響其他載入
    const results = await Promise.allSettled(
      toLoad.map((romaji) => preloadAudio(romaji)),
    );

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    console.log(`Preloaded ${succeeded}/${toLoad.length} audio files`);

    return results;
  };

  /**
   * 播放指定音檔
   * @param {string} romaji - 羅馬拼音
   * @returns {Promise<void>}
   */
  const playSound = async (romaji) => {
    if (!romaji || romaji.trim() === "") {
      return;
    }

    try {
      // 停止當前播放的音檔
      if (currentAudio.value) {
        currentAudio.value.pause();
        currentAudio.value.currentTime = 0;
      }

      // 如果音檔未載入，先載入
      if (!audioCache.has(romaji)) {
        await preloadAudio(romaji);
      }

      const audio = audioCache.get(romaji);
      if (!audio) {
        console.error(`Audio not found: ${romaji}`);
        return;
      }

      // 重置並播放
      audio.currentTime = 0;
      currentAudio.value = audio;
      isPlaying.value = true;

      // 設定播放結束事件
      audio.onended = () => {
        isPlaying.value = false;
      };

      await audio.play();
    } catch (error) {
      console.error(`Failed to play audio: ${romaji}`, error);
      isPlaying.value = false;
    }
  };

  /**
   * 停止播放
   */
  const stopSound = () => {
    if (currentAudio.value) {
      currentAudio.value.pause();
      currentAudio.value.currentTime = 0;
      isPlaying.value = false;
    }
  };

  /**
   * 取得快取統計資訊
   */
  const getCacheStats = () => {
    return {
      cached: audioCache.size,
      loading: loadingPromises.size,
    };
  };

  /**
   * 清除快取（通常不需要使用）
   */
  const clearCache = () => {
    stopSound();
    audioCache.clear();
    loadingPromises.clear();
  };

  /**
   * 在背景預載其他 tab 的音檔（使用 requestIdleCallback）
   * @param {Array<string>} romajiList - 羅馬拼音列表
   */
  const preloadInBackground = (romajiList) => {
    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(() => {
        preloadSounds(romajiList);
      });
    } else {
      // Fallback for browsers that don't support requestIdleCallback
      setTimeout(() => {
        preloadSounds(romajiList);
      }, 1000);
    }
  };

  return {
    preloadAudio,
    preloadSounds,
    preloadInBackground,
    playSound,
    stopSound,
    isPlaying: readonly(isPlaying),
    getCacheStats,
    clearCache,
  };
};
