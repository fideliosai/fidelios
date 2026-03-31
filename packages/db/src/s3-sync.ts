import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { basename, resolve } from "node:path";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";

export type S3BackupConfig = {
  enabled: boolean;
  bucket: string;
  region: string;
  prefix: string;
  retentionDays: number;
  accessKeyId?: string;
  secretAccessKey?: string;
};

function createS3Client(config: S3BackupConfig): S3Client {
  const clientConfig: Record<string, unknown> = { region: config.region };
  if (config.accessKeyId && config.secretAccessKey) {
    clientConfig.credentials = {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    };
  }
  return new S3Client(clientConfig);
}

function s3Key(config: S3BackupConfig, filename: string): string {
  const prefix = config.prefix.endsWith("/") ? config.prefix : `${config.prefix}/`;
  return `${prefix}${filename}`;
}

/**
 * Upload a local backup file to S3.
 * Returns the S3 key on success, or null if upload failed (non-throwing for graceful degradation).
 */
export async function uploadBackupToS3(
  localPath: string,
  config: S3BackupConfig,
): Promise<{ key: string; bucket: string } | null> {
  if (!config.enabled) return null;

  try {
    const client = createS3Client(config);
    const filename = basename(localPath);
    const key = s3Key(config, filename);
    const body = readFileSync(localPath);

    await client.send(
      new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        Body: body,
        ContentType: filename.endsWith(".gz") ? "application/gzip" : "application/sql",
        Metadata: {
          "fidelios-backup": "true",
          "created-at": new Date().toISOString(),
        },
      }),
    );

    return { key, bucket: config.bucket };
  } catch (error) {
    // Graceful degradation: log but don't throw
    console.warn(
      `[s3-sync] Upload failed (${error instanceof Error ? error.message : String(error)}). Backup remains local-only.`,
    );
    return null;
  }
}

export type S3BackupInfo = {
  key: string;
  filename: string;
  size: number;
  lastModified: Date;
};

/**
 * List available backups in S3.
 */
export async function listS3Backups(config: S3BackupConfig): Promise<S3BackupInfo[]> {
  const client = createS3Client(config);
  const prefix = config.prefix.endsWith("/") ? config.prefix : `${config.prefix}/`;

  const response = await client.send(
    new ListObjectsV2Command({
      Bucket: config.bucket,
      Prefix: prefix,
    }),
  );

  if (!response.Contents) return [];

  return response.Contents
    .filter((obj) => obj.Key && (obj.Key.endsWith(".sql") || obj.Key.endsWith(".sql.gz")))
    .map((obj) => ({
      key: obj.Key!,
      filename: obj.Key!.split("/").pop()!,
      size: obj.Size ?? 0,
      lastModified: obj.LastModified ?? new Date(),
    }))
    .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
}

/**
 * Download a backup from S3 to a local path.
 */
export async function downloadBackupFromS3(
  s3Key: string,
  localDir: string,
  config: S3BackupConfig,
): Promise<string> {
  const client = createS3Client(config);
  const filename = s3Key.split("/").pop()!;
  const localPath = resolve(localDir, filename);

  const response = await client.send(
    new GetObjectCommand({
      Bucket: config.bucket,
      Key: s3Key,
    }),
  );

  if (!response.Body) {
    throw new Error(`Empty response for S3 key: ${s3Key}`);
  }

  const chunks: Uint8Array[] = [];
  for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }
  const body = Buffer.concat(chunks);

  mkdirSync(localDir, { recursive: true });
  writeFileSync(localPath, body);

  return localPath;
}

/**
 * Prune old backups from S3 based on retention policy.
 */
export async function pruneS3Backups(config: S3BackupConfig): Promise<number> {
  if (!config.enabled) return 0;

  try {
    const backups = await listS3Backups(config);
    const cutoff = Date.now() - config.retentionDays * 24 * 60 * 60 * 1000;
    const expired = backups.filter((b) => b.lastModified.getTime() < cutoff);

    if (expired.length === 0) return 0;

    const client = createS3Client(config);
    await client.send(
      new DeleteObjectsCommand({
        Bucket: config.bucket,
        Delete: {
          Objects: expired.map((b) => ({ Key: b.key })),
          Quiet: true,
        },
      }),
    );

    return expired.length;
  } catch (error) {
    console.warn(
      `[s3-sync] Pruning failed (${error instanceof Error ? error.message : String(error)}).`,
    );
    return 0;
  }
}
