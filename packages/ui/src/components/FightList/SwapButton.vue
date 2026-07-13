<script setup lang="ts">
import { ArrowLeftRight } from "lucide-vue-next";

/*
 * Le swap de DaisyUI ne fonctionne qu'à l'intérieur d'une balise 'label' — contrainte daisyUI swap.
 * Ne pas remplacer par Button.vue : le composant swap nécessite un <input type="checkbox"> enfant direct du label.
 */
</script>

<template>
  <label
    class="btn btn-circle btn-outline btn-sm swap swap-rotate bg-neutral text-neutral-content tooltip"
    data-tip="Swap side colors"
  >
    <input type="checkbox" @click.stop />

    <ArrowLeftRight class="swap-on" />
    <ArrowLeftRight class="swap-off" />
  </label>
</template>
