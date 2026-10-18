import { execSync } from "child_process";

/** Re-run prisma seed for deterministic demo reset */
export function resetDemoData() {
  execSync("npx tsx prisma/seed.ts", {
    cwd: process.cwd(),
    stdio: "inherit",
    env: { ...process.env },
  });
  return { ok: true, at: new Date().toISOString() };
}
