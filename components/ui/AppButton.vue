<script setup lang="ts">
type ButtonVariant = 'primary' | 'secondary' | 'text' | 'icon'
type ButtonSize = 'sm' | 'md' | 'lg'

interface Props {
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const isDisabled = computed(() => props.disabled || props.loading)

const variantClasses: Record<ButtonVariant, string> = {
  primary: `
    bg-theme-primary text-white shadow-sm
    hover:bg-theme-primary-hover hover:shadow-md hover:-translate-y-px
    active:bg-theme-primary-active active:shadow-none active:translate-y-0
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
  `,
  secondary: `
    bg-transparent text-theme-text-secondary border border-theme-border
    hover:bg-theme-surface-secondary hover:border-theme-border-hover
    active:bg-theme-surface-secondary
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
  text: `
    px-0 py-2 text-theme-primary
    hover:underline
    active:text-theme-primary-active
  `,
  icon: `
    text-theme-text-muted
    hover:bg-theme-surface-secondary hover:text-theme-text-secondary
    active:bg-theme-surface-secondary
  `,
}

const sizeClasses: Record<ButtonVariant, Record<ButtonSize, string>> = {
  primary: {
    sm: 'h-9 px-4 text-body-sm',
    md: 'h-12 px-6 text-body-md',
    lg: 'h-14 px-8 text-body-lg',
  },
  secondary: {
    sm: 'h-9 px-4 text-body-sm',
    md: 'h-12 px-6 text-body-md',
    lg: 'h-14 px-8 text-body-lg',
  },
  text: {
    sm: 'text-caption',
    md: 'text-body-sm',
    lg: 'text-body-md',
  },
  icon: {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  },
}

const buttonClasses = computed(() => [
  'inline-flex items-center justify-center font-medium transition-all duration-fast rounded-md',
  variantClasses[props.variant],
  sizeClasses[props.variant][props.size],
])

function handleClick(event: MouseEvent) {
  if (!isDisabled.value) {
    emit('click', event)
  }
}
</script>

<template>
  <button :type="type" :disabled="isDisabled" :class="buttonClasses" @click="handleClick">
    <AppSpinner v-if="loading" size="sm" class="mr-2" />
    <slot />
  </button>
</template>
