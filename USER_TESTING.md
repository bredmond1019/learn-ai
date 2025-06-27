# USER_TESTING.md - Portfolio Application Manual Testing Guide

This document provides comprehensive instructions for manually testing all features implemented during our TDD development process. Please follow each section carefully and report any issues found.

## Prerequisites

1. Ensure the application is running: `npm run dev`
2. Open your browser to `http://localhost:3003`
3. Have browser developer tools ready (F12)
4. Clear browser cache/cookies before starting

## Test Sections

### 1. Internationalization (i18n) - Language Switching

**Test Steps:**
1. Navigate to homepage (`http://localhost:3003`)
2. You should be redirected to `/en` (English locale)
3. Look for the language switcher in the navigation bar (flag icon or "EN/PT" dropdown)
4. Click the language switcher and select "Português"
5. Verify:
   - [ ] URL changes to `/pt-BR`
   - [ ] All navigation items change to Portuguese ("About" → "Sobre", "Projects" → "Projetos", etc.)
   - [ ] Page content updates to Portuguese
   - [ ] Language preference persists when navigating to other pages

**Portuguese Route Mapping Test:**
1. While in Portuguese mode (`/pt-BR`), navigate to:
   - [ ] `/pt-BR/sobre` (About page)
   - [ ] `/pt-BR/projetos` (Projects page)
   - [ ] `/pt-BR/contato` (Contact page)
   - [ ] `/pt-BR/aprender` (Learn page)
2. Switch back to English and verify URLs change to:
   - [ ] `/en/about`
   - [ ] `/en/projects`
   - [ ] `/en/contact`
   - [ ] `/en/learn`

### 2. Homepage Features

**Hero Section:**
1. Check the hero section displays:
   - [ ] Profile image (optimized, no loading issues)
   - [ ] Name and title
   - [ ] Brief introduction
   - [ ] Statistics (projects, experience, etc.)
   - [ ] CTA buttons (View Projects, Contact Me)
2. Test in both English and Portuguese modes

**Featured Articles:**
1. Scroll to the Featured Articles section
2. Verify:
   - [ ] Articles are displayed in a grid
   - [ ] Each article shows title, excerpt, category, and reading time
   - [ ] Clicking an article navigates to the full blog post
   - [ ] Articles display in the correct language based on locale

### 3. Blog System

**Blog List Page (`/en/blog` or `/pt-BR/blog`):**
1. Navigate to the Blog page
2. Check for:
   - [ ] Blog posts organized by category (MCP, AI Fundamentals, Production)
   - [ ] Each post shows title, excerpt, tags, date, and reading time
   - [ ] Category sections have proper headers
   - [ ] Posts are clickable and lead to detail pages

**Blog Detail Pages:**
1. Click on any blog post
2. Verify:
   - [ ] Full article content displays correctly
   - [ ] MDX components render properly (code blocks, callouts, etc.)
   - [ ] Tags are displayed
   - [ ] Reading time is shown
   - [ ] Content matches the selected language
3. Test these specific blog posts if available:
   - [ ] "Building AI Agents with Pure Python"
   - [ ] "AI for Small and Medium Businesses"
   - [ ] Portuguese versions of the same posts

### 4. Projects System

**Projects List Page (`/en/projects` or `/pt-BR/projetos`):**
1. Navigate to the Projects page
2. Verify:
   - [ ] Featured projects appear first
   - [ ] All projects display with title, description, and tech stack
   - [ ] Filter buttons work (All, AI/ML, Full-Stack, etc.)
   - [ ] Projects have hover effects
   - [ ] Clicking a project navigates to its detail page

**Project Detail Pages:**
1. Click on a featured project (e.g., "Agentic Flow" or "AI Chatbot with RAG")
2. Check for:
   - [ ] Full project description
   - [ ] Technology stack with categories
   - [ ] Features list
   - [ ] Challenges and outcomes sections
   - [ ] Code snippets or screenshots
   - [ ] Related projects section at the bottom

### 5. Learning Management System

**Learn Landing Page (`/en/learn` or `/pt-BR/aprender`):**
1. Navigate to the Learn page
2. Verify:
   - [ ] Learning paths are displayed
   - [ ] Each path shows progress (if any)
   - [ ] Click on a learning path (e.g., "Introduction to AI & Python")

**Module Navigation:**
1. Within a learning path:
   - [ ] Module list displays in the sidebar
   - [ ] Current module is highlighted
   - [ ] Completed modules show checkmarks
   - [ ] Click between modules to navigate
   - [ ] Progress is tracked (may need to complete a quiz)

**Module Content & Components:**
1. In any module, check for these custom components:
   - [ ] **Quiz Component**: Interactive quiz with multiple choice questions
   - [ ] **Code Examples**: Syntax-highlighted code blocks with copy button
   - [ ] **Callouts**: Info/warning/tip boxes with appropriate styling
   - [ ] **Diagrams**: Mermaid diagrams render correctly (if present)

