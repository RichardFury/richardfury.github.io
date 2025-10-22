<template>
  <div class="preloader" id="preloader-container">
    <div class="logo">
      <svg width="47.56" height="75.25" viewBox="0 0 47.56 80.25" xmlns="http://www.w3.org/2000/svg" style="vertical-align: text-top; ">
          <g id="svgGroup" stroke-linecap="round" stroke="#000" fill="transparent" style="fill:transparent; fill-opacity:0;
            stroke:#444444;
            stroke-width:4px;"><path d="M36.61 75.25L36.61 75.25Q32.55 75.25 25.41 67.34L25.41 67.34Q23.03 64.61 20.79 61.70Q18.55 58.80 16.59 55.72L16.59 55.72Q15.82 55.65 15.12 55.51Q14.42 55.37 13.79 55.23L13.79 55.23Q6.65 68.74 6.65 73.01L6.65 73.01Q6.65 73.36 6.72 73.57L6.72 73.57L6.72 74.06Q6.72 75.04 6.02 75.04L6.02 75.04Q4.90 75.04 4.90 73.15L4.90 73.15Q4.90 68.18 11.41 54.46L11.41 54.46Q8.05 52.85 8.05 50.12L8.05 50.12Q8.05 48.51 9.17 47.32L9.17 47.32Q10.36 46.06 11.83 46.06L11.83 46.06Q13.51 46.06 14.77 47.74L14.77 47.74Q15.54 46.34 16.70 44.27Q17.85 42.21 19.39 39.62L19.39 39.62Q20.58 38.15 23.03 38.15L23.03 38.15Q24.01 38.15 24.01 38.64L24.01 38.64Q24.01 38.78 23.80 39.13L23.80 39.13Q21.77 41.93 19.92 44.77Q18.06 47.60 16.45 50.54L16.45 50.54L18.76 54.67Q21.84 54.46 24.89 53.69Q27.93 52.92 30.52 51.80L30.52 51.80Q34.02 50.26 36.16 48.27Q38.29 46.27 39.13 43.96L39.13 43.96Q39.34 43.40 39.41 42.84Q39.48 42.28 39.48 41.79L39.48 41.79Q39.48 37.10 33.32 35.98L33.32 35.98Q29.05 35.14 23.66 35.14L23.66 35.14Q17.85 35.14 12.15 36.15Q6.44 37.17 0.84 39.20L0.84 39.20Q0.56 39.27 0.39 39.30Q0.21 39.34 0.07 39.34L0.07 39.34Q-0.42 39.34-0.42 38.92L-0.42 38.92Q-0.42 38.08 0.77 37.03L0.77 37.03Q1.75 36.05 2.73 35.77L2.73 35.77Q10.43 33.25 20.65 33.25L20.65 33.25Q27.93 33.25 34.65 34.72L34.65 34.72Q42.56 36.54 42.56 42.28L42.56 42.28Q42.56 43.96 41.58 46.06L41.58 46.06Q40.46 48.37 38.40 50.16Q36.33 51.94 33.53 53.20L33.53 53.20Q28.91 55.37 22.89 55.79L22.89 55.79Q22.19 55.86 21.21 55.89Q20.23 55.93 19.46 55.86L19.46 55.86Q20.86 58.10 22.89 60.69Q24.92 63.28 27.51 66.15L27.51 66.15Q34.09 73.43 37.17 73.43L37.17 73.43Q38.85 73.43 38.85 71.61L38.85 71.61Q38.85 71.33 38.82 71.02Q38.78 70.70 38.71 70.35L38.71 70.35Q38.50 69.58 38.50 69.30L38.50 69.30Q38.50 68.67 39.06 68.67L39.06 68.67Q40.25 68.67 40.25 71.47L40.25 71.47Q40.25 72.94 39.20 74.13L39.20 74.13Q38.15 75.25 36.61 75.25ZM11.83 53.55L11.83 53.55L13.51 50.19Q12.81 48.86 11.83 48.86L11.83 48.86Q10.29 48.86 10.29 50.89L10.29 50.89Q10.29 52.50 11.83 53.55ZM15.96 54.74L15.96 54.74L14.98 53.06L14.21 54.46Q14.56 54.53 15.02 54.60Q15.47 54.67 15.96 54.74Z" style="stroke-dasharray: 331, 333; stroke-dashoffset: 332;"><animate attributeName="stroke-dashoffset" to="0" dur="1000ms" calcMode="linear" repeatCount="1" fill="freeze" begin="0ms"></animate><animate attributeName="fill-opacity" to="1" dur="1000ms" calcMode="linear" repeatCount="1" fill="freeze" begin="0ms"></animate></path></g>
      </svg>
      <svg width="22.01" height="71.19" viewBox="0 0 22.01 76.19" xmlns="http://www.w3.org/2000/svg" style="vertical-align: text-top; ">
          <g id="svgGroup" stroke-linecap="round" stroke="#000" fill="transparent" style="fill:transparent; fill-opacity:0;
            stroke:#444444;
            stroke-width:4px;"><path d="M9.73 52.15L9.73 52.15Q8.05 52.15 8.05 50.47L8.05 50.47Q8.05 49.63 8.68 49L8.68 49Q9.38 48.30 10.29 48.30L10.29 48.30Q11.97 48.30 11.97 49.98L11.97 49.98Q11.97 50.82 11.34 51.45L11.34 51.45Q10.64 52.15 9.73 52.15ZM5.67 71.19L5.67 71.19Q1.82 71.19 1.82 67.06L1.82 67.06Q1.82 65.10 3.22 61.32L3.22 61.32Q3.85 59.57 4.52 58.34Q5.18 57.12 5.88 56.07L5.88 56.07Q6.30 55.44 6.86 55.44L6.86 55.44Q7.42 55.44 7.98 56L7.98 56Q8.33 56.35 8.33 56.91L8.33 56.91Q8.33 57.40 8.05 57.89L8.05 57.89Q6.51 60.27 5.53 62.69Q4.55 65.10 4.55 66.99L4.55 66.99Q4.55 69.51 6.37 69.51L6.37 69.51Q7.35 69.51 8.61 68.98Q9.87 68.46 11.13 67.34L11.13 67.34Q11.97 66.57 12.92 65.59Q13.86 64.61 14.84 63.28L14.84 63.28Q16.66 61.04 16.66 61.04L16.66 61.04Q17.01 61.04 17.01 61.60L17.01 61.60Q17.01 62.16 16.52 62.72L16.52 62.72Q10.15 71.19 5.67 71.19Z" style="stroke-dasharray: 78, 80; stroke-dashoffset: 79;"><animate attributeName="stroke-dashoffset" to="0" dur="1000ms" calcMode="linear" repeatCount="1" fill="freeze" begin="200ms"></animate><animate attributeName="fill-opacity" to="1" dur="1000ms" calcMode="linear" repeatCount="1" fill="freeze" begin="200ms"></animate></path></g>
      </svg>
      <svg width="24.950000000000003" height="70.56" viewBox="0 0 24.950000000000003 75.56" xmlns="http://www.w3.org/2000/svg" style="vertical-align: text-top; ">
          <g id="svgGroup" stroke-linecap="round" stroke="#000" fill="transparent" style="fill:transparent; fill-opacity:0;
            stroke:#444444;
            stroke-width:4px;"><path d="M7.56 70.56L7.56 70.56Q2.31 70.56 2.31 64.96L2.31 64.96Q2.31 63.14 3.36 61.18Q4.41 59.22 6.30 57.19L6.30 57.19Q10.22 53.06 13.51 53.06L13.51 53.06Q15.75 53.06 15.75 54.81L15.75 54.81Q15.75 55.44 14.77 57.19L14.77 57.19Q13.72 58.94 13.09 58.94L13.09 58.94Q12.81 58.94 12.81 58.59L12.81 58.59Q12.81 58.31 13.02 57.68L13.02 57.68Q13.30 57.12 13.30 56.70L13.30 56.70Q13.30 55.23 11.48 55.23L11.48 55.23Q10.71 55.23 9.52 56.03Q8.33 56.84 7.35 58.45L7.35 58.45Q5.53 61.46 5.53 63.98L5.53 63.98Q5.53 68.25 9.17 68.25L9.17 68.25Q10.71 68.25 12.57 67.34Q14.42 66.43 16.14 65.00Q17.85 63.56 18.76 62.02L18.76 62.02Q19.32 61.18 19.67 61.18L19.67 61.18Q19.95 61.18 19.95 61.39L19.95 61.39L19.95 61.67Q19.95 61.81 19.92 62.02Q19.88 62.23 19.74 62.37L19.74 62.37Q18.69 63.91 17.22 65.48Q15.75 67.06 13.30 68.67L13.30 68.67Q12.04 69.51 10.54 70.03Q9.03 70.56 7.56 70.56Z" style="stroke-dasharray: 87, 89; stroke-dashoffset: 88;"><animate attributeName="stroke-dashoffset" to="0" dur="1000ms" calcMode="linear" repeatCount="1" fill="freeze" begin="400ms"></animate><animate attributeName="fill-opacity" to="1" dur="1000ms" calcMode="linear" repeatCount="1" fill="freeze" begin="400ms"></animate></path></g>
      </svg>
      <svg width="36.08" height="70.42" viewBox="0 0 36.08 75.42" xmlns="http://www.w3.org/2000/svg" style="vertical-align: text-top; ">
          <g id="svgGroup" stroke-linecap="round" stroke="#000" fill="transparent" style="fill:transparent; fill-opacity:0;
            stroke:#444444;
            stroke-width:4px;"><path d="M16.03 70.42L16.03 70.42Q12.25 70.42 12.25 65.87L12.25 65.87Q12.25 64.33 12.85 62.20Q13.44 60.06 14.35 58.24L14.35 58.24Q13.37 59.15 11.90 60.62Q10.43 62.09 9.03 63.84L9.03 63.84Q6.30 67.20 4.83 69.65L4.83 69.65Q4.06 70.21 3.01 70.21L3.01 70.21Q1.12 70.21 1.12 69.30L1.12 69.30Q1.12 68.53 1.89 66.43Q2.66 64.33 4.13 60.97L4.13 60.97Q6.37 55.86 8.86 51.13Q11.34 46.41 14.14 42.07L14.14 42.07Q22.61 28.56 28.07 28.56L28.07 28.56Q31.08 28.56 31.08 31.99L31.08 31.99Q31.08 36.47 23.80 44.52L23.80 44.52Q22.26 46.20 19.64 48.83Q17.01 51.45 13.09 55.02L13.09 55.02Q12.18 55.86 10.47 57.33Q8.75 58.80 7.00 60.55L7.00 60.55Q6.79 60.83 6.44 61.67Q6.09 62.51 5.53 63.84L5.53 63.84Q4.41 66.57 4.41 67.27L4.41 67.27Q4.48 67.34 4.48 67.48L4.48 67.48Q5.25 66.50 6.76 64.86Q8.26 63.21 10.01 61.25L10.01 61.25Q11.62 59.50 13.09 57.96Q14.56 56.42 15.40 55.86L15.40 55.86Q16.03 55.44 16.52 55.44L16.52 55.44Q17.92 55.44 17.92 56.91L17.92 56.91L16.24 60.55Q14.56 64.19 14.56 66.29L14.56 66.29Q14.56 68.74 16.94 68.74L16.94 68.74Q18.90 68.74 21.14 66.71L21.14 66.71Q22.75 65.31 24.43 62.93L24.43 62.93L25.97 60.76Q26.11 60.55 26.32 60.55L26.32 60.55Q26.53 60.55 26.71 60.76Q26.88 60.97 26.74 61.25L26.74 61.25Q26.60 61.67 26.11 62.37L26.11 62.37Q23.73 65.87 21.21 68.14Q18.69 70.42 16.03 70.42ZM7.84 58.10L7.84 58.10Q10.29 56.28 13.55 53.27Q16.80 50.26 20.44 45.99L20.44 45.99Q28.63 36.54 28.63 32.55L28.63 32.55Q28.63 30.24 27.09 30.24L27.09 30.24Q23.31 30.24 16.38 41.86L16.38 41.86Q14.00 45.85 11.73 50.05Q9.45 54.25 7.84 58.10Z" style="stroke-dasharray: 268, 270; stroke-dashoffset: 269;"><animate attributeName="stroke-dashoffset" to="0" dur="1000ms" calcMode="linear" repeatCount="1" fill="freeze" begin="600ms"></animate><animate attributeName="fill-opacity" to="1" dur="1000ms" calcMode="linear" repeatCount="1" fill="freeze" begin="600ms"></animate></path></g>
      </svg>
      <svg width="30.69" height="70.21" viewBox="0 0 30.69 75.21" xmlns="http://www.w3.org/2000/svg" style="vertical-align: text-top; ">
          <g id="svgGroup" stroke-linecap="round" stroke="#000" fill="transparent" style="fill:transparent; fill-opacity:0;
            stroke:#444444;
            stroke-width:4px;"><path d="M3.43 70.21L3.43 70.21Q1.26 70.21 1.26 67.83L1.26 67.83Q1.26 64.26 4.76 59.08L4.76 59.08Q8.19 53.97 11.55 52.78L11.55 52.78Q12.18 52.57 12.74 52.43Q13.30 52.29 13.86 52.29L13.86 52.29Q16.38 52.29 17.50 54.04L17.50 54.04Q17.71 54.32 17.71 54.53L17.71 54.53Q17.71 54.67 17.22 54.74L17.22 54.74Q16.80 54.81 16.52 55.23L16.52 55.23Q14.84 57.96 14.84 63.42L14.84 63.42Q14.84 68.46 17.01 68.46L17.01 68.46Q18.48 68.46 21.28 65.38L21.28 65.38Q21.70 64.96 22.47 63.91Q23.24 62.86 24.01 61.77Q24.78 60.69 25.06 60.34L25.06 60.34Q25.27 60.13 25.41 60.13L25.41 60.13Q25.69 60.13 25.69 60.62L25.69 60.62Q25.69 60.97 25.27 61.60L25.27 61.60Q23.73 64.05 21.77 66.36Q19.81 68.67 18.41 69.37L18.41 69.37Q17.15 70 15.89 70L15.89 70Q11.62 70 11.62 63.98L11.62 63.98Q11.62 63.49 11.66 62.96Q11.69 62.44 11.76 61.88L11.76 61.88Q7.00 70.21 3.43 70.21ZM4.62 68.11L4.62 68.11Q5.39 68.11 6.44 67.23Q7.49 66.36 8.61 64.89L8.61 64.89Q10.29 62.65 11.76 60.13Q13.23 57.61 14.35 54.67L14.35 54.67Q14.14 54.60 13.72 54.60L13.72 54.60Q10.85 54.60 7.91 58.17L7.91 58.17Q3.64 63.28 3.64 66.64L3.64 66.64Q3.64 68.11 4.62 68.11Z" style="stroke-dasharray: 131, 133; stroke-dashoffset: 132;"><animate attributeName="stroke-dashoffset" to="0" dur="1000ms" calcMode="linear" repeatCount="1" fill="freeze" begin="800ms"></animate><animate attributeName="fill-opacity" to="1" dur="1000ms" calcMode="linear" repeatCount="1" fill="freeze" begin="800ms"></animate></path></g>
      </svg>
      <svg width="30.340000000000003" height="71.12" viewBox="0 0 30.340000000000003 76.12" xmlns="http://www.w3.org/2000/svg" style="vertical-align: text-top; ">
          <g id="svgGroup" stroke-linecap="round" stroke="#000" fill="transparent" style="fill:transparent; fill-opacity:0;
            stroke:#444444;
            stroke-width:4px;"><path d="M14.21 71.12L14.21 71.12Q11.83 71.12 10.89 69.86Q9.94 68.60 9.94 66.64L9.94 66.64Q9.94 65.03 10.47 63.24Q10.99 61.46 11.76 59.92Q12.53 58.38 13.09 57.47L13.09 57.47Q12.88 57.54 12.67 57.58Q12.46 57.61 12.18 57.61L12.18 57.61Q11.20 57.61 10.01 56.91L10.01 56.91Q8.75 56.07 8.75 55.16L8.75 55.16Q8.33 56.14 7.60 57.40Q6.86 58.66 5.88 60.13L5.88 60.13Q3.29 64.19 2.45 64.19L2.45 64.19Q2.17 64.19 2.17 63.91L2.17 63.91Q2.17 63.63 2.59 63.07L2.59 63.07Q3.92 61.25 5.29 58.87Q6.65 56.49 8.05 53.55L8.05 53.55Q7.98 53.20 7.95 52.85Q7.91 52.50 7.91 52.01L7.91 52.01Q7.91 50.40 8.54 48.30L8.54 48.30Q9.31 45.64 10.43 45.64L10.43 45.64Q11.13 45.64 11.76 46.90L11.76 46.90Q11.97 47.39 12.11 47.84Q12.25 48.30 12.25 48.79L12.25 48.79Q12.25 50.47 9.38 53.90L9.38 53.90Q10.01 56.07 11.83 56.07L11.83 56.07Q13.16 56.07 14.28 54.74L14.28 54.74Q15.47 53.34 15.96 53.34L15.96 53.34Q16.59 53.34 17.08 53.83L17.08 53.83Q17.57 54.32 17.57 55.09L17.57 55.09Q17.57 55.02 16.70 56.35Q15.82 57.68 14.70 60.06L14.70 60.06Q13.58 62.44 13.13 64.12Q12.67 65.80 12.67 67.13L12.67 67.13Q12.67 69.58 14.98 69.58L14.98 69.58Q17.22 69.58 20.65 66.15L20.65 66.15Q21.77 64.96 23.24 63.14L23.24 63.14Q25.06 60.90 25.06 60.90L25.06 60.90Q25.34 60.90 25.34 61.32L25.34 61.32Q25.34 61.88 24.92 62.51L24.92 62.51Q23.94 64.05 22.79 65.56Q21.63 67.06 20.65 67.97L20.65 67.97Q17.43 71.12 14.21 71.12Z" style="stroke-dasharray: 122, 124; stroke-dashoffset: 123;"><animate attributeName="stroke-dashoffset" to="0" dur="1000ms" calcMode="linear" repeatCount="1" fill="freeze" begin="1000ms"></animate><animate attributeName="fill-opacity" to="1" dur="1000ms" calcMode="linear" repeatCount="1" fill="freeze" begin="1000ms"></animate></path></g>
      </svg>
      <svg width="36.92" height="70" viewBox="0 0 36.92 75" xmlns="http://www.w3.org/2000/svg" style="vertical-align: text-top; ">
          <g id="svgGroup" stroke-linecap="round" stroke="#000" fill="transparent" style="fill:transparent; fill-opacity:0;
            stroke:#444444;
            stroke-width:4px;"><path d="M3.29 70L3.29 70Q1.12 70 1.12 67.62L1.12 67.62Q1.12 63.28 5.53 57.61L5.53 57.61Q7.84 54.60 10.08 53.09Q12.32 51.59 14.49 51.80L14.49 51.80Q15.68 47.74 16.94 44.24Q18.20 40.74 19.67 37.73L19.67 37.73Q24.43 27.93 28.98 27.93L28.98 27.93Q31.92 27.93 31.92 31.29L31.92 31.29Q31.92 38.64 15.19 58.31L15.19 58.31Q14.77 60.69 14.77 62.93L14.77 62.93Q14.77 68.25 17.01 68.25L17.01 68.25Q18.48 68.25 21.28 64.89L21.28 64.89Q24.08 61.46 24.36 61.46L24.36 61.46Q24.57 61.46 24.57 61.81L24.57 61.81Q24.57 62.23 24.22 62.79L24.22 62.79Q19.88 69.86 15.68 69.86L15.68 69.86Q12.04 69.86 12.04 64.33L12.04 64.33Q12.04 62.58 12.46 60.27L12.46 60.27Q7.00 70 3.29 70ZM15.61 56.28L15.61 56.28Q29.19 37.87 29.19 31.43L29.19 31.43Q29.19 29.89 27.93 29.89L27.93 29.89Q24.43 29.89 20.16 41.30L20.16 41.30Q17.29 48.86 15.61 56.28ZM4.48 67.83L4.48 67.83Q6.09 67.83 8.47 64.68L8.47 64.68Q8.96 64.12 9.70 62.89Q10.43 61.67 11.48 59.85L11.48 59.85Q12.67 57.82 13.20 56.63Q13.72 55.44 13.72 55.09L13.72 55.09Q13.72 54.95 13.69 54.95Q13.65 54.95 13.58 54.88L13.58 54.88Q13.51 54.67 12.81 54.67L12.81 54.67Q10.01 54.67 6.72 59.01L6.72 59.01Q3.43 63.35 3.43 66.29L3.43 66.29Q3.43 67.83 4.48 67.83Z" style="stroke-dasharray: 248, 250; stroke-dashoffset: 249;"><animate attributeName="stroke-dashoffset" to="0" dur="1000ms" calcMode="linear" repeatCount="1" fill="freeze" begin="1200ms"></animate><animate attributeName="fill-opacity" to="1" dur="1000ms" calcMode="linear" repeatCount="1" fill="freeze" begin="1200ms"></animate></path></g>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { gsap } from "gsap";
import { onMounted } from "vue";

onMounted(() => {
  const preloader = document.getElementById('preloader-container');
  setTimeout(() => {
    gsap.to(preloader, {
      duration: 1,
      opacity: 0,
      y: -999,
      ease: 'power2.out',
      onComplete: () => {
        preloader.style.display = 'none';
      }
    });
  }, 2000);
});
</script>

<style scoped>
.preloader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--preloader-bg-light);
  transition: background-color 1s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: bgColorChange 10s infinite alternate;
}

/* 移除.loader相关样式 */

#rPath, #fPath {
  stroke: #fff;
}

@keyframes bgColorChange {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@media (prefers-color-scheme: dark) {
  .preloader {
    background: var(--preloader-bg-dark);
  }
}
</style>