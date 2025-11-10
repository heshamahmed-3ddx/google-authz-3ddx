import { useLocale } from 'vuetify'

export function useLocaleToggle() {
  const { current } = useLocale()
  function toggleLocale() {
    current.value = current.value === 'en' ? 'ar' : 'en'
  }
  return { current, toggleLocale }
}
