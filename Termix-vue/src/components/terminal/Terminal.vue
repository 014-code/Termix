<template>
  <!-- 终端最外层容器 -->
  <!-- :style 动态绑定样式，@click 点击空白区域聚焦输入框 -->
  <div class="terminal-wrapper" :style="wrapperStyle" @click="handleClickWrapper">

    <!-- 终端主区域，包含输出内容和输入框 -->
    <!-- ref 用于获取 DOM 元素实现滚动到底部 -->
    <div ref="terminalRef" class="terminal">

      <!-- 折叠面板组件 -->
      <!-- v-model:activeKey 控制哪些面板展开 -->
      <!-- :bordered="false" 无边框，expand-icon-position="right" 展开图标在右侧 -->
      <a-collapse v-model:activeKey="activeKeys" :bordered="false" expand-icon-position="right">

        <!-- 遍历输出列表，渲染每一条输出 -->
        <!-- v-for 循环 outputList，每个 output 都有唯一 key -->
        <template v-for="(output, index) in outputList" :key="index">

          <!-- 可折叠的输出 -->
          <!-- v-if 当 output.collapsible 为 true 时渲染折叠面板 -->
          <a-collapse-panel v-if="output.collapsible" :key="index" class="terminal-row">

            <!-- 折叠面板 header（标题部分） -->
            <template #header>
              <!-- 用户不可选择文本，右侧 10px 间距 -->
              <span style="user-select: none; margin-right: 10px">{{ prompt }}</span>
              <!-- 输出文本 -->
              <span>{{ output.text }}</span>
            </template>

            <!-- 折叠面板内容区域 -->
            <!-- 遍历该命令的结果列表 -->
            <div v-for="(result, idx) in output.resultList" :key="idx" class="terminal-row">
              <!-- ContentOutput 组件渲染具体输出内容 -->
              <content-output :output="result"/>
            </div>
          </a-collapse-panel>

          <!-- 不可折叠的输出 -->
          <template v-else>

            <!-- 命令类型输出 -->
            <!-- v-if 当 output.type === 'command' 时渲染 -->
            <template v-if="output.type === 'command'">
              <!-- 命令行显示 -->
              <div class="terminal-row">
                <span style="user-select: none; margin-right: 10px">{{ prompt }}</span>
                <span>{{ output.text }}</span>
              </div>
              <!-- 命令结果列表 -->
              <div v-for="(result, idx) in output.resultList" :key="idx" class="terminal-row">
                <content-output :output="result"/>
              </div>
            </template>

            <!-- 其他类型输出（文本、组件等） -->
            <template v-else>
              <div class="terminal-row">
                <content-output :output="output"/>
              </div>
            </template>

          </template>
        </template>
      </a-collapse>

      <!-- 输入框所在行 -->
      <div class="terminal-row">

        <!-- Ant Design 输入框组件 -->
        <!-- ref 用于聚焦输入框 -->
        <!-- v-model:value 双向绑定输入文本 -->
        <!-- :disabled 正在执行命令时禁用输入 -->
        <!-- :bordered="false" 无边框 -->
        <!-- autofocus 自动聚焦 -->
        <!-- @press-enter 按回车提交命令 -->
        <a-input
            ref="commandInputRef"
            v-model:value="inputCommand.text"
            :disabled="isRunning"
            class="command-input"
            :placeholder="inputCommand.placeholder"
            :bordered="false"
            autofocus
            @press-enter="doSubmitCommand"
        >
          <!-- 输入框前缀，显示命令提示符 -->
          <template #addonBefore>
            <span class="command-input-prompt">{{ prompt }}</span>
          </template>
        </a-input>

      </div>

      <!-- 命令提示行 -->
      <!-- v-if 有 hint 且不在执行命令时显示 -->
      <div v-if="hint && !isRunning" class="terminal-row" style="color: #bbb">
        我猜你想要：{{ hint }}
      </div>

      <!-- 底部留白 -->
      <div style="margin-bottom: 16px"/>

    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Vue 核心导入
 * computed - 计算属性，用于派生状态
 * onMounted - 组件挂载后执行
 * ref - 响应式引用
 * toRefs - 将对象转换为响应式 ref
 * provide - 向子组件提供数据
 * readonly - 创建只读响应式对象
 * watchEffect - 监听响应式变化并执行副作用
 */
import {computed, onMounted, ref, toRefs, provide, readonly, nextTick, watchEffect} from "vue";

