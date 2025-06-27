# TDD Test Plan for Portfolio Project

This plan follows Kent Beck's Test-Driven Development methodology. Each test should be implemented one at a time following the Red-Green-Refactor cycle.

## Test Implementation Order

### Phase 1: Fix Existing Component Tests

- [x] Fix Hero.test.tsx - Add locale prop support
- [x] Fix FeaturedArticles test - (No test file exists, skipping)
- [x] Fix ContactForm test - Ensure form validation works
- [x] Fix Navigation test - Test language switching
- [x] Fix ProjectCard test - Test internationalized content

### Phase 2: Core Component Tests

#### Hero Component
- [x] Should render with English locale
- [x] Should render with Portuguese locale
- [x] Should display correct translations for each locale
- [x] Should render profile image with proper optimization
- [x] Should display statistics with translated labels

#### Navigation Component
- [x] Should render navigation links for current locale
- [x] Should highlight active route
- [x] Language switcher should toggle between en/pt-BR
- [x] Mobile menu should open and close correctly
- [x] Should maintain locale in navigation links

#### LanguageSwitcher Component
- [x] Should display current language
- [x] Should show dropdown on click
- [x] Should switch locale and redirect to same page
- [x] Should not overlap with dropdown arrow (regression test)

### Phase 3: Learning System Tests

#### ModuleRenderer Component
- [x] Should render MDX content correctly
- [x] Should handle Quiz components
- [x] Should handle CodeExample components
- [ ] Should handle Diagram components with Mermaid (skipped - not implemented)
- [x] Should handle Callout components
- [x] Should preserve Python code examples functionality

#### Module Navigation
- [x] Should show previous/next navigation
- [x] Should disable previous on first module
- [x] Should disable next on last module
- [x] Should maintain locale in navigation links

#### Progress Tracking
- [x] Should save progress to API
- [x] Should retrieve progress from API
- [x] Should handle errors gracefully
- [x] Should show completion status

### Phase 4: Blog System Tests

#### Blog List Page
- [ ] Should display blog posts for current locale
- [ ] Should sort by date (newest first)
- [ ] Should show correct excerpts
- [ ] Should link to individual blog posts

#### Blog Post Page
- [ ] Should render MDX content
- [ ] Should display metadata (date, author, tags)
- [ ] Should handle code syntax highlighting
- [ ] Should show reading time

### Phase 5: Project System Tests

#### Projects Page
- [ ] Should load projects for current locale
- [ ] Should filter by category
- [ ] Should display project cards with correct data
- [ ] Should handle empty states

#### Project Detail Page
- [ ] Should display full project information
- [ ] Should show technologies used
- [ ] Should display screenshots/media
- [ ] Should handle missing projects (404)

### Phase 6: API Route Tests

#### Contact API
- [ ] Should send email via Resend
- [ ] Should validate required fields
- [ ] Should handle rate limiting
- [ ] Should return appropriate error messages

#### Progress API
- [ ] GET should return user progress
- [ ] POST should save progress
- [ ] Should handle invalid module IDs
- [ ] Should require authentication (if implemented)

### Phase 7: Utility Function Tests

#### Translation utilities
- [ ] createTranslator should return correct translations
- [ ] Should handle missing translation keys
- [ ] Should fall back to English for missing Portuguese translations

#### MDX utilities
- [ ] Should parse frontmatter correctly
- [ ] Should handle code blocks
- [ ] Should process custom components

#### Image optimization
- [ ] Should generate blur data URLs
- [ ] Should handle different image formats
- [ ] Should optimize for performance

### Phase 8: Integration Tests

#### Navigation Flow
- [ ] User can navigate between pages maintaining locale
- [ ] Language switch persists across navigation
- [ ] Deep links work with locale prefix

#### Content Loading
- [ ] Blog posts load correctly for each locale
- [ ] Projects load with proper translations
- [ ] Learning modules maintain state during navigation

#### Form Submission
- [ ] Contact form submits and shows success message
- [ ] Validation errors display correctly
- [ ] Rate limiting message appears after limit

### Phase 9: Accessibility Tests

#### Keyboard Navigation
- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible
- [ ] Skip links work correctly

#### Screen Reader Support
- [ ] ARIA labels are present and correct
- [ ] Heading hierarchy is logical
- [ ] Form labels are associated correctly

### Phase 10: Performance Tests

#### Bundle Size
- [ ] Lazy loading works for heavy components
- [ ] Code splitting functions correctly
- [ ] Fonts load with proper strategy

#### SEO
- [ ] Meta tags are present for all pages
- [ ] Open Graph tags are correct
- [ ] Sitemap generates correctly

## Implementation Notes

1. **One test at a time**: Implement each checkbox as a single test following TDD cycle
2. **Red first**: Write failing test before implementation
3. **Minimal implementation**: Write just enough code to make test pass
4. **Refactor when green**: Only refactor with passing tests
5. **Commit discipline**: Separate structural and behavioral changes
6. **Run all tests**: After each new test passes, run full suite

## Current Status

Starting with Phase 1 - Fixing existing component tests to establish a green baseline.