"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTailState = createTailState;
exports.readNewLines = readNewLines;
exports.readFullFile = readFullFile;
const fs_1 = require("fs");
function createTailState(filePath) {
    let byteOffset = 0;
    try {
        byteOffset = (0, fs_1.statSync)(filePath).size;
    }
    catch {
        byteOffset = 0;
    }
    return { filePath, byteOffset, lineBuffer: '' };
}
function readNewLines(state) {
    let fd;
    try {
        fd = (0, fs_1.openSync)(state.filePath, 'r');
    }
    catch {
        return [];
    }
    try {
        const fileSize = (0, fs_1.statSync)(state.filePath).size;
        if (fileSize <= state.byteOffset)
            return [];
        const chunkSize = Math.min(fileSize - state.byteOffset, 1024 * 256); // 256KB max per read
        const buf = Buffer.allocUnsafe(chunkSize);
        const bytesRead = (0, fs_1.readSync)(fd, buf, 0, chunkSize, state.byteOffset);
        if (bytesRead === 0)
            return [];
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
    }
    finally {
        (0, fs_1.closeSync)(fd);
    }
}
function readFullFile(filePath) {
    let content;
    try {
        const { readFileSync } = require('fs');
        content = readFileSync(filePath, 'utf8');
    }
    catch {
        return { lines: [], lineCount: 0 };
    }
    if (content.charCodeAt(0) === 0xFEFF)
        content = content.slice(1);
    const lines = content.split(/\r?\n/);
    return { lines, lineCount: lines.length };
}
