import TerminalType = Terminal.TerminalType;
import { reactive, readonly } from "vue";

const terminalControl = reactive<TerminalType>({} as TerminalType);

export const setTerminalControl = (terminal: TerminalType) => {
  // @ts-ignore
  Object.assign(terminalControl, terminal);
};

export const getTerminalControl = () => terminalControl;

export const useTerminalControl = () => {
  return readonly(terminalControl);
};
