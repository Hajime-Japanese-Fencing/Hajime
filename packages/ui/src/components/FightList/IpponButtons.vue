<script setup lang="ts">
  interface IpponType {
    code: string;
    label: string;
  }

  const ippons: IpponType[] = [
    { code: "M", label: "Men" },
    { code: "D", label: "Do" },
    { code: "K", label: "Kote" },
    { code: "T", label: "Tsuki" },
    { code: "Ht", label: "Hantei" },
    { code: "Δ", label: "Hansoku" },
  ];

  const emit = defineEmits<{
    (e: "addIppon", code: string): void;
  }>();

</script>

<template>
  <div class="flex justify-center gap-2">
    <button
        v-for="ippon in ippons"
        :key="ippon.code"
        class="btn btn-xs btn-outline btn-circle tooltip"
        :data-tip="ippon.label"
        @click="emit('addIppon', ippon.code)"
    >
      {{ ippon.code }}
    </button>
  </div>
</template>

<style scoped>

</style>