<template>
  <div class="life-page-container">
    <PhotographySection />
    <OutdoorSection />
    <BandSection />
  </div>
</template>

<script setup>
import PhotographySection from './PhotographySection.vue';
import OutdoorSection from './OutdoorSection.vue';
import BandSection from './BandSection.vue';
</script>

<style scoped>
.life-page-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  max-width: 80vw;
  margin: 0 auto 2rem;
  padding: 0 10%;
}
</style>