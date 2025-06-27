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

### Phase 4: Blog System Tests ✅ COMPLETED

#### Blog List Page
- [x] Should display blog posts for current locale
- [x] Should sort by category (MCP, AI Fundamentals, Production)
- [x] Should show correct excerpts
- [x] Should link to individual blog posts
- [x] Should categorize posts correctly
- [x] Should handle Portuguese locale
- [x] Should show empty state when no posts exist
- [x] Should display navigation sections for categories

#### Blog Post Page
- [x] Should render blog post when post exists
- [x] Should render post tags correctly
- [x] Should render MDX content with custom components
- [x] Should handle Portuguese locale
- [x] Should call notFound when post does not exist
- [x] Should generate correct metadata for existing post
- [x] Should generate fallback metadata for non-existent post
- [x] Should generate static params for all locales and slugs

#### BlogCardServer Component
- [x] Should render blog post with all data
- [x] Should format and display the date correctly
- [x] Should render tags when present
- [x] Should not render tags section when tags array is empty
- [x] Should generate correct link URL from post slug
- [x] Should have proper hover effects structure
- [x] Should render article with correct semantic structure
- [x] Should handle edge cases for long content and reading times

### Phase 5: Project System Tests

#### Projects Page
- [x] Should load projects for current locale
- [x] Should filter by category
- [x] Should display project cards with correct data
- [x] Should handle empty states

#### Project Detail Page
- [x] Should display full project information
- [x] Should show technologies used
- [x] Should display screenshots/media (code snippets)
- [x] Should handle missing projects (404)
- [x] Should generate correct metadata for existing projects
- [x] Should generate fallback metadata for non-existent projects
- [x] Should generate static params for all locales and slugs

### Phase 6: API Route Tests ✅ COMPLETED

#### Contact API
- [x] Should send email via Resend
- [x] Should validate required fields
- [x] Should handle rate limiting
- [x] Should return appropriate error messages
- [x] Should handle email service error scenarios
- [x] Should handle spam detection scenarios
- [x] Should handle JSON parsing errors

#### Progress API
- [x] GET should return user progress
- [x] POST should save progress
- [x] Should handle invalid module IDs
- [x] Should validate required parameters
- [x] Should merge progress data correctly
- [x] Should determine delete scope correctly
- [x] Should handle authentication requirements (structure ready)

### Phase 7: Utility Function Tests ✅ COMPLETED

#### Translation utilities
- [x] createTranslator should return correct translations
- [x] Should handle missing translation keys
- [x] Should fall back to English for missing Portuguese translations

#### MDX utilities
- [x] Should parse frontmatter correctly
- [x] Should handle code blocks
- [x] Should process custom components

#### Image optimization
- [x] Should generate blur data URLs
- [x] Should handle different image formats
- [x] Should optimize for performance

### Phase 8: Integration Tests 🚧 IN PROGRESS

#### Navigation Flow
- [x] User can navigate between pages maintaining locale
- [x] Language switch persists across navigation
- [x] Deep links work with locale prefix

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

**Completed Phases:**
- ✅ Phase 1: Fixed existing component tests - established green baseline
- ✅ Phase 2: Core component tests (Hero, Navigation, LanguageSwitcher)
- ✅ Phase 3: Learning system tests (ModuleRenderer, Navigation, Progress)
- ✅ Phase 4: Blog system tests (List Page, Detail Page, BlogCardServer)
- ✅ Phase 5: Project system tests (Projects Page, ProjectsPageClient, Project Detail Page)
- ✅ Phase 6: API route tests (Contact API, Progress API)
- ✅ Phase 7: Utility function tests (Translation, MDX, Image optimization)

**Next Phase:** Phase 8 - Integration Tests

Successfully completed comprehensive utility function tests following TDD methodology. All translation, MDX processing, and image optimization utilities are thoroughly tested and validated.