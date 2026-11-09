import {describe, expect, it} from 'bun:test';
import {parseLogLevel} from 'src/utils/logger';

describe('parseLogLevel', () => {
  it('reads LOG_LEVEL from .env', () => {
    expect(parseLogLevel('info', true)).toBe('info');
    expect(parseLogLevel(' WARN ', false)).toBe('warn');
    expect(parseLogLevel('off', true)).toBe('off');
  });

  it('defaults to everything in debug builds, warnings in release', () => {
    expect(parseLogLevel(undefined, true)).toBe('debug');
    expect(parseLogLevel('nonsense', false)).toBe('warn');
  });
});
