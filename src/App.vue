<script setup lang="ts">
import { onMounted } from 'vue'
import { useTheme } from './composables/useTheme'
import { useI18n } from 'vue-i18n'
import BaseLayout from './components/layout/BaseLayout.vue'

const { initTheme } = useTheme()
const { locale } = useI18n()

onMounted(() => {
  initTheme()
  // Set initial locale from settings (default to zh-CN)
  locale.value = 'zh-CN'
})
</script>

<template>
  <BaseLayout />
</template>

<style>
@import './assets/styles/main.css';
</style>
