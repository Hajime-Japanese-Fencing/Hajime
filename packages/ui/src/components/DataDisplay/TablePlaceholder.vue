<script setup lang="ts">
withDefaults(
  defineProps<{
    rows?: number;
    columns?: number;
  }>(),
  {
    rows: 5,
    columns: 4,
  },
);
</script>

<template>
  <div class="overflow-x-auto rounded-box shadow-md">
    <table class="table">
      <thead>
        <tr>
          <th v-for="col in columns" :key="col">
            <div class="skeleton h-4 w-24"></div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row">
          <td v-for="col in columns" :key="col">
            <div
              class="skeleton h-4"
              :class="col === 1 ? 'w-40' : col === columns ? 'w-16' : 'w-28'"
            ></div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