/**
 * 类型定义导入
 * OutputType - 输出类型（text、command、component）
 * CommandOutputType - 命令输出类型
 * CommandInputType - 命令输入类型
 * TerminalType - 终端类型（包含所有终端方法）
 * TextOutputType - 文本输出类型
 * OutputStatusType - 输出状态类型（info、success、warning、error、system）
 */
import OutputType = Terminal.OutputType;
import CommandOutputType = Terminal.CommandOutputType;
import CommandInputType = Terminal.CommandInputType;
import TerminalType = Terminal.TerminalType;
import TextOutputType = Terminal.TextOutputType;
import OutputStatusType = Terminal.OutputStatusType;

/**
 * 快捷键注册函数
 * 用于处理全局键盘事件
 */
import {registerShortcuts} from "./shortcuts";

/**
 * 历史命令管理 hook
 * 提供查看上一条/下一条命令的功能
 */
// @ts-ignore
import useHistory from "./history";

/**
 * 内容输出组件
 * 渲染具体的输出内容（文本或组件）
 */
import ContentOutput from "./ContentOutput.vue";

/**
 * 终端配置状态仓库
 * 存储背景色、欢迎语等配置
 */
import {useTerminalConfigStore} from "../../core/commands/terminal/config/terminalConfigStore";

/**
 * 命令提示 hook
 * 提供输入自动补全功能
 */
// @ts-ignore
import useHint from "./hint";

/**
 * 用户类型定义
 */
import UserType = User.UserType;

/**
 * 本地用户常量
 */
import {LOCAL_USER} from "../../core/commands/user/userConstant";

/**
 * 全局终端控制对象
 * 用于在组件外部获取终端控制权
 */
import {setTerminalControl} from "./terminalControl";

/**
 * Terminal 组件属性接口
 */
interface TerminalProps {
  height?: string | number;        // 终端高度
  fullScreen?: boolean;            // 是否全屏
  user?: UserType;                 // 当前用户
  onSubmitCommand?: (inputText: string) => void;  // 提交命令回调
}

/**
 * 定义组件 props 并设置默认值
 * height 默认 400px
 * fullScreen 默认 false
 * user 默认 LOCAL_USER
 */
const props = withDefaults(defineProps<TerminalProps>(), {
  height: "400px",
  fullScreen: false,
  user: LOCAL_USER as any,
});

/**
 * 将 props.user 转换为响应式引用
 * 方便在计算属性中使用
 */
const {user} = toRefs(props);

///////////////////////////////////////////////////////////////////////////////
// 响应式状态定义
///////////////////////////////////////////////////////////////////////////////

/**
 * 终端主区域 DOM 引用
 * 用于实现自动滚动到底部功能
 */
const terminalRef = ref();

/**
 * 折叠面板展开的 key 数组
 * 存储当前展开的面板索引
 * 空数组表示所有面板都折叠
 */
const activeKeys = ref<number[]>([]);

/**
 * 输出列表
 * 存储所有命令执行后的输出结果
 * 每个元素是一个 OutputType 对象
 */
const outputList = ref<OutputType[]>([]);

/**
 * 命令历史列表
 * 存储已执行的命令
 * 用于上下箭头切换历史命令
 */
const commandList = ref<CommandOutputType[]>([]);

/**
 * 命令输入框 DOM 引用
 * 用于手动聚焦输入框
 */
const commandInputRef = ref();

/**
 * 是否正在执行命令
 * 执行命令期间禁用输入框
 * 防止用户重复提交
 */
const isRunning = ref(false);

/**
 * 终端配置状态仓库实例
 * 用于获取背景色、欢迎语等配置
 */
const configStore = useTerminalConfigStore();

/**
 * 初始命令对象
 * 用于重置输入框
 */
const initCommand = {text: "", placeholder: ""};

/**
 * 当前输入的命令
 * 双向绑定到输入框
 */
const inputCommand = ref<CommandInputType>({...initCommand});

/**
 * 当前正在执行的命令对象
 * 用于追加输出结果
 * 注意：这是 let 声明，可以被重新赋值
 */
let currentNewCommand: CommandOutputType;

///////////////////////////////////////////////////////////////////////////////
// Hooks 初始化
///////////////////////////////////////////////////////////////////////////////

/**
 * 历史命令管理 hook
 * commandHistoryPos - 当前查看的历史位置
 * showPrevCommand - 查看上一条命令
 * showNextCommand - 查看下一条命令
 * listCommandHistory - 获取命令历史列表
 */
