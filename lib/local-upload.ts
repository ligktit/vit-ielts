import fs from "fs";
import path from "path";
import type { VpsUploadResult } from "./vps-upload";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

const MIME_TO_CATEGORY: Record<string, "images" | "audio" | "pdf"> = {
  "image/jpeg": "images",
  "image/png":  "images",
  "image/webp": "images",
  "image/gif":  "images",
  "audio/mpeg": "audio",
  "audio/mp4":  "audio",
  "audio/ogg":  "audio",
  "audio/wav":  "audio",
  "audio/webm": "audio",
  "audio/aac":  "audio",
  "application/pdf": "pdf",
};

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png":  "png",
  "image/webp": "webp",
  "image/gif":  "gif",
  "audio/mpeg": "mp3",
  "audio/mp4":  "m4a",
  "audio/ogg":  "ogg",
  "audio/wav":  "wav",
  "audio/webm": "webm",
  "audio/aac":  "aac",
  "application/pdf": "pdf",
};

export async function uploadToLocal(
  fileBuffer: Buffer,
  originalFilename: string,
  mimeType: string
): Promise<VpsUploadResult> {
  const category = MIME_TO_CATEGORY[mimeType];
  if (!category) throw new Error(`Loại file không được hỗ trợ: ${mimeType}`);

  const ext = MIME_TO_EXT[mimeType];
  const base = originalFilename
    .replace(/\.[^./\\]*$/, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 60) || "file";
  const unique = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  const filename = `${base}-${unique}.${ext}`;

  const dir = path.join(UPLOAD_ROOT, category);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, filename), fileBuffer);

  return {
    url: `/uploads/${category}/${filename}`,
    filename,
    mimeType,
    category,
    size: fileBuffer.length,
  };
}

export async function deleteFromLocal(url: string): Promise<void> {
  try {
    const rel = url.startsWith("/") ? url.slice(1) : url;
    const filepath = path.join(process.cwd(), "public", rel);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
  } catch (err) {
    console.error(`Lỗi xóa file local: ${(err as Error).message}`);
  }
}
