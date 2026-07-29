---
version: "alpha"
name: Yurichan Store
description: Kawaii Neo-Brutalist Design System for yurichan.store Shopify Theme
colors:
  primary: "#2b2b2b"
  bg-page: "#faf8ff"
  yuri-lilac: "#b8a7d4"
  yuri-pink: "#ffb7b2"
  yuri-yellow: "#fff176"
  yuri-mint: "#b5ead7"
  surface: "#ffffff"
typography:
  heading-xl:
    fontFamily: Fredoka
    fontSize: 2.5rem
    fontWeight: 700
  heading-lg:
    fontFamily: Fredoka
    fontSize: 1.875rem
    fontWeight: 700
  body-md:
    fontFamily: Outfit
    fontSize: 1rem
    fontWeight: 400
  button-label:
    fontFamily: Fredoka
    fontSize: 1rem
    fontWeight: 700
rounded:
  card: 1.25rem
  badge: 9999px
  button: 9999px
spacing:
  container: 1.75rem
  card-padding: 1.5rem
components:
  button-primary:
    backgroundColor: "{colors.yuri-lilac}"
    textColor: "{colors.primary}"
    rounded: "{rounded.button}"
    padding: 0.6rem 1.4rem
  button-primary-hover:
    backgroundColor: "#c9bae4"
  badge:
    backgroundColor: "{colors.yuri-yellow}"
    textColor: "{colors.primary}"
    rounded: "{rounded.badge}"
  badge-sale:
    backgroundColor: "{colors.yuri-pink}"
    textColor: "{colors.primary}"
    rounded: "{rounded.badge}"
  badge-info:
    backgroundColor: "{colors.yuri-mint}"
    textColor: "{colors.primary}"
    rounded: "{rounded.badge}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.card}"
  page-layout:
    backgroundColor: "{colors.bg-page}"
    textColor: "{colors.primary}"
---

## Overview

Kawaii Neo-Brutalism meets modern E-commerce functionality. The UI combines playful pastel aesthetics with high-contrast structural borders (`3px solid #2b2b2b`) and hard offset drop shadows (`4px 4px 0px #2b2b2b`) without blur.

## Colors

- **Primary (#2b2b2b):** Dark charcoal for high-contrast text, borders, and hard offset shadows.
- **Page Background (#faf8ff):** Ultra-soft pastel lavender background.
- **Yuri Lilac (#b8a7d4):** Primary brand accent for buttons and active states.
- **Yuri Pink (#ffb7b2):** Highlight color for sale badges, accents, and hover transitions.
- **Yuri Yellow (#fff176):** Attention color for announcement marquee, badges, and primary CTA accents.
- **Yuri Mint (#b5ead7):** Secondary accent color for informational highlights and success states.

## Typography

- **Fredoka (`font-fredoka`):** Rounded, bold, playful Google Font used for headings (`h1`-`h6`), product titles, price tags, badges, and CTA button labels.
- **Outfit (`font-outline`):** Clean, geometric Google Font used for body copy, navigation links, forms, product descriptions, and policies.

## Layout

- Max container width: `max-w-7xl mx-auto px-4`
- Product Grids: `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6`

## Shapes

- **Cards:** Rounded `1.25rem` (`20px`) corners with `3px solid #2b2b2b` border and `4px 4px 0px #2b2b2b` shadow.
- **Buttons & Badges:** Full pill-shaped `rounded-full` (`9999px`) with solid black borders.

## Components

- **Primary Button (`neo-button`):** Pill-shaped, lilac background, thick black border, hard offset shadow, default padding `0.6rem 1.4rem`.
- **Card (`neo-card`):** White background, thick black border, rounded `1.25rem` corners, hard offset shadow.

## Do's and Don'ts

- **Do:** Keep buttons clean without emojis inside button labels or CTA text.
- **Do:** Use `{{ routes.account_url }}` for Shopify customer authentication links.
- **Don't:** Import legacy Dawn CSS stylesheets. Use Tailwind CSS v4 utility classes.
- **Don't:** Add soft blurred shadows. All shadows must be hard 0-blur offsets (`4px 4px 0px #2b2b2b`).
