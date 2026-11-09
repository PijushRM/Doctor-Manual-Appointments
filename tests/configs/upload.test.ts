import {describe, expect, it} from 'bun:test';
import {MAX_UPLOAD_BYTES, parseMaxUploadBytes} from 'src/configs/upload';

const MB = 1024 * 1024;

describe('parseMaxUploadBytes', () => {
  it('reads MAX_UPLOAD_MB from .env as megabytes', () => {
    expect(parseMaxUploadBytes('5')).toBe(5 * MB);
    expect(parseMaxUploadBytes(' 0.5 ')).toBe(0.5 * MB);
  });

  it('defaults to 1 MB when missing or invalid', () => {
    for (const value of [undefined, '', '  ', 'abc', '0', '-2']) {
      expect(parseMaxUploadBytes(value)).toBe(MB);
    }
  });

  it('is 1 MB when .env does not set it', () => {
    expect(MAX_UPLOAD_BYTES).toBe(MB);
  });
});