**Quiz Functionality:**
1. Find a module with a quiz
2. Test:
   - [ ] Select answers and submit
   - [ ] Feedback shows for correct/incorrect answers
   - [ ] Can retry the quiz
   - [ ] Score is displayed

### 6. Contact Form

**Form Validation (`/en/contact` or `/pt-BR/contato`):**
1. Navigate to the Contact page
2. Try submitting the form empty:
   - [ ] Validation errors appear for required fields
3. Fill in the form with:
   - Name: "Test User"
   - Email: "test@example.com"
   - Reason: "Project Inquiry"
   - Message: "This is a test message"
4. Submit and verify:
   - [ ] Success message appears
   - [ ] Form resets after submission
   - [ ] No console errors

**Rate Limiting Test:**
1. Submit the form successfully 5 times in quick succession
2. On the 6th attempt:
   - [ ] Rate limit error message should appear
   - [ ] Wait 15 minutes or refresh to reset

### 7. Navigation & Routing

**Desktop Navigation:**
1. Check the main navigation bar:
   - [ ] All links work (Home, About, Projects, Blog, Learn, Contact)
   - [ ] Active page is highlighted
   - [ ] Language switcher is accessible
   - [ ] Logo/name links to homepage

**Mobile Navigation:**
1. Resize browser to mobile width (<768px)
2. Verify:
   - [ ] Hamburger menu appears
   - [ ] Clicking opens mobile menu
   - [ ] All navigation links are accessible
   - [ ] Menu closes when clicking a link
   - [ ] Language switcher works in mobile menu

**404 Pages:**
1. Navigate to a non-existent route (e.g., `/en/doesnotexist`)
2. Verify:
   - [ ] Custom 404 page appears
   - [ ] Maintains selected language
   - [ ] Provides link back to homepage

### 8. Accessibility Features

**Keyboard Navigation:**
1. Use Tab key to navigate through the page
2. Verify:
   - [ ] All interactive elements can be reached
   - [ ] Focus indicators are visible (blue/purple outlines)
   - [ ] Skip to main content link appears when tabbing
   - [ ] Can navigate through forms using keyboard only

**Screen Reader Testing (if available):**
1. Enable screen reader (NVDA, JAWS, or VoiceOver)
2. Navigate through main sections
3. Verify:
   - [ ] Page landmarks are announced
   - [ ] Images have alt text
   - [ ] Form labels are read correctly
   - [ ] Links have descriptive text

### 9. Performance & Loading

**Page Load Performance:**
1. Open Network tab in DevTools
2. Navigate between pages and check:
   - [ ] Pages load quickly (<3 seconds)
   - [ ] Images lazy load as you scroll
   - [ ] No failed resource requests (404s)
   - [ ] Fonts load without FOUT/FOIT

**Code Splitting:**
1. In Network tab, observe:
   - [ ] Separate chunks load for different routes
   - [ ] Heavy components (Monaco Editor) load only when needed
   - [ ] Bundle sizes are reasonable

### 10. API Functionality

**Progress Tracking (if user system available):**
1. In a learning module, complete some sections
2. Navigate away and return
3. Verify:
   - [ ] Progress is maintained
   - [ ] Completed sections show as done

**API Health Check:**
1. Open browser console
2. Navigate to any page and check:
   - [ ] No API errors in console
   - [ ] Contact form submission works
   - [ ] Module content loads properly

## Issue Reporting Format

When reporting issues, please use this format:

```
**Issue Type:** [Bug/Feature Not Working/Missing Functionality]
**Page/Component:** [e.g., Blog List Page]
**Locale:** [en/pt-BR/both]
**Steps to Reproduce:**
1. 
2. 
3. 
**Expected Behavior:** 
**Actual Behavior:** 
**Browser/Device:** [e.g., Chrome 120 on MacOS]
**Console Errors:** [Copy any errors]
**Screenshot:** [If applicable]
```

## Summary Checklist

After completing all tests, summarize your findings:

- [ ] Internationalization working correctly
- [ ] All page routes accessible
- [ ] Blog system functional
- [ ] Projects display properly
- [ ] Learning system works as expected
- [ ] Contact form submits successfully
- [ ] Navigation works on all devices
- [ ] Accessibility features present
- [ ] No major performance issues
- [ ] No console errors during normal use

## Notes

- The application uses server-side rendering, so some features may behave differently with JavaScript disabled
- Rate limiting is per-IP and resets after 15 minutes
- Learning progress is currently stored in-memory and may reset on server restart
- Some Portuguese translations might be machine-generated and could benefit from native speaker review

Please complete all sections and report back with your findings!