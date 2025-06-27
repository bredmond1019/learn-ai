/**
 * @jest-environment jsdom
 */

import { createTranslator, getTranslation, getTranslations } from '@/lib/translations'

describe('Translation Utilities', () => {
  describe('createTranslator', () => {
    it('should return correct translations for English', () => {
      const t = createTranslator('en')
      
      expect(t('nav.home')).toBe('Home')
      expect(t('nav.about')).toBe('About')
      expect(t('hero.title')).toBe('From Teaching Math to')
      expect(t('ui.loading')).toBe('Loading...')
    })

    it('should handle missing translation keys gracefully', () => {
      const t = createTranslator('en')
      
      expect(t('nonexistent.key')).toBe('nonexistent.key')
      expect(t('nav.nonexistent')).toBe('nav.nonexistent')
      expect(t('deeply.nested.missing.key')).toBe('deeply.nested.missing.key')
    })

    it('should return correct translations for Portuguese', () => {
      const t = createTranslator('pt-BR')
      
      expect(t('nav.home')).toBe('Início')
      expect(t('nav.about')).toBe('Sobre')
      expect(t('hero.title')).toBe('De Ensinar Matemática a')
      expect(t('ui.loading')).toBe('Carregando...')
    })
  })

  describe('getTranslations', () => {
    it('should return translations for valid locale', () => {
      const enTranslations = getTranslations('en')
      const ptTranslations = getTranslations('pt-BR')
      
      expect(enTranslations.nav.home).toBe('Home')
      expect(ptTranslations.nav.home).toBe('Início')
    })

    it('should fallback to English for missing Portuguese translations', () => {
      // RED: Test that getTranslations falls back to English when Portuguese locale doesn't exist
      const invalidTranslations = getTranslations('invalid' as any)
      
      expect(invalidTranslations.nav.home).toBe('Home') // Should fallback to English
    })
  })

  describe('getTranslation', () => {
    it('should get nested translation values', () => {
      expect(getTranslation('en', 'nav.home')).toBe('Home')
      expect(getTranslation('pt-BR', 'nav.home')).toBe('Início')
      expect(getTranslation('en', 'hero.title')).toBe('From Teaching Math to')
    })

    it('should return key when translation not found', () => {
      expect(getTranslation('en', 'nonexistent.key')).toBe('nonexistent.key')
      expect(getTranslation('pt-BR', 'missing.translation')).toBe('missing.translation')
    })
  })
})