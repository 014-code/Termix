<template>
  <div class="content-output">
    <!-- 上方输出内容 -->
    <div v-if="output.type === 'text'">
      <a-tag v-if="outputTagColor" :color="outputTagColor">
        {{ output.status }}
      </a-tag>
      <!--   文本   -->
      <span v-if="output.type === 'text'" v-html="smartText(output.text)"></span>
    </div>
    <!-- 下方输出组件 -->
    <!--  v-bind给组件传递一整个对象  -->
    <component v-if="output.type === 'component'" :is="output.component" v-bind="output.props ?? {}"></component>
  </div>
</template>

<script setup lang="ts">
import OutputType = Terminal.OutputType;
import {computed, toRefs} from "vue";
import smartText from "../../utils/smartText";

interface OutPutProps {
  output: OutputType
}

//输出内容
const props = defineProps<OutPutProps>()

//转成响应式对象
const {output} = toRefs(props);

/**
 * 根据类型渲染颜色标签方法
 */
const outputTagColor = computed((): string => {
  if (!output.value.status) {
    return "";
  }
  switch (output.value.status) {
    case "info":
      return "dodgerblue";
    case "success":
      return "limegreen";
    case "warning":
      return "darkorange";
    case "error":
      return "#c0300f";
    case "system":
      return "#bfc4c9";
    default:
      return "";
  }
});

</script>

<style scoped>
.content-output :deep(.ant-tag) {
  border-radius: 0;
  font-size: 16px;
  border: none;
}
</style>