const {commandHistoryPos, showPrevCommand, showNextCommand, listCommandHistory} = useHistory(
    commandList.value,
    inputCommand
);

/**
 * 命令提示 hook
 * hint - 当前提示文本
 * setHint - 设置提示文本
 * debounceSetHint - 防抖设置提示（避免频繁计算）
 */
const {hint, setHint, debounceSetHint} = useHint();

/**
 * 监听输入框内容变化
 * 当 inputCommand.text 变化时，触发防抖提示
 * watchEffect 会自动追踪依赖变化
 */
watchEffect(() => {
  debounceSetHint(inputCommand.value.text);
});

///////////////////////////////////////////////////////////////////////////////
// 计算属性
///////////////////////////////////////////////////////////////////////////////

/**
 * 计算命令提示符
 * 格式: [用户名] 或 [用户名@local]$
 * 本地用户不显示 @local
 */
const prompt = computed(() => {
  return `[${user.value.username}]${user.value.username === "local" ? "" : "@local"}$`;
});

/**
 * 主样式计算属性
 * 全屏模式下使用固定定位
 * 否则使用指定高度
 */
const mainStyle = computed(() => {
  if (props.fullScreen) {
    return {position: "fixed" as const, top: 0, bottom: 0, left: 0, right: 0};
  }
  return {height: props.height};
});

/**
 * 包装器样式计算属性
 * 根据配置设置背景图片或颜色
 * http 图片地址使用 url()，否则直接作为颜色值
 */
const wrapperStyle = computed(() => {
  const {background} = configStore;
  const style = {...mainStyle.value};
  if (background.startsWith("http")) {
    // @ts-ignore
    style.background = `url(${background})`;
  } else {
    // @ts-ignore
    style.background = background;
  }
  return style;
});

///////////////////////////////////////////////////////////////////////////////
// 终端方法定义
///////////////////////////////////////////////////////////////////////////////

/**
 * 清屏方法
 * 清空所有输出列表
 */
const clear = () => {
  outputList.value = [];
};

/**
 * 写命令文本结果
 * 将文本输出追加到当前命令的结果列表中
 * 用于显示命令的正常输出
 * @param text 文本内容
 * @param status 状态类型（info、success、warning、error、system）
 */
const writeTextResult = (text: string, status?: OutputStatusType) => {
  const newOutput: TextOutputType = {text, type: "text", status};
  currentNewCommand?.resultList?.push(newOutput);
};

/**
 * 写命令错误文本结果
 * 快捷方法，内部调用 writeTextResult 并设置 status 为 error
 * @param text 错误信息
 */
const writeTextErrorResult = (text: string) => {
  writeTextResult(text, "error");
};

/**
 * 写命令成功文本结果
 * 快捷方法，内部调用 writeTextResult 并设置 status 为 success
 * @param text 成功信息
 */
const writeTextSuccessResult = (text: string) => {
  writeTextResult(text, "success");
};

/**
 * 写结果
 * 将任意类型的输出追加到当前命令的结果列表中
 * 可以输出组件、表格等复杂内容
 * @param output 输出对象
 */
const writeResult = (output: OutputType) => {
  currentNewCommand?.resultList?.push(output);
};

/**
 * 立即输出文本
 * 将文本输出直接添加到输出列表
 * 不属于任何命令，用于显示欢迎信息、系统消息等
 * @param text 文本内容
 * @param status 状态类型
 */
const writeTextOutput = (text: string, status?: OutputStatusType) => {
  const newOutput: TextOutputType = {text, type: "text", status};
  outputList.value.push(newOutput);
};

/**
 * 立即输出
 * 将任意类型的输出直接添加到输出列表
 * 可以输出组件、表格等复杂内容
 * @param newOutput 输出对象
 */
const writeOutput = (newOutput: OutputType) => {
  outputList.value.push(newOutput);
};

/**
 * 设置命令是否可折叠
 * 某些命令（如 help、shortcut）输出内容较多，设置为可折叠
 * @param collapsible 是否可折叠
 */
const setCommandCollapsible = (collapsible: boolean) => {
  if (currentNewCommand) currentNewCommand.collapsible = collapsible;
};

/**
 * 输入框聚焦
 * 使命令输入框获得焦点
 * 被点击事件、快捷键等调用
 */
const focusInput = () => {
  nextTick(() => {
    commandInputRef.value?.focus();
  });
};

/**
 * 获取输入框是否聚焦
 * 判断输入框 DOM 元素是否是当前激活元素
 * @returns 输入框是否处于聚焦状态
 */
