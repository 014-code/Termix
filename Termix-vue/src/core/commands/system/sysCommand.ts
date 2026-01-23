// @ts-ignore
import { CommandType } from "../command";
// @ts-ignore
import myAxios from "../../../plugins/myAxios";

const sysCommand: CommandType = {
  func: "sys",
  name: "系统信息",
  desc: "查看系统信息（CPU、内存、运行时间）",
  options: [],
  collapsible: true,
  // @ts-ignore
  async action(options, terminal): Promise<void> {
    terminal.writeTextResult("📊 正在查询系统信息...\n");

    try {
      const res: any = await myAxios.get("/system/info");
      const info = res.data;

      if (!info) {
        terminal.writeTextResult("❌ 获取系统信息失败");
        return;
      }

      const output = `
─────────────────────────────────────
📊 系统信息
─────────────────────────────────────
🖥️  CPU: ${info.cpu.model}
   核心数: ${info.cpu.cores} 核

💾 内存
   总计: ${formatBytesGB(info.memory.total)}
   已用: ${formatBytesGB(info.memory.used)} (${info.memory.usagePercent}%)
   空闲: ${formatBytesGB(info.memory.free)}

⏱️  运行时间: ${formatUptime(info.uptime)}

🌐 平台: ${info.platform}
─────────────────────────────────────`.trim();

      terminal.writeTextResult(output);
    } catch {
      terminal.writeTextResult("❌ 获取系统信息失败");
    }
  },
};

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  let result = "";
  if (days > 0) result += `${days}d `;
  if (hours > 0) result += `${hours}h `;
  if (mins > 0) result += `${mins}m `;
  result += `${secs}s`;

  return result.trim();
}

function formatBytesGB(bytes: number): string {
  if (bytes === 0) return "0 GB";
  const gb = bytes / (1024 * 1024 * 1024);
  return gb.toFixed(2) + " GB";
}

export default sysCommand;
