<script setup lang="ts">
import type { IconKey } from '~/types/icon'
import { ICON_MAP } from '~/utils/icons'

interface Props {
  name: IconKey
  size?: number
  stroke?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 20,
  stroke: 2,
})

const iconNodes = computed(() => ICON_MAP[props.name] ?? ICON_MAP['help-circle'])
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    :stroke-width="stroke"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <component :is="node.tag" v-for="(node, index) in iconNodes" :key="index" v-bind="node.attrs" />
  </svg>
</template>
