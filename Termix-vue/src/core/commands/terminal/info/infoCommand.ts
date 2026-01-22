import { CommandType } from "../../../command";
import { defineAsyncComponent } from "vue";
import ComponentOutputType = Terminal.ComponentOutputType;

/**
 * 查看网站本身信息命令
 */
const infoCommand: CommandType = {
  func: "info",
  name: "查看本站信息",
  alias: ["author", "about"],
  options: [],
  // @ts-ignore
  action(options, terminal): void {
    const output: ComponentOutputType = {
      type: "component",
      // @ts-ignore
      component: defineAsyncComponent(() => import("./InfoBox.vue")),
    };
    terminal.writeResult(output);
  },
};

export default infoCommand;
