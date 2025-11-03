/* global describe, it, expect */
import { mount } from "@vue/test-utils";
import App from "../App.vue";
import { createPinia } from "pinia";
import { i18n } from "../i18n";
import { createVuetify } from "vuetify";

const vuetify = createVuetify();

describe("App.vue", () => {
  it("renders without crashing", () => {
    const wrapper = mount(App, {
      global: {
        plugins: [createPinia(), i18n, vuetify],
      },
    });
    expect(wrapper.exists()).toBe(true);
  });
});
