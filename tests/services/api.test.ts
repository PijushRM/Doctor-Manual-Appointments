import {beforeEach, describe, expect, it} from 'bun:test';
import {ApiError, api, messageFor} from 'src/services/api';
import {useAuthStore} from 'src/store/useAuthStore';
import {errorText} from 'src/i18n/strings/errors';
import {errorMessage} from 'src/utils/errors';

const {
  offline: OFFLINE_MESSAGE,
  server: SERVER_MESSAGE,
  timeout: TIMEOUT_MESSAGE,
  unavailable: UNAVAILABLE_MESSAGE,
  unexpected: UNEXPECTED_MESSAGE,
} = errorText.en;
import {fakeServer} from '../setup/fakeServer';

beforeEach(() => {
  useAuthStore.setState({token: 'tok', isLoggedIn: true});
});

describe('messageFor', () => {
  it('uses the server’s message for problems with what was sent', () => {
    expect(
      messageFor(400, {
        error: 'Validation failed',
        details: {phone: 'Enter a valid phone number.'},
      }),
    ).toBe('Enter a valid phone number.');
    expect(messageFor(409, {error: 'Already booked'})).toBe('Already booked');
    expect(messageFor(400, null)).toBe(
      'Please check the details and try again.',
    );
  });

  it('never shows the server’s technical text for server faults', () => {
    expect(messageFor(500, {error: 'MongoServerError: E11000'})).toBe(
      SERVER_MESSAGE,
    );
    expect(messageFor(502, null)).toBe(UNAVAILABLE_MESSAGE);
    expect(messageFor(503, null)).toBe(UNAVAILABLE_MESSAGE);
    expect(messageFor(504, null)).toBe(TIMEOUT_MESSAGE);
  });

  it('explains the common status codes in plain words', () => {
    expect(messageFor(401, null)).toBe(
      'Your session has expired. Please log in again.',
    );
    expect(messageFor(401, {error: 'Wrong password'}, false)).toBe(
      'Wrong password',
    );
    expect(messageFor(403, null)).toBe('You don’t have permission to do this.');
    expect(messageFor(404, null)).toBe(
      'This was not found. It may have been deleted.',
    );
    expect(messageFor(413, null)).toBe(
      'This file is too large for the server.',
    );
    expect(messageFor(429, null)).toBe(
      'Too many attempts. Please wait a minute and try again.',
    );
  });
});

describe('request failures', () => {
  it('reports no connection as offline', async () => {
    fakeServer(() => 'offline');
    const error = await api.sync().catch(e => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({status: 0, message: OFFLINE_MESSAGE});
  });

  it('turns an HTML error page (proxy or tunnel down) into a readable message', async () => {
    globalThis.fetch = (async () =>
      new Response('<html>Bad gateway</html>', {
        status: 502,
        headers: {'Content-Type': 'text/html'},
      })) as unknown as typeof fetch;
    await expect(api.sync()).rejects.toMatchObject({
      status: 502,
      message: UNAVAILABLE_MESSAGE,
    });
  });

  it('rejects a successful answer that isn’t JSON instead of using it', async () => {
    globalThis.fetch = (async () =>
      new Response('<html>Tunnel warning page</html>', {
        status: 200,
        headers: {'Content-Type': 'text/html'},
      })) as unknown as typeof fetch;
    await expect(api.sync()).rejects.toMatchObject({
      message: UNEXPECTED_MESSAGE,
    });
  });
});

describe('errorMessage', () => {
  it('shows messages written for the doctor, and hides technical ones', () => {
    expect(errorMessage(new ApiError(0, OFFLINE_MESSAGE))).toBe(
      OFFLINE_MESSAGE,
    );
    expect(errorMessage(new TypeError('undefined is not a function'))).toBe(
      'Something went wrong. Please try again.',
    );
    expect(errorMessage('weird', 'Fallback')).toBe('Fallback');
  });
});