const isInputFocused = () => {
  return (commandInputRef.value?.input as HTMLInputElement) === document.activeElement;
};

/**
 * 设置 Tab 自动补全
 * 根据 hint 设置输入框的值
 * 将提示文本的第一部分填入输入框
 */
const setTabCompletion = () => {
  if (hint.value) {
    const parts = hint.value.split(" ");
    inputCommand.value.text = parts[0] + (parts.length > 1 ? " " : "");
  }
};

/**
 * 提交命令
 * 按回车键时执行
 * 处理命令输入、调用回调、记录历史、滚动到底部
 */
// @ts-ignore
const doSubmitCommand = async () => {
  /**
   * 1. 设置执行状态为 true，禁用输入框
   */
  isRunning.value = true;

  /**
   * 2. 清空提示
   */
  setHint("");

  /**
   * 3. 获取输入文本
   */
  let inputText = inputCommand.value.text;

  /**
   * 4. 处理历史命令快捷输入
   * 以 ! 开头的输入表示执行历史命令
   * 例如 !1 执行第一条历史命令，!2 执行第二条
   */
  if (inputText.startsWith("!")) {
    const commandIndex = Number(inputText.substring(1));
    const command = commandList.value[commandIndex - 1];
    if (command) inputText = command.text;
  }

  /**
   * 5. 创建新命令对象
   * type: "command" 表示这是命令类型输出
   * resultList: [] 初始化空结果列表
   */
  const newCommand: CommandOutputType = {text: inputText, type: "command", resultList: []};
  currentNewCommand = newCommand;

  /**
   * 6. 调用外部命令处理回调
   * 由 IndexPage 传入，负责执行具体命令
   * 回调内部会调用 writeTextResult 等方法追加结果
   */
  await props.onSubmitCommand?.(inputText);

  /**
   * 7. 添加命令到输出列表
   * 这样命令本身也会显示在终端中
   */
  outputList.value.push(newCommand);

  /**
   * 8. 非空命令添加到历史记录
   * 避免空命令污染历史
   */
  if (inputText) {
    commandList.value.push(newCommand);
    commandHistoryPos.value = commandList.value.length;
  }

  /**
   * 9. 重置输入框
   */
  inputCommand.value = {...initCommand};

  /**
   * 10. 默认展开当前折叠面板
   * 便于用户看到最新输出
   */
  activeKeys.value.push(outputList.value.length - 1);

  /**
   * 11. 延迟滚动到底部
   * 等待 DOM 更新后滚动
   * 50ms 延迟确保内容已渲染
   */
  setTimeout(() => {
    terminalRef.value.scrollTop = terminalRef.value.scrollHeight;
  }, 50);

  /**
   * 12. 执行完成，恢复输入框
   */
  isRunning.value = false;

  /**
   * 13. 自动聚焦输入框
   * 命令执行完后自动聚焦，方便继续输入
   */
  focusInput();
};

/**
 * 切换所有折叠面板的展开/折叠状态
 * 如果当前全部折叠，则全部展开
 * 如果当前有展开的，则全部折叠
 */
const toggleAllCollapse = () => {
  if (activeKeys.value.length === 0) {
    // @ts-ignore
    activeKeys.value = outputList.value.map((_, index) => index);
  } else {
    activeKeys.value = [];
  }
};

///////////////////////////////////////////////////////////////////////////////
// 终端对象创建与提供
///////////////////////////////////////////////////////////////////////////////

/**
 * 终端控制对象
 * 包含所有终端操作方法，供外部命令使用
 * 命令文件通过参数接收这个对象，调用其方法输出内容
 */
const terminal: TerminalType = {
  writeTextResult,       // 写命令文本结果
  writeTextErrorResult,  // 写错误文本
  writeTextSuccessResult,// 写成功文本
  writeResult,           // 写结果
  writeTextOutput,       // 立即输出文本
  writeOutput,           // 立即输出
  clear,                 // 清屏
  focusInput,            // 聚焦输入框
  isInputFocused,        // 获取焦点状态
  setTabCompletion,      // Tab 自动补全
  doSubmitCommand,       // 提交命令
  showNextCommand,       // 查看下一条命令
  showPrevCommand,       // 查看上一条命令
  listCommandHistory,    // 获取命令历史
  toggleAllCollapse,     // 折叠/展开所有
  setCommandCollapsible, // 设置命令是否可折叠
};

