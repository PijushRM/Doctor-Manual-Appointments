import {afterEach, describe, expect, it, spyOn} from 'bun:test';
import {logFailure, logRequest, logResponse} from 'src/services/networkLog';
import {setLogLevel} from 'src/utils/logger';

afterEach(() => setLogLevel('off'));

const printed = (spy: {mock: {calls: unknown[][]}}) =>
  spy.mock.calls.map(c => c.map(String).join(' ')).join('\n');

describe('network log', () => {
  it('prints each call at debug level, but never passwords or tokens', () => {
    setLogLevel('debug');
    const log = spyOn(console, 'log').mockImplementation(() => {});
    logRequest('POST', '/api/auth/login', {
      identifier: 'dr@x.in',
      password: 'secret1',
    });
    logResponse('POST', '/api/auth/login', 200, 120, {
      token: 'eyJabc',
      doctor: {name: 'A'},
    });
    logRequest('GET', '/api/files/1?sig=eyJfile', undefined);
    const out = printed(log);
    log.mockRestore();
    expect(out).toContain('DEBUG api');
    expect(out).toContain('→ POST /api/auth/login');
    expect(out).toContain('dr@x.in');
    expect(out).toContain('← 200 POST /api/auth/login 120ms');
    expect(out).not.toContain('secret1');
    expect(out).not.toContain('eyJabc');
    expect(out).not.toContain('eyJfile');
  });

  it('shows only failures at warn level', () => {
    setLogLevel('warn');
    const log = spyOn(console, 'log').mockImplementation(() => {});
    const warn = spyOn(console, 'warn').mockImplementation(() => {});
    logRequest('GET', '/api/sync', undefined);
    logResponse('GET', '/api/sync', 200, 80, {});
    logFailure('GET', '/api/sync', 20000, 'timed out');
    const calls = log.mock.calls.length;
    const out = printed(warn);
    log.mockRestore();
    warn.mockRestore();
    expect(calls).toBe(0);
    expect(out).toContain('✕ GET /api/sync 20000ms — timed out');
  });
});
