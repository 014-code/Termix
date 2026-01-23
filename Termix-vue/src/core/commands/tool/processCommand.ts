// @ts-ignore
import {CommandType} from "../command";
// @ts-ignore
import myAxios from "../../../plugins/myAxios";

interface ProcessInfo {
    pid: number;
    name: string;
    cpu: number;
    memory: number;
}

const processCommand: CommandType = {
    func: "process",
    name: "进程管理",
    desc: "查看进程列表（ps）或结束进程（kill）",
    alias: ["ps", "kill"],
    params: [
        {
            key: "action",
            desc: "操作：ps-查看进程，kill-结束进程",
            required: false,
            defaultValue: "ps"
        },
        {
            key: "pid",
            desc: "进程 ID（kill 时必填）",
            required: false
        }
    ],
    options: [
        {
            key: "top",
            desc: "显示前 N 个进程",
            alias: ["t"],
            type: "number",
            required: false
        }
    ],
    // @ts-ignore
    async action(options, terminal): Promise<void> {
        const action = options.action || "ps";

        if (action === "kill") {
            const pid = parseInt(options.pid);
            if (!pid) {
                terminal.writeTextErrorResult("请指定要结束的进程 ID");
                return;
            }

            try {
                const res: any = await myAxios.post("/system/process/kill", {pid});
                if (res.code === 0 && res.data) {
                    terminal.writeTextSuccessResult(`进程 ${pid} 已结束`);
                } else {
                    terminal.writeTextErrorResult(res.message || "结束进程失败");
                }
            } catch (e: any) {
                terminal.writeTextErrorResult(`结束进程失败: ${e.message}`);
            }
            return;
        }

        terminal.writeTextResult("📋 正在查询进程列表...\n");

        try {
            const res: any = await myAxios.get("/system/process/list");
            const processes: ProcessInfo[] = res.data || [];

            const topN = options.top ? parseInt(options.top) : 10;
            const displayProcesses = processes.slice(0, topN);

            let output = `📋 进程列表 (显示前 ${displayProcesses.length} 个)\n\n`;
            output += ` PID       进程名\n`;
            output += `────────────────────────────────────\n`;

            for (const p of displayProcesses) {
                output += `${p.pid.toString().padEnd(10)} ${p.name}\n`;
            }

            output += `\n💡 使用 process kill <PID> 结束进程`;

            terminal.writeTextResult(output);
        } catch (e: any) {
            terminal.writeTextErrorResult(`获取进程列表失败: ${e.message}`);
        }
    },
};

export default processCommand;
