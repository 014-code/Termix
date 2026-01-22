import { CommandType } from "../../../command";
import { defineAsyncComponent } from "vue";
import ComponentOutputType = Terminal.ComponentOutputType;

/**
 * 快捷键命令
 */
const shortcutCommand: CommandType = {
  func: "shortcut",
  name: "快捷键",
  desc: "查看快捷键",
  alias: [],
  params: [],
  options: [],
  collapsible: true,
  // @ts-ignore
  action(options, terminal): void {
    const output: ComponentOutputType = {
      type: "component",
      // @ts-ignore
      component: defineAsyncComponent(() => import("./ShortcutBox.vue")),
    };
    terminal.writeResult(output);
  },
};

export default shortcutCommand;
