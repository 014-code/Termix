<template>
  <div>关于本站：Termix 极客范儿的浏览器主页</div>
  <div>
    <a href="https://github.com/014-code/Termix" target="_blank">
      代码开源，欢迎 star 和贡献~
    </a>
  </div>
  <div></div>
  <div>
    作者：
    <a href="https://github.com/014-code" target="_blank">
      014
    </a>
  </div>
</template>

<script setup lang="ts">
interface InfoBoxProps {
  seconds: string;
}

const props = withDefaults(defineProps<InfoBoxProps>(), {});
</script>

<style scoped></style>
