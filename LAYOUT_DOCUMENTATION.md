# 📐 Social Media Website Layout Guide

## Table of Contents
1. [Layout Overview](#layout-overview)
2. [Desktop Layout (3-Column)](#desktop-layout)
3. [Mobile Layout](#mobile-layout)
4. [Component Breakdown](#component-breakdown)
5. [UX Best Practices](#ux-best-practices)
6. [Accessibility Features](#accessibility-features)
7. [Alternative Layout Options](#alternative-layout-options)
8. [Implementation Guide](#implementation-guide)

---

## Layout Overview

### Design Philosophy
- **Main Feed as Focal Point**: Center column with maximum width of 780px
- **Sticky Sidebars**: Both sidebars stick to viewport for easy navigation
- **Responsive First**: Mobile-optimized with hamburger menu
- **Modern Minimalist**: Clean design with ample whitespace

### Key Measurements
```
Desktop (>1024px):
├── Left Sidebar: 240px (sticky)
├── Main Feed: Flex-1, max 780px (focal point)
└── Right Sidebar: 350px (sticky)

Tablet (768px-1024px):
├── Left Sidebar: 200px
├── Main Feed: Flex-1
└── Right Sidebar: 300px

Mobile (<768px):
├── Left Sidebar: Overlay (280px)
├── Main Feed: 100% width
└── Right Sidebar: Hidden
```

---

## Desktop Layout (3-Column)

### Structure
```
┌─────────────────────────────────────────────────────┐
│                 FIXED HEADER (70px)                  │
│  Logo | Search Bar | Notifications | Profile        │
├──────────┬──────────────────────┬───────────────────┤
│   LEFT   │                      │      RIGHT        │
│ SIDEBAR  │     MAIN FEED        │     SIDEBAR       │
│ (Sticky) │   (Focal Point)      │    (Sticky)       │
│  240px   │   Flex-1, Max 780px  │      350px        │
│          │                      │                   │
│ • Home   │  Create Post         │  Trending Topics  │
│ • Trend  │  ┌──────────────┐    │  Suggested Users  │
│ • Categ  │  │  Post Card   │    │  Advertisements   │
│ • Comm   │  └──────────────┘    │  Related Posts    │
│ • About  │  ┌──────────────┐    │                   │
│ • Sett   │  │  Post Card   │    │                   │
│          │  └──────────────┘    │                   │
│ Quick    │  ┌──────────────┐    │                   │
│ Links    │  │  Post Card   │    │                   │
│          │  └──────────────┘    │                   │
└──────────┴──────────────────────┴───────────────────┘
```

### Flexbox Implementation
```css
.main-container {
    display: flex;
    max-width: 1600px;
    margin: 0 auto;
    gap: 2rem;
}

.left-sidebar {
    width: 240px;
    position: sticky;
    top: calc(70px + 2rem);
    flex-shrink: 0;
}

.main-feed {
    flex: 1;
    max-width: 780px;
    margin: 0 auto;
}

.right-sidebar {
    width: 350px;
    position: sticky;
    top: calc(70px + 2rem);
    flex-shrink: 0;
}
```

---

## Mobile Layout

### Hamburger Menu Implementation

**Visual Transformation:**
```
Desktop:              Mobile:
┌─────────────┐      ┌─────────────┐
│ [≡] Logo    │  →   │ ≡  Logo  🔔👤│
│ [Search]    │      └─────────────┘
│ 🔔 👤       │      
└─────────────┘      
```

**JavaScript Toggle:**
```javascript
const hamburger = document.getElementById('hamburger');
const leftSidebar = document.getElementById('leftSidebar');

hamburger.addEventListener('click', () => {
    leftSidebar.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close on outside click
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 1024) {
        if (!leftSidebar.contains(e.target) && 
            !hamburger.contains(e.target)) {
            leftSidebar.classList.remove('active');
        }
    }
});
```

### Mobile Sidebar Behavior
- **Position**: Fixed overlay from left
- **Width**: 280px
- **Animation**: Slide-in from left (-100% to 0)
- **Backdrop**: Optional dark overlay
- **Close**: Click outside or hamburger icon

---

## Component Breakdown

### 1. Fixed Header (70px)
**Purpose**: Global navigation and search
**Key Features**:
- Fixed position (always visible)
- Backdrop blur for modern effect
- Responsive search bar
- Icon-based actions

**Accessibility**:
```html
<button class="hamburger" 
        aria-label="Toggle menu"
        aria-expanded="false">
```

### 2. Left Sidebar (Navigation)
**Purpose**: Primary navigation and quick links
**Key Features**:
- Sticky positioning
- Icon + text labels
- Active state indication
- Collapsible on mobile

**Navigation Structure**:
```
├── Primary Navigation
│   ├── Home (active state)
│   ├── Trending
│   ├── Categories
│   ├── Communities
│   ├── About
│   └── Settings
└── Quick Links
    ├── Privacy Policy
    ├── Terms of Service
    └── Help Center
```

### 3. Main Feed (Focal Point)
**Purpose**: Primary content display
**Key Features**:
- Maximum width constraint (780px)
- Centered in available space
- Create post section at top
- Filter tabs
- Infinite scroll ready

**Content Hierarchy**:
```
1. Create Post Card (highest priority)
2. Feed Filters (All/Following/Popular)
3. Post Cards (chronological)
   ├── Post Header (avatar, author, time)
   ├── Post Content (title, text, image)
   └── Post Footer (like, comment, share)
```

### 4. Right Sidebar (Contextual)
**Purpose**: Supplementary content and discovery
**Key Features**:
- Sticky positioning
- Modular card system
- Trending topics
- User suggestions
- Advertisements
- Related content

**Card Priority**:
```
1. Trending Topics (highest engagement)
2. Suggested Users (growth)
3. Advertisement (revenue)
4. Related Posts (retention)
```

---

## UX Best Practices

### 1. Visual Hierarchy
✅ **Main Feed Dominance**
- Largest content area
- Centered positioning
- Maximum contrast
- Clear focal point

✅ **Sidebar Subtlety**
- Muted colors
- Smaller font sizes
- Lower visual weight
- Supporting role

### 2. Navigation Patterns
✅ **F-Pattern Reading**
```
[Logo] ─────────────→ [Search] ───→ [Actions]
  │
  ↓ [Home]
  ↓ [Trending]
  ↓ [Categories]
```

✅ **Thumb-Friendly Mobile**
- Hamburger in top-left (easy reach)
- Actions in top-right
- Bottom navigation optional

### 3. Content Spacing
```css
/* Golden Ratio Spacing */
--gap-xs: 0.5rem;   /* 8px */
--gap-sm: 0.75rem;  /* 12px */
--gap-md: 1rem;     /* 16px */
--gap-lg: 1.5rem;   /* 24px */
--gap-xl: 2rem;     /* 32px */
```

### 4. Interactive Feedback
✅ **Hover States**
```css
.nav-item:hover {
    background: rgba(59, 130, 246, 0.1);
    color: var(--accent);
    transform: translateX(4px); /* Subtle movement */
}
```

✅ **Active States**
```css
.nav-item.active {
    background: linear-gradient(135deg, 
        rgba(59, 130, 246, 0.2) 0%, 
        rgba(139, 92, 246, 0.2) 100%);
    color: var(--accent);
}
```

### 5. Loading States
- Skeleton screens for posts
- Lazy loading for images
- Infinite scroll with loading indicator
- Optimistic UI updates

---

## Accessibility Features

### 1. Keyboard Navigation
✅ **Tab Order**:
```
1. Skip to main content link
2. Logo (home link)
3. Search input
4. Navigation items
5. Main feed content
6. Sidebar links
```

✅ **Focus Indicators**:
```css
a:focus, button:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
}
```

### 2. Screen Reader Support
```html
<!-- Semantic HTML -->
<header role="banner">
<nav role="navigation" aria-label="Main navigation">
<main role="main" aria-label="Feed">
<aside role="complementary" aria-label="Sidebar">

<!-- ARIA Labels -->
<button aria-label="Like post" aria-pressed="false">
<img alt="User profile picture" src="...">
```

### 3. Color Contrast
- **WCAG AA Compliant**
- Text: 4.5:1 minimum contrast ratio
- Interactive elements: 3:1 minimum
- High contrast mode support

### 4. Responsive Text
```css
/* Fluid Typography */
font-size: clamp(0.875rem, 2vw, 1rem);
```

### 5. Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
    * {
        animation: none !important;
        transition: none !important;
    }
}
```

---

## Alternative Layout Options

### Option 1: Two-Column Layout (No Right Sidebar)
```
┌────────────────────────────────────┐
│           HEADER                    │
├──────────┬─────────────────────────┤
│   LEFT   │                         │
│ SIDEBAR  │      MAIN FEED          │
│  240px   │    (Wider, Max 900px)   │
└──────────┴─────────────────────────┘
```

**Use Case**: Content-focused platforms, blogs

**Implementation**:
```css
.main-container {
    display: flex;
    gap: 2rem;
}

.left-sidebar {
    width: 240px;
}

.main-feed {
    flex: 1;
    max-width: 900px; /* Wider than 3-column */
}

.right-sidebar {
    display: none; /* Remove right sidebar */
}
```

### Option 2: Grid Layout (Card-Based)
```
┌────────────────────────────────────┐
│           HEADER                    │
├──────────┬─────────────────────────┤
│   LEFT   │  ┌────┐ ┌────┐ ┌────┐  │
│ SIDEBAR  │  │Card│ │Card│ │Card│  │
│          │  └────┘ └────┘ └────┘  │
│          │  ┌────┐ ┌────┐ ┌────┐  │
│          │  │Card│ │Card│ │Card│  │
│          │  └────┘ └────┘ └────┘  │
└──────────┴─────────────────────────┘
```

**Use Case**: Pinterest-style, image-heavy content

**Implementation**:
```css
.main-feed {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
}
```

### Option 3: Full-Width Feed (No Sidebars)
```
┌────────────────────────────────────┐
│           HEADER                    │
├────────────────────────────────────┤
│                                     │
│         FULL-WIDTH FEED             │
│         (Max 1200px centered)       │
│                                     │
└────────────────────────────────────┘
```

**Use Case**: Immersive reading, article platforms

**Implementation**:
```css
.main-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

.left-sidebar,
.right-sidebar {
    display: none;
}

.main-feed {
    width: 100%;
    max-width: 100%;
}
```

---

## Implementation Guide

### Step 1: HTML Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Social Media Layout</title>
    <link rel="stylesheet" href="LAYOUT_GUIDE.css">
</head>
<body>
    <header class="header">...</header>
    <div class="main-container">
        <aside class="left-sidebar">...</aside>
        <main class="main-feed">...</main>
        <aside class="right-sidebar">...</aside>
    </div>
    <script src="script.js"></script>
</body>
</html>
```

### Step 2: CSS Variables
```css
:root {
    --primary-color: #3b82f6;
    --header-height: 70px;
    --sidebar-width: 240px;
    --max-feed-width: 780px;
    --gap: 2rem;
}
```

### Step 3: Flexbox Layout
```css
.main-container {
    display: flex;
    gap: var(--gap);
    max-width: 1600px;
    margin: 0 auto;
}
```

### Step 4: Sticky Positioning
```css
.left-sidebar,
.right-sidebar {
    position: sticky;
    top: calc(var(--header-height) + 2rem);
    height: fit-content;
}
```

### Step 5: Mobile Responsive
```css
@media (max-width: 768px) {
    .left-sidebar {
        position: fixed;
        left: -100%;
        transition: left 0.3s ease;
    }
    
    .left-sidebar.active {
        left: 0;
    }
    
    .right-sidebar {
        display: none;
    }
}
```

---

## Performance Optimization

### 1. CSS Optimization
- Use CSS Grid/Flexbox (no floats)
- Minimize repaints with `will-change`
- Use `transform` for animations
- Lazy load images

### 2. JavaScript Optimization
- Debounce scroll events
- Use Intersection Observer for infinite scroll
- Virtual scrolling for long lists
- Code splitting

### 3. Image Optimization
- Responsive images with `srcset`
- WebP format with fallbacks
- Lazy loading with `loading="lazy"`
- Blur-up placeholder technique

---

## Browser Support

✅ **Fully Supported**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

⚠️ **Partial Support** (with polyfills):
- IE 11 (requires Flexbox polyfill)

---

## Testing Checklist

- [ ] Desktop layout (1920px, 1440px, 1024px)
- [ ] Tablet layout (768px, 1024px)
- [ ] Mobile layout (375px, 414px, 768px)
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Color contrast (WCAG AA)
- [ ] Reduced motion preference
- [ ] Dark/Light theme toggle
- [ ] RTL language support
- [ ] Print stylesheet

---

## Resources

- **Figma Design File**: [Link to design]
- **Live Demo**: Open `LAYOUT_GUIDE.html` in browser
- **CSS File**: `LAYOUT_GUIDE.css`
- **Documentation**: This file

---

## License

This layout guide is provided as-is for educational and commercial use.

---

**Created**: 2025-01-06
**Version**: 1.0.0
**Author**: Cascade AI Assistant
