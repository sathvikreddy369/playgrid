# Design System

PlayGrid's user interface is built on a modern, cohesive design system prioritizing a premium, glassmorphic dark-mode aesthetic.

## Philosophy

Every screen should feel intentionally designed and "alive". We utilize micro-animations, rich gradients, and precise spacing to deliver an application that feels like a polished startup product.

## Tech Stack

- **Framework**: Tailwind CSS (Utility-first CSS)
- **Component Library**: shadcn/ui (Radix primitives)
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Core Components

We rely heavily on reusable, highly customized components located in `frontend/src/components/ui`. 
- **Button**: Supports multiple variants (`default`, `secondary`, `outline`, `ghost`, `destructive`) and integrated loading states (`isLoading`).
- **Card**: Used universally to enclose content blocks (Matches, Posts, Communities) with consistent padding and glassmorphic backgrounds.
- **Input / Select**: Standardized form controls ensuring consistent focus rings and validation states.

## Accessibility (a11y)

The design system incorporates accessibility as a first-class citizen:
- Radix primitives (via shadcn/ui) guarantee full ARIA support and keyboard navigation for complex components like Dialogs, Selects, and Tabs.
- Contrast ratios strictly adhere to WCAG AA standards.

## Responsiveness

PlayGrid follows a mobile-first design approach. Tailwind's breakpoint prefixes (`md:`, `lg:`) are used universally to ensure layouts scale fluidly from small smartphone screens to large desktop monitors without breaking or stretching.
