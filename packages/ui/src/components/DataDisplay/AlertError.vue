<script setup lang="ts">
import { CircleAlert } from "lucide-vue-next";
</script>

<template>
  <div role="alert" class="alert alert-error">
    <CircleAlert class="size-5 shrink-0" />
    <slot />
  </div>
</template>
