# Design System Document: The High-Contrast Operational Standard

## 1. Overview & Creative North Star: "The Tactical Architect"
Retail environments are chaotic. Lighting is inconsistent, hands are often full, and speed is the primary metric of success. This design system rejects the "generic SaaS" look in favor of **The Tactical Architect**—a creative North Star that prioritizes brutal clarity, intentional asymmetry, and deep tonal layering.

We move beyond standard UI by treating the interface not as a flat screen, but as a physical dashboard of stacked materials. By eliminating traditional 1px borders and relying on surface shifts, we create an "Editorial Functionalism" that feels premium yet indestructible.

## 2. Colors & Surface Logic
The palette is rooted in a high-contrast neutral base to ensure legibility under harsh fluorescent lights or dim stockroom corners.

### The "No-Line" Rule
**Borders are prohibited for sectioning.** To define boundaries, use background color shifts. A `surface-container-low` section sitting on a `surface` background provides all the definition needed without the visual "noise" of a stroke.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the Material tiers to create nested depth:
* **Base Layer:** `surface` (#f8f9fc)
* **Structural Sections:** `surface-container-low` (#f2f4f6)
* **Interactive Cards:** `surface-container-lowest` (#ffffff)
* **Elevated Modals:** `surface-container-highest` (#e1e2e5)

### The "Glass & Gradient" Rule
To prevent a "flat" or "cheap" feel, use **Glassmorphism** for floating action bars or persistent navigation.
* **Formula:** `surface-container-low` at 80% opacity + 20px Backdrop Blur.
* **Signature Textures:** For high-priority actions, use a subtle linear gradient from `primary` (#00478d) to `primary_container` (#005eb8). This adds a "soul" to the button that flat color cannot replicate.

### Action Accents
* **Primary (System/Logic):** `primary` (#00478d)
* **Secondary (Entering/Success):** `secondary` (#006e2b)
* **Tertiary (Leaving/Critical/Alert):** `tertiary` (#940010)

## 3. Typography: Bold Editorial
We pair **Public Sans** (Display/Headlines) with **Inter** (Body/Labels). Public Sans provides a geometric, authoritative "Editorial" feel, while Inter ensures maximum readability at small scales.

* **Display-LG (3.5rem):** Use for "Big Numbers" (e.g., Inventory counts).
* **Headline-MD (1.75rem):** For screen titles. Always use `on_surface` (#191c1e) with a semi-bold weight.
* **Body-LG (1rem):** The workhorse for operational data.
* **Label-MD (0.75rem):** For metadata. Use `on_surface_variant` (#424752) to create a clear hierarchy.

**Constraint:** Never use a font weight lighter than 400. In retail operations, "thin" is a failure of accessibility.

## 4. Elevation & Depth
We convey hierarchy through **Tonal Layering**, not shadows.

* **The Layering Principle:** Place a `surface-container-lowest` card on top of a `surface-container` background. The subtle shift from #ffffff to #eceef0 creates a "soft lift."
* **Ambient Shadows:** If a floating element is required (e.g., a FAB), use a shadow with a 32px blur at 6% opacity. The shadow color should be tinted with `on_surface` (#191c1e) to feel like natural ambient occlusion.
* **The Ghost Border Fallback:** Only use a border if the background and foreground colors are identical. It must be `outline_variant` (#c2c6d4) at 20% opacity. **Never use 100% opaque borders.**

## 5. Components

### Buttons (The "Touch-First" Paradigm)
Buttons must be large and high-contrast.
* **Primary:** Background `primary`, Text `on_primary`. Minimum height: `12` (4rem) for mobile-first screens.
* **Secondary (Entering):** Background `secondary_fixed`, Text `on_secondary_fixed`. Use for "Clock In" or "Receive Shipment."
* **Tertiary (Leaving):** Background `tertiary_fixed`, Text `on_tertiary_fixed`. Use for "Clock Out" or "Mark Damaged."
* **Corner Radius:** Always `xl` (0.75rem) to provide a modern, friendly touch point.

### Cards & Lists (The "No-Divider" Rule)
* **Prohibition:** Dividers are forbidden.
* **Separation:** Use `spacing-4` (1.4rem) between list items. Separate logical groups by nesting them in a `surface-container-low` wrap.
* **Interaction:** On tap, the card background should shift to `surface-container-high` (#e7e8eb).

### Input Fields
* **Visual Style:** Use "Filled" style inputs. Background: `surface_variant` (#e1e2e5).
* **Active State:** A 2px bottom-bar of `primary` (#00478d). No full-box strokes.

### Operational Chips
* **Usage:** Status indicators (e.g., "In Stock," "Low Stock").
* **Style:** Use `secondary_container` for positive states and `tertiary_container` for warnings. Text must remain `on_container` for high contrast.

## 6. Do’s and Don’ts

### Do:
* **Do** use `spacing-6` or `spacing-8` for generous gutters. White space is a functional tool for reducing cognitive load.
* **Do** use `display-lg` for the single most important number on any screen.
* **Do** use `surface-bright` for the main content area to ensure it pops against the `surface-dim` sidebars.

### Don't:
* **Don't** use 1px lines to separate content. It creates "visual noise" that makes the app harder to read at a glance.
* **Don't** use shadows to indicate depth unless the element is physically "floating" over other content (like a drawer or modal).
* **Don't** use pure black (#000000) for text. Use `on_surface` (#191c1e) for a more sophisticated, premium feel that reduces eye strain.