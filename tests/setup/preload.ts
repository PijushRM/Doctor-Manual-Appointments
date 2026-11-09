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

// React Native's build flag; src/configs/api.ts picks the dev server with it.
(globalThis as {__DEV__?: boolean}).__DEV__ = true;
