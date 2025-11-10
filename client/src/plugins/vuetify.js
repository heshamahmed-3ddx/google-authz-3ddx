import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { en, ar } from 'vuetify/locale'

export default createVuetify({
  locale: {
    locale: 'en',
    fallback: 'en',
    messages: { en, ar },
    rtl: { ar: true },
  },
})
