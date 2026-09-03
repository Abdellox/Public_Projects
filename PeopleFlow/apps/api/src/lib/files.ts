import { createHash, randomUUID } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import type { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { Env } from "@peopleflow/config";

export interface StoredFileMeta {
  mimeType: string;
  fileName: string;
  size: number;
}

export interface FileStorage {
  save(buffer: Buffer): Promise<void>;
  openStream(): Promise<Readable>;
  remove(): Promise<void>;
}

function buildKey(meta: StoredFileMeta): string {
  const ext = path.extname(meta.fileName).slice(0, 12).replace(/[^.\w]/g, "");
  const hash = createHash("sha1").update(`${meta.fileName}:${Date.now()}:${randomUUID()}`).digest("hex").slice(0, 16);
  return `documents/${new Date().toISOString().slice(0, 10)}/${hash}${ext}`;
}

class LocalStorage implements FileStorage {
  constructor(
    private readonly env: Env,
    private readonly key: string,
    private readonly meta: StoredFileMeta,
  ) {}

  async save(buffer: Buffer): Promise<void> {
    const full = path.resolve(this.env.LOCAL_STORAGE_DIR, this.key);
    await mkdir(path.dirname(full), { recursive: true });
    await pipeline(async function* () {
      yield buffer;
    }, createWriteStream(full));
  }

  async openStream(): Promise<Readable> {
    return createReadStream(path.resolve(this.env.LOCAL_STORAGE_DIR, this.key));
  }

  async remove(): Promise<void> {
    await unlink(path.resolve(this.env.LOCAL_STORAGE_DIR, this.key)).catch(() => undefined);
  }
}

type S3Module = typeof import("@aws-sdk/client-s3");

class S3Storage implements FileStorage {
  private static clientPromise?: Promise<InstanceType<S3Module["S3Client"]>>;

  constructor(
    private readonly env: Env,
    private readonly key: string,
    private readonly meta: StoredFileMeta,
  ) {}

  private async client(): Promise<InstanceType<S3Module["S3Client"]>> {
    if (!S3Storage.clientPromise) {
      S3Storage.clientPromise = import("@aws-sdk/client-s3").then(({ S3Client }) => {
        if (!this.env.S3_ACCESS_KEY_ID || !this.env.S3_SECRET_ACCESS_KEY) {
          throw new Error("S3 credentials are not configured");
        }
        return new S3Client({
          region: this.env.S3_REGION,
          endpoint: this.env.S3_ENDPOINT || undefined,
          forcePathStyle: this.env.S3_FORCE_PATH_STYLE,
          credentials: {
            accessKeyId: this.env.S3_ACCESS_KEY_ID,
            secretAccessKey: this.env.S3_SECRET_ACCESS_KEY,
          },
        });
      });
    }
    return S3Storage.clientPromise;
  }

  async save(buffer: Buffer): Promise<void> {
    const { PutObjectCommand } = await import("@aws-sdk/client-s3");
    const client = await this.client();
    await client.send(
      new PutObjectCommand({
        Bucket: this.env.S3_BUCKET,
        Key: this.key,
        Body: buffer,
        ContentType: this.meta.mimeType,
        ContentLength: buffer.length,
      }),
    );
  }

  async openStream(): Promise<Readable> {
    const { GetObjectCommand } = await import("@aws-sdk/client-s3");
    const client = await this.client();
    const result = await client.send(
      new GetObjectCommand({ Bucket: this.env.S3_BUCKET, Key: this.key }),
    );
    return result.Body as Readable;
  }

  async remove(): Promise<void> {
    const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
    const client = await this.client();
    await client.send(new DeleteObjectCommand({ Bucket: this.env.S3_BUCKET, Key: this.key }));
  }
}

export async function storeUpload(env: Env, meta: StoredFileMeta, buffer: Buffer): Promise<string> {
  const key = buildKey(meta);
  const storage =
    env.STORAGE_DRIVER === "s3" ? new S3Storage(env, key, meta) : new LocalStorage(env, key, meta);
  await storage.save(buffer);
  return key;
}

export function openStored(env: Env, key: string, meta: StoredFileMeta): FileStorage {
  return env.STORAGE_DRIVER === "s3"
    ? new S3Storage(env, key, meta)
    : new LocalStorage(env, key, meta);
}

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

export async function readMultipartFileBuffer(
  file: { file: Readable; filename: string; mimetype: string },
): Promise<{ buffer: Buffer; meta: StoredFileMeta }> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of file.file) {
    size += (chunk as Buffer).length;
    if (size > MAX_UPLOAD_BYTES) throw new Error("FILE_TOO_LARGE");
    chunks.push(chunk as Buffer);
  }
  return {
    buffer: Buffer.concat(chunks),
    meta: { fileName: file.filename, mimeType: file.mimetype || "application/octet-stream", size },
  };
}
