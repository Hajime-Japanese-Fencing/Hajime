<script setup lang="ts">

interface Fight {
  id: number;
  fighter1: string;
  fighter2: string;
  score: string | null;
  status: string;
}

defineProps<{
  fight: Fight;
}>();

</script>

<template>

  <td class="flex justify-end">
    <section class="p-6 flex flex-col gap-8">

      <div class="col-span-4">
        <button class="btn btn-xs btn-outline btn-circle mx-1" title="Men">M</button>
        <button class="btn btn-xs btn-outline btn-circle mx-1" title="Do">D</button>
        <button class="btn btn-xs btn-outline btn-circle mx-1" title="Kote">K</button>
        <button class="btn btn-xs btn-outline btn-circle mx-1" title="Tsuki">T</button>
        <button class="btn btn-xs btn-outline btn-circle mx-1" title="Hantei">Ht</button>
        <button class="btn btn-xs btn-outline btn-circle mx-1" title="Hansoku">Δ</button>
      </div>

      <!-- Zone des ippons -->
      <div class="min-h-28 rounded-lg p-4">
        <div class="flex flex-wrap gap-3 justify-center">
          <div class="btn btn-circle btn-lg btn-outline">M</div>
          <div class="btn btn-circle btn-lg btn-ghost">K</div>
        </div>
      </div>

    </section>
  </td>
  <td></td>
  <td class="flex justify-start">
    <section class="p-6 flex flex-col gap-8">

      <div class="col-span-4">
        <button class="btn btn-xs btn-outline btn-circle mx-1" title="Men">M</button>
        <button class="btn btn-xs btn-outline btn-circle mx-1" title="Do">D</button>
        <button class="btn btn-xs btn-outline btn-circle mx-1" title="Kote">K</button>
        <button class="btn btn-xs btn-outline btn-circle mx-1" title="Tsuki">T</button>
        <button class="btn btn-xs btn-outline btn-circle mx-1" title="Hantei">Ht</button>
        <button class="btn btn-xs btn-outline btn-circle mx-1" title="Hansoku">Δ</button>
      </div>

      <!-- Zone des ippons -->
      <div class="min-h-28 rounded-lg p-4">
        <div class="flex flex-wrap gap-3 justify-center">
          <div class="btn btn-circle btn-lg btn-ghost">D</div>
        </div>
      </div>

    </section>
  </td>
  <td></td>
  <td>
    <div class="flex flex-col gap-2">
      <button class="btn btn-outline btn-sm">Cancel</button>
      <button class="btn btn-primary btn-sm">Validate</button>
    </div>
  </td>


</template>

<style scoped>

</style>