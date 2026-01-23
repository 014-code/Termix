import {CommandType} from "./command";
import gotoCommand from "./commands/gotoCommand";
import dateCommand from "./commands/dateCommand";
import clearCommand from "./commands/terminal/clearCommand";
import historyCommand from "./commands/terminal/historyCommand";
import userCommands from "./commands/user/userCommands";
import backgroundCommand from "./commands/terminal/config/backgroundCommand";
import resetCommand from "./commands/terminal/config/resetCommand";
import helpCommand from "./commands/terminal/help/helpCommand";
import infoCommand from "./commands/terminal/info/infoCommand";
import pingCommand from "./commands/pingCommand";
import hintCommand from "./commands/terminal/config/hintCommand";
import shortcutCommand from "./commands/terminal/shortcut/shortcutCommand";
import welcomeCommand from "./commands/terminal/config/welcomeCommand";
import sysCommand from "./commands/system/sysCommand";
import ipCommand from "./commands/tool/ipCommand";
import processCommand from "./commands/tool/processCommand";

/**
 * 命令列表（数组元素顺序会影响 help 命令的展示顺序）
 */
const commandList: CommandType[] = [
    shortcutCommand,
    gotoCommand,
    ...userCommands,
    dateCommand,
    sysCommand,
    ipCommand,
    processCommand,
    clearCommand,
    historyCommand,
    helpCommand,
    infoCommand,
    pingCommand,
    welcomeCommand,
    backgroundCommand,
    resetCommand,
    hintCommand,
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
