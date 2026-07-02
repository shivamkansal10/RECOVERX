---
name: FindIt
colors:
  surface: '#f9f9f7'
  surface-dim: '#dadad8'
  surface-bright: '#f9f9f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f4f2'
  surface-container: '#eeeeec'
  surface-container-high: '#e8e8e6'
  surface-container-highest: '#e2e3e1'
  on-surface: '#1a1c1b'
  on-surface-variant: '#444748'
  inverse-surface: '#2f3130'
  inverse-on-surface: '#f1f1ef'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#9f4200'
  on-secondary: '#ffffff'
  secondary-container: '#ff843d'
  on-secondary-container: '#672800'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1c1b1a'
  on-tertiary-container: '#868382'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474746'
  secondary-fixed: '#ffdbcb'
  secondary-fixed-dim: '#ffb691'
  on-secondary-fixed: '#341100'
  on-secondary-fixed-variant: '#793100'
  tertiary-fixed: '#e6e2df'
  tertiary-fixed-dim: '#cac6c4'
  on-tertiary-fixed: '#1c1b1a'
  on-tertiary-fixed-variant: '#484645'
  background: '#f9f9f7'
  on-background: '#1a1c1b'
  surface-variant: '#e2e3e1'
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 20px
  section-gap: 80px
---

## Brand & Style
The design system is built on a foundation of **Minimalism** with an **Editorial** flair. It prioritizes clarity and utility for a campus environment while maintaining the polished feel of a high-end SaaS product. The brand personality is dependable, calm, and organized.

The UI leverages generous whitespace to reduce cognitive load during the potentially stressful experience of losing an item. The aesthetic is characterized by a warm, off-white canvas, sophisticated neutral tones, and a single, energetic accent color used with surgical precision.

## Colors
This design system utilizes a high-contrast but warm palette. 

- **Surfaces**: The primary background uses a warm cream (#FAFAF8) to avoid the harshness of pure white, while pure white (#FFFFFF) is reserved for elevated cards and input fields to create a subtle layered effect.
- **Accents**: The warm orange (#E8722C) is the "hero" color, used only for critical calls to action or tiny brand moments.
- **Semantic States**: Statuses use desaturated, organic tones (Terracotta, Sage, and Gray-blue) to provide information without overwhelming the minimal aesthetic.

## Typography
The typography system relies on **Inter** for its systematic precision and modern feel. 

- **Headlines**: Use bold weights with tight line heights and slight negative letter spacing to achieve an "editorial" impact.
- **Body**: Uses standard weights with generous line heights (1.6) to ensure maximum legibility when users are scanning lists of lost items.
- **Scale**: Large display sizes are encouraged for landing pages and empty states to embrace the minimal-but-bold philosophy.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a strict 8px rhythmic spacing system. 

- **Desktop**: A 12-column grid with 24px gutters. Content is typically centered in a 1200px container.
- **Mobile**: A 4-column grid with 20px side margins. 
- **Sectioning**: Use significant vertical padding (80px+) between major content blocks to emphasize the "clean" and "open" brand feel.
- **Sidebar**: The app layout uses a fixed 240px sidebar on desktop, collapsing to a bottom navigation bar on mobile devices.

## Elevation & Depth
This design system uses **Tonal Layering** and **Ambient Shadows** to create depth without visual clutter.

- **Level 0**: Background (#FAFAF8).
- **Level 1 (Cards)**: White (#FFFFFF) surfaces with a very soft, diffused shadow (0px 4px 20px rgba(0,0,0,0.04)).
- **Outlines**: Use thin, low-contrast borders (1px solid #E6E6E2) instead of shadows for secondary elements like input fields and secondary buttons.
- **Overlays**: Modals use a backdrop blur (8px) with a semi-transparent cream overlay to maintain the "glass" quality while staying warm.

## Shapes
The shape language is friendly and modern, utilizing a mix of "Rounded" and "Pill" geometries.

- **Standard Containers**: Use a 16px (1rem) radius for cards and large blocks.
- **Interactive Elements**: Buttons, chips, and tags are strictly **pill-shaped** (full radius) to contrast against the structured grid.
- **Imagery**: Item photos should use soft circular crops or 16px rounded corners to maintain consistency with the card containers.
- **Decorative**: Use thin (1px) outline circles and small 4x4 dotted grid patterns in corners as subtle background texture.

## Components
- **Buttons**:
    - **Primary**: Pill-shaped, #1A1A1A background, White text. Bold and authoritative.
    - **Secondary**: Pill-shaped, White background, 1px border (#E6E6E2), #1A1A1A text.
- **Cards**: Pure white background, 16px corner radius, soft ambient shadow. Used for item listings.
- **Chips/Status**: Small, pill-shaped tags using the muted status colors with dark-tinted text for readability.
- **Inputs**: 12px vertical padding, 16px horizontal. White background with a subtle light-gray border that darkens on focus.
- **Navigation**:
    - Sidebar links are minimalist; active states are indicated by a small orange dot or a subtle charcoal pill-shaped background.
- **Decorative Elements**: Small dotted-grid patterns can be placed behind cards or in the page header to add a "technical but light" feel.