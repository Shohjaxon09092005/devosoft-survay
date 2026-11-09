# Design tokens for Devosoft landing

This file documents the brand tokens used to approximate the Devosoft public website look while keeping the survey experience premium and minimal.

## Core palette

- Background: `#041B3A` (deep navy)
- Background alt: `#0C244E`
- Surface card: `rgba(15, 23, 42, 0.7)`
- Primary accent: `#6BA6FF`
- Primary accent dark: `#1E5BFF`
- Text primary: `#F5F8FF`
- Text secondary: `#D6E2FF`
- Border: `rgba(255,255,255,0.12)`
- Glow: `rgba(107, 166, 255, 0.32)`

## Typography

- Sans: `Figtree Variable`, `Figtree`, `Segoe UI`, sans-serif
- Display serif: `Playfair Display`, Georgia, serif
- Mono: `JetBrains Mono`, monospace
- H1: 56-72px, weight 700, letter spacing -1.6px
- Eyebrow: 11px, uppercase, letter spacing 0.16em, color #A9C1FF
- Button: 15px, semi-bold, radius 999px

## Layout

- Page shell max width: 1200px
- Card radius: 22px
- Small radius: 14px
- Soft shadow: `0 24px 60px rgba(2, 8, 23, 0.45)`
- Hero top padding: 32px, gradient overlays to maintain cloud / mountain feel

## Survey specific tokens

- Survey shell: `--surface-strong: #0f1d3a`
- Form panel: `--card: rgba(12, 22, 48, 0.76)`
- Progress bar: `--accent: #7ca9ff`
- Button primary: linear gradient from `#7CB5FF` to `#4E7DFF`
- Button secondary: `rgba(255,255,255,0.06)`
- Input focus ring: `rgba(124,181,255,0.5)`

## Notes

- The site uses a premium SaaS look with sky-tone gradients and a dark marine base.
- The actual site uses a large brand-heavy hero, but the survey keeps the same mood rather than copying the exact layout.
- Fonts are served via local package imports to avoid external network reliance.