/**
 * 通过 provide 向下提供 terminal 对象
 * 子组件可以通过 inject 获取 terminal
 * 使用 readonly 防止子组件修改终端方法
 */
provide("terminal", readonly(terminal));

///////////////////////////////////////////////////////////////////////////////
// 生命周期
///////////////////////////////////////////////////////////////////////////////

/**
 * 组件挂载时执行的初始化操作
 * 只执行一次
 */
onMounted(() => {
  /**
   * 设置全局终端控制对象
   * 允许在组件外部获取终端控制权
   */
  setTerminalControl(terminal);

  /**
   * 注册全局快捷键
   * 绑定 document.onkeydown 事件
   */
  registerShortcuts(terminal);

  /**
   * 显示欢迎语
   * 从配置读取自定义欢迎语，或使用默认欢迎语
   */
  const {welcomeTexts} = configStore;
  if (welcomeTexts?.length > 0) {
    // @ts-ignore
    welcomeTexts.forEach((text) => terminal.writeTextOutput(text));
  } else {
    terminal.writeTextOutput("Welcome to Termix! 输入 help 查看命令");
    terminal.writeTextOutput("<br/>");
  }
});

///////////////////////////////////////////////////////////////////////////////
// 事件处理
///////////////////////////////////////////////////////////////////////////////

/**
 * 点击包装器的事件处理
 * 点击空白区域时聚焦输入框
 * 只当点击元素的 class 为 "terminal" 时才聚焦
 * 这样点击折叠面板等区域不会导致聚焦
 * @param event 点击事件
 */
const handleClickWrapper = (event: Event) => {
  if ((event.target as HTMLElement).className === "terminal") {
    focusInput();
  }
};

///////////////////////////////////////////////////////////////////////////////
// 暴露给父组件
///////////////////////////////////////////////////////////////////////////////

/**
 * 暴露 terminal 对象给父组件
 * 父组件可以通过 ref 获取 terminal 进行控制
 * 例如：terminalRef.value.terminal.clear()
 */
defineExpose({terminal});
</script>

<style scoped>
/**
 * 终端包装器样式
 * 背景色为黑色，作为终端的最底层
 */
.terminal-wrapper {
  background: black;
}

/**
 * 终端主区域样式
 * 半透明黑色背景（rgba(0, 0, 0, 0.6)）
 * padding 内边距 20px
 * overflow: scroll 超出内容滚动
 * height: 100% 占满父容器高度
 */
.terminal {
  background: rgba(0, 0, 0, 0.6);
  padding: 20px;
  overflow: scroll;
  height: 100%;
}

/**
 * 隐藏滚动条
 * 使用 -webkit-scrollbar 兼容 WebKit 浏览器
 */
.terminal::-webkit-scrollbar {
  display: none;
}

/**
 * 终端内文字大小
 * 统一所有文字为 16px
 */
.terminal span {
  font-size: 16px;
}

/**
 * 折叠面板 header 样式
 * 白色文字，无内边距
 */
.terminal :deep(.ant-collapse-icon-position-right > .ant-collapse-item > .ant-collapse-header) {
  color: white;
  padding: 0;
}

/**
 * 折叠面板背景透明
 * 融入终端深色背景
 */
.terminal :deep(.ant-collapse) {
  background: none;
}

/**
 * 折叠面板边框无
 */
.terminal :deep(.ant-collapse-borderless > .ant-collapse-item) {
  border: none;
}

/**
 * 折叠面板内容区域 padding 为 0
 * 紧凑显示
 */
.terminal :deep(.ant-collapse-content > .ant-collapse-content-box) {
  padding: 0;
}

/**
 * 命令输入框样式
 * 光标颜色为白色，醒目
 */
.command-input {
  caret-color: white;
  caret-shape: block;
}

/**
 * 命令输入框输入框样式
 * 白色文字，无右边框
 */
.command-input :deep(input) {
  color: white !important;
  font-size: 16px;
  padding: 0 10px;
}

/**
 * 输入框前缀 addon 样式
 * 无背景、无边框、无内边距
 */
.command-input :deep(.ant-input-group-addon) {
  background: none;
  border: none;
  padding: 0;
}

/**
 * 命令提示符样式
 * 白色文字，透明背景
 */
.command-input-prompt {
  color: white;
  background: transparent;
}

/**
 * 终端行样式
 * 白色等宽字体，模拟真实终端效果
 * courier-new > courier > monospace 字体回退
 */
.terminal-row {
  color: white;
  font-size: 16px;
  font-family: courier-new, courier, monospace;
}
</style>
