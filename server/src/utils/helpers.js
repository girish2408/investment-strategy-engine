import fs from 'fs/promises';
import path from 'path';

export async function ensureDirectoryExists(dirPath) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

export function formatError(error) {
  return {
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  };
}

export function validateFileType(file, allowedTypes) {
  const ext = path.extname(file.name).toLowerCase();
  return allowedTypes.includes(ext);
}

export function sanitizeFileName(fileName) {
  return fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
} 