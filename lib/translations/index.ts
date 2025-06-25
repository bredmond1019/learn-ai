import { en } from './en'
import { ptBR } from './pt-BR'

export const translations = {
  'en': en,
  'pt-BR': ptBR,
} as const

export type Locale = keyof typeof translations
export type TranslationKey = keyof typeof en

// Helper function to get translations for a locale
export function getTranslations(locale: Locale) {
  return translations[locale] || translations.en
}

// Helper function to get nested translation values
export function getTranslation(locale: Locale, key: string) {
  const t = getTranslations(locale)
  const keys = key.split('.')
  let value: any = t
  
  for (const k of keys) {
    value = value?.[k]
  }
  
  return value || key
}

// Type-safe translation hook-like function
export function createTranslator(locale: Locale) {
  const t = getTranslations(locale)
  
  return function translate(key: string): string {
    const keys = key.split('.')
    let value: any = t
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    return typeof value === 'string' ? value : key
  }
}

export { en, ptBR }