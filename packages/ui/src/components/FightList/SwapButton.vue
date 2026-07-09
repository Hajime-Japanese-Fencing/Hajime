<script setup lang="ts">
import { CgArrowsExchange, CgArrowsExchangeAlt } from "vue-icons-plus/cg";
//import RoundButton from "../Actions/Button/RoundButton.vue";

  /*
  * Le swap de DaisyUi ne semble fonctionner qu'a l'interieur d'une balise 'label'
  */

</script>

<template>

  <label class="btn btn-circle btn-outline btn-sm swap swap-rotate bg-neutral text-neutral-content tooltip"
         data-tip="Swap side colors">
    <input type="checkbox" @click.stop/>

    <CgArrowsExchange class="swap-on"/>
    <CgArrowsExchangeAlt class="swap-off"/>
  </label>

  <!--
  <RoundButton
    data-tip="Swap side colors"
    variant="outline"
    size="sm"
    class="tooltip bg-neutral text-neutral-content swap swap-rotate"
  >
    <input type="checkbox" />
    <CgArrowsExchange class="swap-on"/>
    <CgArrowsExchangeAlt class="swap-off"/>
  </RoundButton>
  -->
</template>
