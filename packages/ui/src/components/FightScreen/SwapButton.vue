<script setup lang="ts">
import { CgArrowsExchange } from "vue-icons-plus/cg";
import RoundButton from "../Button/RoundButton.vue";
</script>

<template>
  <RoundButton
    data-tip="Swap side colors"
    variant="outline"
    size="sm"
    class="tooltip bg-neutral text-neutral-content"
  >
    <CgArrowsExchange />
  </RoundButton>
</template>
