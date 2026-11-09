import {mock} from 'bun:test';

// In-memory stand-in for the native MMKV module: one Map per instance id.
export const mmkvInstances = new Map<string, Map<string, string>>();

class MemoryMMKV {
  constructor(private data: Map<string, string>) {}
  getString = (key: string) => this.data.get(key) ?? null;
  setString = (key: string, value: string) => {
    this.data.set(key, value);
    return true;
  };
  removeItem = (key: string) => this.data.delete(key);
}

class MMKVLoader {
  private id = 'default';
  withInstanceID(id: string) {
    this.id = id;
    return this;
  }
  withEncryption() {
    return this;
  }
  initialize() {
    if (!mmkvInstances.has(this.id)) {
      mmkvInstances.set(this.id, new Map());
    }
    return new MemoryMMKV(mmkvInstances.get(this.id)!);
  }
}

mock.module('react-native-mmkv-storage', () => ({MMKVLoader}));

// .env values are inlined by Babel in the app; Bun doesn't run Babel, so stub them.
mock.module('@env', () => ({
  API_URL: 'http://localhost:3000',
  MAX_UPLOAD_MB: undefined,
}));

// React Native's build flag.
(globalThis as {__DEV__?: boolean}).__DEV__ = true;
