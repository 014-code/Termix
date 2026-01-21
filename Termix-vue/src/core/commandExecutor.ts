import {CommandOptionType, CommandType} from "./command";
import {ParsedOptions} from "getopts";
import {commandMap} from "./commandRegister";
// @ts-ignore
import getopts from "getopts";
import TerminalType = YuTerminal.TerminalType;
// import helpCommand from "./commands/terminal/help/helpCommand";

/**
 * 执行命令
 * @param text 输入字符串
 * @param terminal 终端对象，可以对其调用如，writeError便会显示错误的tag
 * @param parentCommand 父命令
 */
export const doCommandExecute = async (
    text: string,
    terminal: TerminalType,
    parentCommand?: CommandType
    // @ts-ignore
): Promise<void> => {
    //如grep --color=always "hello" file.txt
    //先从父命令下手解析用户输入的和父命令(grep)
    //去除首位空格
    text = text.trim()
    if (!text) {
        terminal.writeTextErrorResult("请输入命令");
        return;
    }
    // 1. 解析出命令名称和参数，拿到当前命令-可能是最高级的父命令，也可能是子命令，的看他有没有parentCommand
    //拿到当前命令对象
    const currentCommand: CommandType = getCommand(text, parentCommand)
    // 2.解析参数，就是 --color=always、"hello"和file.txt，这里是得到转化后的
    /**例子
     * const options = {
     *   alias: {
     *     recursive: ["r", "rec"],  // --recursive 的别名是 -r 和 --rec
     *     output: ["o", "out"],     // --output 的别名是 -o 和 --out
     *     verbose: ["v"]            // --verbose 的别名是 -v
     *   },
     *   boolean: ["recursive", "verbose"],  // 这些是布尔选项
     *   string: ["output"],                 // 这些是字符串选项
     *   default: {
     *     recursive: false,        // 默认值
     *     output: "result.txt",    // 默认值
     *     verbose: false           // 默认值
     *   }
     * };
     */
    const parameterCommands: ParsedOptions = doParse(text, currentCommand.options)
    // 3. 解析选项和参数
    // 4. 执行命令，就是对上面拿到的这些对象调用里面的action方法
    const {_} = parameterCommands;
    // 有子命令，执行
    if (
        _.length > 0 &&
        currentCommand.subCommands &&
        Object.keys(currentCommand.subCommands).length > 0
    ) {
        // 把子命令当做新命令解析，user login xxx => login xxx
        const subText = text.substring(text.indexOf(" ") + 1);
        await doCommandExecute(subText, terminal, currentCommand);
        return;
    }
    // 执行命令
    await doAction(currentCommand, parameterCommands, terminal, parentCommand);
}

/**
 * 获取命令（匹配） -用于解析用户输入和最高级父命令
 * @param text 输入内容
 * @param parentCommand 父命令
 */
const getCommand = (text: string, parentCommand?: CommandType): CommandType => {
    //先把用户输入的grep --color=always "hello" file.txt分割拿取第一个父命令
    //空格切割
    const userCommand: string = text.split(" ")[0]
    //管他是大写小写，统统转成小写
    const currentCommand: string = userCommand.toLowerCase()
    //然后去已经注册的命令字典中去匹配拿到对应的commandType对象-就是已经写好具体值的
    let map = commandMap
    if (
        //有父命令且有子命令
        parentCommand &&
        parentCommand.subCommands &&
        Object.keys(parentCommand.subCommands).length > 0
    ) {
        //然后把父命令的子命令集合给覆盖map
        map = parentCommand.subCommands;
    }
    //然后再从子命令里面找到当前传入的命令键，拿到对应命令对象
    //为什么要上面那样做，因为commandMap里面只存最高级父命令，而要想找到子命令键对应的命令对象则的从父命令的子命令集合得到，subCommands里面村的也是键值对，所以可以直接拿到对象
    const command = map[currentCommand];
    console.log("getCommand = ", command);
    return command;
}

/**
 * 解析参数
 * @param text
 * @param commandOptions
 */
const doParse = (
    text: string,
    commandOptions: CommandOptionType[]
): getopts.ParsedOptions => {
    //一样进行分割，然后排除第一个就行
    const optionStrs: string[] = text.split(" ").slice(1)
    // 转换，先搞出一个空对象
    const options: getopts.Options = {
        alias: {},
        default: {},
        string: [],
        boolean: [],
    };
    // 拿取当前命令的所有选项进行遍历对应
    /**例子，这样更好理解
     * // 1. 处理 recursive
     * // recursive: { key: "recursive", alias: ["r", "rec"], type: "boolean", defaultValue: false }
     * options.alias["recursive"] = ["r", "rec"];  // 别名映射
     * options.boolean.push("recursive");          // 添加到布尔数组
     * options.default["recursive"] = false;       // 设置默认值
     *
     * // 2. 处理 output
     * // output: { key: "output", alias: ["o", "out"], type: "string", defaultValue: "result.txt" }
     * options.alias["output"] = ["o", "out"];
     * options.string.push("output");
     * options.default["output"] = "result.txt";
     */
    commandOptions.forEach((commandOption) => {
        const {alias, key, type, defaultValue} = commandOption;
        //给options构建出，
        if (alias && options.alias) {
            options.alias[key] = alias;
        }
        options[type]?.push(key);
        if (defaultValue && options.default) {
            options.default[key] = defaultValue;
        }
    });
    //库里面的转化方法
    const parsedOptions = getopts(optionStrs, options);
    console.log("parsedOptions = ", parsedOptions);
    return parsedOptions;
}

/**
 * 执行
 * @param command
 * @param options
 * @param terminal
 * @param parentCommand
 */
const doAction = async (
    command: CommandType,
    options: ParsedOptions,
    terminal: TerminalType,
    // @ts-ignore
    parentCommand?: CommandType
    // @ts-ignore
): Promise<void> => {
    const {help} = options;
    // 设置输出折叠，或者这个命令中的子选项有help的话
    if (command.collapsible || help) {
        terminal.setCommandCollapsible(true);
    }
    // 查看帮助
    // e.g. xxx --help => { _: ["xxx"] }
    if (help) {
        // @ts-ignore
        const newOptions = {...options, _: [command.func]};
        // helpCommand.action(newOptions, terminal, parentCommand);
        return;
    }
    await command.action(options, terminal);
};