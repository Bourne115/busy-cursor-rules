import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';

/**
 * 确保目录存在
 */
export async function ensureDir(dirPath: string): Promise<void> {
  await fs.ensureDir(dirPath);
}

/**
 * 写入文件，自动创建目录
 */
export async function writeFile(
  filePath: string,
  content: string
): Promise<void> {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * 读取文件
 */
export async function readFile(filePath: string): Promise<string> {
  return fs.readFile(filePath, 'utf-8');
}

/**
 * 检查文件是否存在
 */
export async function exists(filePath: string): Promise<boolean> {
  return fs.pathExists(filePath);
}

/**
 * 读取JSON文件
 */
export async function readJson<T = any>(filePath: string): Promise<T> {
  return fs.readJson(filePath);
}

/**
 * 写入JSON文件
 */
export async function writeJson(filePath: string, data: any): Promise<void> {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeJson(filePath, data, { spaces: 2 });
}

/**
 * 复制文件
 */
export async function copyFile(src: string, dest: string): Promise<void> {
  await fs.ensureDir(path.dirname(dest));
  await fs.copy(src, dest);
}

/**
 * 删除文件或目录
 */
export async function remove(filePath: string): Promise<void> {
  await fs.remove(filePath);
}

/**
 * 获取匹配的文件列表
 */
export async function getFiles(
  pattern: string,
  cwd?: string
): Promise<string[]> {
  return glob(pattern, { cwd });
}

/**
 * 获取文件的相对路径
 */
export function getRelativePath(from: string, to: string): string {
  return path.relative(from, to);
}

/**
 * 规范化路径
 */
export function normalizePath(filePath: string): string {
  return path.normalize(filePath);
}

/**
 * 检查是否为目录
 */
export async function isDirectory(filePath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(filePath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}
