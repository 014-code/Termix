import {CommandType} from "./command";
import gotoCommand from "./commands/gotoCommand";
import dateCommand from "./commands/dateCommand";

/**
 * 命令列表（数组元素顺序会影响 help 命令的展示顺序）
 */
const commandList: CommandType[] = [
    gotoCommand,
    dateCommand,
];

/**
 * 命令字典
 */
const commandMap: Record<string, CommandType> = {};

commandList.forEach((command) => {
    commandMap[command.func] = command;
    command.alias?.forEach((name) => {
        commandMap[name] = command;
    });
});

export {commandList, commandMap};
