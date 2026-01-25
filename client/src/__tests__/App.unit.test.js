/* global describe, it, expect */
import { mount } from "@vue/test-utils";
import { createMemoryHistory, createRouter } from "vue-router";
import App from "../App.vue";
import { createPinia } from "pinia";
import { i18n } from "../i18n";
import { createVuetify } from "vuetify";

const vuetify = createVuetify();

// Create a mock router
const routes = [
  { path: "/", name: "home", component: { template: "<div>Home</div>" } },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

describe("App.vue", () => {
  it("renders without crashing", async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [createPinia(), i18n, vuetify, router],
      },
    });
    await router.isReady();
    expect(wrapper.exists()).toBe(true);
  });
});
