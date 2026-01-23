import os from "os";

interface SystemInfo {
  cpu: {
    model: string;
    cores: number;
    usage: number;
  };
  memory: {
    total: number;
    free: number;
    used: number;
    usagePercent: number;
  };
  disk: {
    total: number;
    free: number;
    used: number;
    usagePercent: number;
  };
  uptime: number;
  platform: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function getSystemInfo(): SystemInfo {
  const cpus = os.cpus();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;

  const uptime = os.uptime();

  const platform = os.platform();

  return {
    cpu: {
      model: cpus[0]?.model || "Unknown",
      cores: cpus.length,
      usage: 0,
    },
    memory: {
      total: totalMem,
      free: freeMem,
      used: usedMem,
      usagePercent: Number(((usedMem / totalMem) * 100).toFixed(2)),
    },
    disk: {
      total: 0,
      free: 0,
      used: 0,
      usagePercent: 0,
    },
    uptime,
    platform,
  };
}

export function formatUptime(seconds: number): string {
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

export function formatBytesGB(bytes: number): string {
  if (bytes === 0) return "0 GB";
  const gb = bytes / (1024 * 1024 * 1024);
  return gb.toFixed(2) + " GB";
}
