const os = require("os");
const {execSync} = require("child_process");

async function getLocalIpApi(event, req) {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        const iface = interfaces[name];
        for (const info of iface) {
            if (info.family === "IPv4" && !info.internal) {
                return {data: {ip: info.address}, message: "获取成功"};
            }
        }
    }
    return {data: {ip: "127.0.0.1"}, message: "获取成功"};
}

async function getSysInfoApi(event, req) {
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    return {
        data: {
            cpu: {
                model: cpus[0]?.model || "Unknown",
                cores: cpus.length,
            },
            memory: {
                total: totalMem,
                free: freeMem,
                used: usedMem,
                usagePercent: Number(((usedMem / totalMem) * 100).toFixed(2)),
            },
            uptime: os.uptime(),
            platform: os.platform(),
        },
        message: "获取成功"
    };
}

async function getProcessListApi(event, req) {
    const platform = os.platform();
    const processes = [];

    try {
        if (platform === "win32") {
            const output = execSync("wmic process get ProcessId, Name, KernelModeTime, UserModeTime", {
                encoding: "utf-8",
                timeout: 5000
            });

            const lines = output.trim().split("\n");
            const pidSet = new Set();

            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                const parts = line.split(/\s+/);
                if (parts.length >= 3) {
                    const name = parts[0];
                    const pid = parseInt(parts[1]);

                    if (pid && !pidSet.has(pid)) {
                        pidSet.add(pid);
                        processes.push({
                            pid,
                            name: name || "Unknown",
                            memory: 0
                        });
                    }
                }
            }
        } else {
            const output = execSync("ps aux | head -50", {encoding: "utf-8", timeout: 5000});
            const lines = output.trim().split("\n");

            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                const parts = line.split(/\s+/);
                if (parts.length >= 11) {
                    const pid = parseInt(parts[1]);
                    const cpu = parseFloat(parts[2]);
                    const mem = parseFloat(parts[3]);
                    const command = parts.slice(10).join(" ").substring(0, 30);

                    processes.push({
                        pid,
                        name: command,
                        cpu,
                        mem
                    });
                }
            }
        }
    } catch (e) {
        console.error("Failed to get process list:", e);
    }

    return {
        data: processes.slice(0, 20),
        message: "获取成功"
    };
}

async function killProcessApi(event, req) {
    const {pid} = event || {};

    if (!pid) {
        return {data: null, message: "请指定进程 ID"};
    }

    try {
        process.kill(parseInt(pid));
        return {data: true, message: `进程 ${pid} 已结束`};
    } catch (e) {
        return {data: null, message: `结束进程失败: ${e.message}`};
    }
}

module.exports = {
    getLocalIpApi,
    getSysInfoApi,
    getProcessListApi,
    killProcessApi,
};
