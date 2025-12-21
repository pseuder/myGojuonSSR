// composables/useStructuredData.ts
// 生成 Schema.org 結構化資料的 composable

export const useStructuredData = () => {
  const config = useRuntimeConfig();
  const siteUrl = config.public.siteBase || "https://mygojuon.vercel.app";
  const { locale, t } = useI18n();

  // WebSite Schema - 用於首頁
  const getWebsiteSchema = () => {
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: t("meta.title"),
      description: t("meta.description"),
      url: siteUrl,
      inLanguage: locale.value,
      publisher: {
        "@type": "EducationalOrganization",
        name: t("meta.title"),
        url: siteUrl,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteUrl}/SongOverview?search={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    };
  };

  // Course/LearningResource Schema - 用於學習頁面
  const getCourseSchema = (pageName: string, pageDesc: string, pageUrl: string) => {
    return {
      "@context": "https://schema.org",
      "@type": "Course",
      name: pageName,
      description: pageDesc,
      provider: {
        "@type": "EducationalOrganization",
        name: t("meta.title"),
        url: siteUrl,
      },
      educationalLevel: "Beginner",
      inLanguage: ["ja", locale.value],
      teaches: "Japanese Hiragana and Katakana",
      isAccessibleForFree: true,
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "online",
        courseWorkload: "PT1H",
      },
      url: pageUrl,
    };
  };

  // VideoObject Schema - 用於歌曲頁面
  const getVideoSchema = (video: any, customDescription?: string) => {
    if (!video) return null;

    return {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: `${video.name} - ${video.author}`,
      description: customDescription || t("page_meta.song_practice.description").replace(
        "{song_name}",
        `${video.name} - ${video.author}`
      ),
      thumbnailUrl: video.source_id
        ? `https://i.ytimg.com/vi/${video.source_id}/hqdefault.jpg`
        : `${siteUrl}/favicon.png`,
      uploadDate: video.update_time || new Date().toISOString(),
      duration: "PT3M",
      contentUrl: `https://www.youtube.com/watch?v=${video.source_id}`,
      embedUrl: `https://www.youtube.com/embed/${video.source_id}`,
      inLanguage: "ja",
      educationalUse: "Learning Japanese through music",
      learningResourceType: "Music Video with Lyrics",
      keywords: video.tags || "Japanese, 50 sounds, lyrics",
    };
  };

  // BreadcrumbList Schema - 用於所有頁面
  const getBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    };
  };

  // HowTo Schema - 用於學習指南
  const getHowToSchema = (
    name: string,
    description: string,
    steps: Array<{ name: string; text: string }>
  ) => {
    return {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: name,
      description: description,
      inLanguage: locale.value,
      step: steps.map((step, index) => ({
        "@type": "HowToStep",
        position: index + 1,
        name: step.name,
        text: step.text,
      })),
    };
  };

  return {
    getWebsiteSchema,
    getCourseSchema,
    getVideoSchema,
    getBreadcrumbSchema,
    getHowToSchema,
  };
};
