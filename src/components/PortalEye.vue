<template>
  <svg class="a" :class="{'open': open}" viewBox="0 0 24 24">
    <circle class="b" fill="currentColor" cx="12" cy="12" r="10"></circle>
    <circle class="c" fill="white" cx="12" cy="12" r="6"></circle>
  </svg>
</template>

<script setup>
defineProps({ open: Boolean })
</script>

<style lang="postcss" scoped>
.b,
.c {
  @apply transition-all duration-500;
}
.a:not(.open) .b {
  /* @apply scale-50 translate-x-[25%] translate-y-[25%]; */
  @apply scale-75 translate-x-[12.5%] translate-y-[12.5%];
}
.a:not(.open) .c {
  @apply scale-0 translate-x-1/2 translate-y-1/2;
}
</style>