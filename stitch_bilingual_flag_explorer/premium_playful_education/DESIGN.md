---
name: Premium Playful Education
colors:
  surface: '#f7f9ff'
  surface-dim: '#d6dae1'
  surface-bright: '#f7f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f4fb'
  surface-container: '#eaeef5'
  surface-container-high: '#e4e8ef'
  surface-container-highest: '#dee3e9'
  on-surface: '#171c21'
  on-surface-variant: '#3e4851'
  inverse-surface: '#2c3136'
  inverse-on-surface: '#edf1f8'
  outline: '#6e7882'
  outline-variant: '#bec8d3'
  surface-tint: '#006495'
  primary: '#006495'
  on-primary: '#ffffff'
  primary-container: '#2bb1ff'
  on-primary-container: '#004163'
  inverse-primary: '#90cdff'
  secondary: '#735c00'
  on-secondary: '#ffffff'
  secondary-container: '#fccc00'
  on-secondary-container: '#6d5700'
  tertiary: '#2b6c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#59be1b'
  on-tertiary-container: '#1a4600'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cbe6ff'
  primary-fixed-dim: '#90cdff'
  on-primary-fixed: '#001e30'
  on-primary-fixed-variant: '#004b71'
  secondary-fixed: '#ffe084'
  secondary-fixed-dim: '#efc200'
  on-secondary-fixed: '#231b00'
  on-secondary-fixed-variant: '#574500'
  tertiary-fixed: '#92fc58'
  tertiary-fixed-dim: '#77de3d'
  on-tertiary-fixed: '#082100'
  on-tertiary-fixed-variant: '#1f5100'
  background: '#f7f9ff'
  on-background: '#171c21'
  surface-variant: '#dee3e9'
typography:
  headline-lg:
    fontFamily: Quicksand
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Quicksand
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
  headline-md:
    fontFamily: Quicksand
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
  body-lg:
    fontFamily: Quicksand
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-md:
    fontFamily: Quicksand
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 24px
  label-bold:
    fontFamily: Quicksand
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 20px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 8px
  container-margin: 24px
  gutter: 16px
  touch-target-min: 48px
  card-padding: 20px
---

## Brand & Style
The design system is engineered for children aged 4-8, focusing on cognitive ease, joy, and exploration. The brand personality is that of an encouraging "adventure guide"—authoritative enough to teach, yet playful enough to feel like a game. 

The design style is **Premium Educational**, blending elements of **Minimalism** with **Tactile/Skeuomorphic** accents. We use heavy whitespace to reduce cognitive load while employing "squishy," chunky UI elements that invite physical interaction. High contrast and vibrant saturation ensure the interface remains legible and stimulating for young learners.

## Colors
The palette is rooted in a "Vibrant Primary" logic. 
- **Sky Blue (Primary):** Used for main actions, navigation, and key characters.
- **Cheerful Yellow (Secondary):** Used for highlighting progress and interactive "surprises."
- **Grass Green (Tertiary):** Used for "Correct" states and success feedback.
- **Friendly Red (Error):** A softened red for "Try Again" states, designed not to discourage.
- **Celebration Palette:** Gold and Star Yellow are reserved for achievements, badges, and high-score screens to provide a distinct emotional reward.

## Typography
We utilize **Quicksand** exclusively for its rounded terminals and open counters, which mirror the handwriting taught to early learners. 
- **Scale:** Type sizes are oversized to accommodate developing motor skills and visual tracking.
- **Weight:** Use Bold (700) for all instructional headers to ensure high hierarchy. Medium (500) is the standard for body text to maintain a friendly, soft appearance compared to standard Regular weights.
- **Bilingual Support:** Ensure line heights are generous (1.4x+) to accommodate various character heights in non-Latin scripts if necessary.

## Layout & Spacing
The layout follows a **Fluid Grid** model with high-safety margins.
- **Safe Zones:** A minimum 24px margin is maintained on all mobile screens to prevent accidental touches near the bezel.
- **Rhythm:** We use an 8px base unit. Component internal padding should default to 20px (card-padding) to feel spacious and approachable.
- **Touch Targets:** No interactive element should be smaller than 48x48px. For core learning interactions (like selecting a flag), targets should ideally exceed 80x80px.

## Elevation & Depth
Depth in this design system is used to signify "pressability." We move away from realistic shadows in favor of **Tonal Offsets**:
- **Tactile Shadows:** Buttons and cards feature a solid, darker-toned bottom border (offset 4px to 8px) rather than a soft blur. This creates a "3D Block" look that mimics physical toys.
- **Active States:** When pressed, the element translates down (Y-axis) and the bottom border disappears, providing immediate haptic-style visual feedback.
- **Layering:** Background elements use soft, low-contrast inner shadows to appear "recessed," while interactive cards use high-contrast drop shadows to appear "raised."

## Shapes
The shape language is strictly **Pill-shaped (Level 3)**. 
- **Corners:** Use 16px (rounded-lg) for standard cards and 32px (rounded-xl) for large buttons and containers.
- **Icons:** Icons should be enclosed in circular or soft-square "pods" to prevent sharp edges from breaking the friendly aesthetic.
- **Consistency:** Avoid sharp 90-degree angles entirely, even in progress bars or divider lines, which should have rounded caps.

## Components
- **Chunky Buttons:** 
    - `button-primary`: Sky Blue base with a 4px darker blue bottom shadow. White text.
    - `button-secondary`: White base with a 4px light grey bottom shadow. Sky Blue text.
- **Flag Cards:** Large white surfaces with a subtle 1px border. The flag image should be centered with a 12px corner radius.
- **Audio Icons:** Large, circular buttons in Cheerful Yellow featuring a white speaker glyph. These should "pulse" subtly when an audio cue is available.
- **Progress Bars:** Thick, rounded tracks (16px height) with a bright Grass Green fill.
- **Celebration Modals:** Full-screen overlays using Star Yellow backgrounds with white "rays" emanating from the center, highlighting a earned badge or star.
- **Input Fields:** Oversized, rounded text areas with thick 2px borders, turning Primary Blue when active.