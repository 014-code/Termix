// @ts-ignore
import {CommandType} from "../command";
// @ts-ignore
import myAxios from "../../../plugins/myAxios";

const ipCommand: CommandType = {
    func: "ip",
    name: "IP 查询",
    desc: "查看本机 IP 和外网 IP",
    options: [],
    // @ts-ignore
    async action(options, terminal): Promise<void> {
        // let output = `🌐 IP 信息\n\n`;

        terminal.writeTextResult(`📍 本机 IP: 正在查询...\n`);
        terminal.writeTextResult(`🌍 外网 IP: 正在查询...\n`);

        try {
            // @ts-ignore
            const [localRes, publicRes] = await Promise.all([
                myAxios.get("/system/local-ip"),
                myAxios.get("https://api.ipify.org?format=json").catch(() => ({data: {ip: "获取失败"}})),
            ]);

            const localIp = localRes.data?.ip || "获取失败";
            const publicIp = publicRes.data?.ip || "获取失败";

            terminal.writeResult({
                type: "text",
                text: `📍 本机 IP: ${localIp}\n🌍 外网 IP: ${publicIp}`,
                status: "success"
            } as any);
        } catch {
            terminal.writeResult({
                type: "text",
                text: `❌ 获取失败，请稍后重试`,
                status: "error"
            } as any);
        }
    },
};

export default ipCommand;
