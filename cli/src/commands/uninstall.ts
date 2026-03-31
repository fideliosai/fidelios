import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execSync } from "node:child_process";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { runDatabaseBackup, formatDatabaseBackupResult } from "@fideliosai/db";
import {
  resolveFideliOSHomeDir,
  resolveFideliOSInstanceId,
  resolveFideliOSInstanceRoot,
  resolveDefaultBackupDir,
  resolveDefaultEmbeddedPostgresDir,
} from "../config/home.js";
import { readConfig, resolveConfigPath, configExists } from "../config/store.js";
import { printFideliOSCliBanner } from "../utils/banner.js";

type UninstallOptions = {
  config?: string;
  force?: boolean;
};

function resolveConnectionString(configPath?: string): string | null {
  const envUrl = process.env.DATABASE_URL?.trim();
  if (envUrl) return envUrl;

  try {
    const config = readConfig(configPath);
    if (config?.database.mode === "postgres" && config.database.connectionString?.trim()) {
      return config.database.connectionString.trim();
    }
    const port = config?.database.embeddedPostgresPort ?? 54329;
    return `postgres://fidelios:fidelios@127.0.0.1:${port}/fidelios`;
  } catch {
    return null;
  }
}

async function createFinalBackup(
  connectionString: string,
  backupDir: string,
): Promise<string | null> {
  try {
    await fsp.mkdir(backupDir, { recursive: true });
    const result = await runDatabaseBackup({
      connectionString,
      backupDir,
      retentionDays: 9999,
      filenamePrefix: "fidelios-final",
    });
    return result.backupFile;
  } catch {
    return null;
  }
}

async function removeIfExists(target: string): Promise<boolean> {
  try {
    await fsp.rm(target, { recursive: true, force: true });
    return true;
  } catch {
    return false;
  }
}

export async function uninstallCommand(opts: UninstallOptions): Promise<void> {
  printFideliOSCliBanner();
  p.intro(pc.bgRed(pc.white(" fidelios uninstall ")));

  const instanceId = resolveFideliOSInstanceId();
  const instanceRoot = resolveFideliOSInstanceRoot(instanceId);
  const homeDir = resolveFideliOSHomeDir();
  const backupDir = resolveDefaultBackupDir(instanceId);
  const force = opts.force === true;

  if (!force) {
    const confirm = await p.confirm({
      message: "Uninstall FideliOS? Database backups will be preserved.",
    });
    if (p.isCancel(confirm) || !confirm) {
      p.outro("Cancelled.");
      return;
    }
  }

  // --- Step 1: Create final database dump ---
  const spinner = p.spinner();
  const connectionString = resolveConnectionString(opts.config);
  let dumpPath: string | null = null;

  if (connectionString) {
    const dumpDir = force
      ? path.resolve(os.homedir(), "Downloads")
      : backupDir;

    spinner.start("Creating final database backup...");
    dumpPath = await createFinalBackup(connectionString, dumpDir);
    if (dumpPath) {
      spinner.stop(`Final backup saved: ${dumpPath}`);
    } else {
      spinner.stop(pc.yellow("Could not create backup (database may not be running)."));
    }
  } else {
    p.log.message(pc.dim("No database configuration found, skipping backup."));
  }

  // --- Step 2: Remove instance data ---
  spinner.start("Removing FideliOS data...");

  if (force) {
    // Force mode: remove everything
    await removeIfExists(homeDir);
    spinner.stop(`Removed ${homeDir}`);
  } else {
    // Safe mode: remove everything except backups
    const configPath = path.join(instanceRoot, "config.json");
    const envPath = path.join(instanceRoot, ".env");
    const dbDir = resolveDefaultEmbeddedPostgresDir(instanceId);
    const logsDir = path.join(instanceRoot, "logs");
    const secretsDir = path.join(instanceRoot, "secrets");
    const storageDir = path.join(instanceRoot, "data", "storage");

    const removed: string[] = [];
    for (const target of [configPath, envPath, dbDir, logsDir, secretsDir, storageDir]) {
      if (await removeIfExists(target)) {
        removed.push(path.relative(homeDir, target));
      }
    }
    spinner.stop(`Removed: ${removed.length > 0 ? removed.join(", ") : "nothing to remove"}`);
  }

  // --- Step 3: Uninstall npm global package ---
  spinner.start("Removing global fidelios package...");
  try {
    execSync("npm uninstall -g fidelios", { stdio: "ignore" });
    spinner.stop("Global fidelios package removed.");
  } catch {
    spinner.stop(pc.yellow("Could not remove global package (may not be globally installed)."));
  }

  // --- Done ---
  p.log.message("");
  if (force) {
    p.log.message(pc.green("FideliOS has been completely removed."));
    if (dumpPath) {
      p.log.message(`Final backup: ${pc.cyan(dumpPath)}`);
    }
  } else {
    p.log.message(pc.green("FideliOS has been uninstalled."));
    p.log.message(`Backups preserved at: ${pc.cyan(backupDir)}`);
    p.log.message(pc.dim(`To remove everything: rm -rf ${homeDir}`));
  }

  p.outro("Done.");
}
