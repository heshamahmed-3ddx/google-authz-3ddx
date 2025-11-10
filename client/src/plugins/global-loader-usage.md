Registering the plugin (main.js)

```js
import { createApp } from 'vue'
import App from './App.vue'
import globalLoaderPlugin from '@/plugins/global-loader'
import GlobalLoader from '@/components/GlobalLoaderSimple.vue'

const app = createApp(App)
app.use(globalLoaderPlugin)
app.component('GlobalLoader', GlobalLoader)
app.mount('#app')
```

Using in a component (Composition API)

```js
import { showLoader, hideLoader } from '@/plugins/global-loader'

async function loadData() {
  showLoader()
  try {
    const res = await fetch('/api/some/long/task')
    // process
  } finally {
    hideLoader()
  }
}
```

Using in Options API / templates

```vue
<template>
  <GlobalLoader />
</template>

<script>
export default {
  mounted() {
    this.$showLoader()
    someAsync().finally(() => this.$hideLoader())
  }
}
</script>
```

Notes
- The plugin uses a 200ms debounce by default. If the operation finishes before 200ms the overlay will not be shown.
- The `isLoading` exported symbol is a readonly computed reactive that can be imported directly or accessed via `inject('globalLoader')`.
