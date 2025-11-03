// Mock localStorage for unit tests
class LocalStorageMock {
  constructor() {
    this.store = {};
  }
  clear() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
}

global.localStorage = new LocalStorageMock();

// Pinia and I18n setup for unit tests
import { createPinia, setActivePinia } from "pinia";
import { createApp } from "vue";
import { i18n } from "../i18n";

const app = createApp({});
const pinia = createPinia();
app.use(pinia);
app.use(i18n);
setActivePinia(pinia);
