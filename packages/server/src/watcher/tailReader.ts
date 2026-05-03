import { openSync, readSync, closeSync, statSync } from 'fs';

export interface TailState {
  filePath: string;
  byteOffset: number;
  lineBuffer: string;
}

export function createTailState(filePath: string): TailState {
  let byteOffset = 0;
  try {
    byteOffset = statSync(filePath).size;
  } catch {
    byteOffset = 0;
  }
  return { filePath, byteOffset, lineBuffer: '' };
}

export function readNewLines(state: TailState): string[] {
  let fd: number;
  try {
    fd = openSync(state.filePath, 'r');
  } catch {
    return [];
  }

  try {
    const fileSize = statSync(state.filePath).size;
    if (fileSize <= state.byteOffset) return [];

    const chunkSize = Math.min(fileSize - state.byteOffset, 1024 * 256); // 256KB max per read
    const buf = Buffer.allocUnsafe(chunkSize);
    const bytesRead = readSync(fd, buf, 0, chunkSize, state.byteOffset);
    if (bytesRead === 0) return [];

    state.byteOffset += bytesRead;

    let text = buf.slice(0, bytesRead).toString('utf8');
    // Strip BOM only at the very beginning of the file
    if (state.byteOffset === bytesRead && text.charCodeAt(0) === 0xFEFF) {
      text = text.slice(1);
    }

    const combined = state.lineBuffer + text;
    const lines = combined.split(/\r?\n/);
    // Last element may be an incomplete line — keep it in the buffer
    state.lineBuffer = lines.pop() ?? '';
    return lines;
  } finally {
    closeSync(fd);
  }
}

export function readFullFile(filePath: string): { lines: string[]; lineCount: number } {
  let content: string;
  try {
    const { readFileSync } = require('fs');
    content = readFileSync(filePath, 'utf8');
  } catch {
    return { lines: [], lineCount: 0 };
  }
  if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
  const lines = content.split(/\r?\n/);
  return { lines, lineCount: lines.length };
}
