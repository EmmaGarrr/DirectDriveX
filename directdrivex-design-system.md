# DirectDriveX Design System

## Overview
This design system ensures visual consistency across all pages of the DirectDriveX application. It defines standardized design tokens, component patterns, and implementation guidelines using Tailwind CSS exclusively.!!!!!
## Design Tokens

### Colors
All colors are defined using CSS custom properties with HSL values for optimal theme switching.

#### Primary Palette
```css
:root {
  --primary: 214 96% 56%;           /* #135EE3 - BOLT Blue */
  --primary-foreground: 0 0% 98%;   /* White text on primary */
  --secondary: 240 5% 96%;          /* Light gray backgrounds */
  --secondary-foreground: 240 6% 10%; /* Dark text on secondary */
  --foreground: 240 6% 10%;         /* Primary text color */
}

.dark {
  --primary: 214 96% 56%;           /* Same blue in dark mode */
  --primary-foreground: 0 0% 98%;   
  --secondary: 240 4% 16%;          /* Dark gray backgrounds */
  --secondary-foreground: 240 5% 90%; /* Light text on dark secondary */
  --foreground: 240 5% 90%;         /* Light text in dark mode */
}
```

#### Semantic Colors
```css
:root {
  --background: 0 0% 100%;          /* Page background */
  --card: 0 0% 100%;                /* Card backgrounds */
  --card-foreground: 0 0% 4%;       /* Card text */
  --border: 0 0% 90%;               /* Border color */
  --input: 0 0% 90%;                /* Input borders */
  --ring: 214 96% 56%;              /* Focus rings */
  --muted: 0 0% 96%;                /* Muted backgrounds */
  --muted-foreground: 0 0% 45%;     /* Muted text */
  --accent: 0 0% 96%;               /* Accent backgrounds */
  --accent-foreground: 0 0% 9%;     /* Accent text */
  --destructive: 0 84% 60%;         /* Error/danger color */
  --destructive-foreground: 0 0% 98%; /* Text on destructive */
  --success: 142 76% 36%;           /* Success/confirmation color */
  --success-foreground: 0 0% 98%;   /* Text on success */
  --warning: 38 92% 50%;            /* Warning/caution color */
  --warning-foreground: 0 0% 98%;   /* Text on warning */
  --info: 217 91% 60%;              /* Information color */
  --info-foreground: 0 0% 98%;      /* Text on info */
}

.dark {
  --background: 240 10% 3.9%;
  --card: 240 10% 3.9%;
  --card-foreground: 0 0% 98%;
  --border: 240 3.7% 15.9%;
  --input: 240 3.7% 15.9%;
  --ring: 214 96% 56%;
  --muted: 240 3.7% 15.9%;
  --muted-foreground: 240 5% 64.9%;
  --accent: 240 3.7% 15.9%;
  --accent-foreground: 0 0% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 98%;
  --success: 142 71% 45%;
  --success-foreground: 0 0% 98%;
  --warning: 38 92% 50%;
  --warning-foreground: 0 0% 98%;
  --info: 217 91% 60%;
  --info-foreground: 0 0% 98%;
}
```

#### Chart Colors
```css
:root {
  --chart-1: 12 76% 61%;            /* Orange for charts */
  --chart-2: 173 58% 39%;           /* Teal for charts */
  --chart-3: 197 37% 24%;           /* Dark blue for charts */
  --chart-4: 43 74% 66%;            /* Yellow for charts */
  --chart-5: 27 87% 67%;            /* Red-orange for charts */
}

.dark {
  --chart-1: 220 70% 50%;
  --chart-2: 160 60% 45%;
  --chart-3: 30 80% 55%;
  --chart-4: 280 65% 60%;
  --chart-5: 340 75% 55%;
}
```

#### Admin Sidebar Colors
```css
:root {
  --sidebar-background: 0 0% 98%;
  --sidebar-foreground: 240 5.3% 26.1%;
  --sidebar-primary: 240 5.9% 10%;
  --sidebar-primary-foreground: 0 0% 98%;
  --sidebar-accent: 240 4.8% 95.9%;
  --sidebar-accent-foreground: 240 5.9% 10%;
  --sidebar-border: 220 13% 91%;
  --sidebar-ring: 217.2 91.2% 59.8%;
}

.dark {
  --sidebar-background: 240 5.9% 10%;
  --sidebar-foreground: 240 4.8% 95.9%;
  --sidebar-primary: 0 0% 98%;
  --sidebar-primary-foreground: 240 5.9% 10%;
  --sidebar-accent: 240 3.7% 15.9%;
  --sidebar-accent-foreground: 240 4.8% 95.9%;
  --sidebar-border: 240 3.7% 15.9%;
  --sidebar-ring: 217.2 91.2% 59.8%;
}
```

### Typography Scale
Uses Inter font family with consistent sizing and spacing.

#### Font Family
```css
:root {
  --font-sans: 'Inter', system-ui, sans-serif;
}
```

#### Typography Classes
| Class | Font Size | Line Height | Usage |
|-------|-----------|-------------|--------|
| `text-xs` | 0.75rem (12px) | 1rem | Small captions, labels |
| `text-sm` | 0.875rem (14px) | 1.25rem | Body text, descriptions |
| `text-base` | 1rem (16px) | 1.5rem | Default body text |
| `text-lg` | 1.125rem (18px) | 1.75rem | Subheadings |
| `text-xl` | 1.25rem (20px) | 1.75rem | Section titles |
| `text-2xl` | 1.5rem (24px) | 2rem | Page headings |
| `text-3xl` | 1.875rem (30px) | 2.25rem | Main page titles |

#### Font Weights
| Class | Weight | Usage |
|-------|--------|--------|
| `font-normal` | 400 | Body text |
| `font-medium` | 500 | Labels, captions |
| `font-semibold` | 600 | Subheadings, important text |
| `font-bold` | 700 | Headings, emphasis |

#### Heading Hierarchy
| Level | Element | Classes | Usage |
|-------|---------|---------|--------|
| H1 | h1 | text-3xl font-bold | Page titles |
| H2 | h2 | text-2xl font-semibold | Section titles |
| H3 | h3 | text-xl font-semibold | Subsection titles |
| H4 | h4 | text-lg font-medium | Component titles |
| H5 | h5 | text-base font-medium | Small headings |
| H6 | h6 | text-sm font-medium | Captions |

#### Text Styles
| Style | Classes | Usage |
|-------|---------|--------|
| Body Large | text-lg | Important body text |
| Body | text-base | Standard body text |
| Body Small | text-sm | Secondary text |
| Caption | text-xs text-muted-foreground | Helper text |
| Label | text-sm font-medium | Form labels |
| Link | text-primary hover:underline | Text links |

#### Line Height System
| Text Size | Line Height | Ratio |
|-----------|-------------|-------|
| text-xs | leading-4 | 1.33 |
| text-sm | leading-5 | 1.43 |
| text-base | leading-6 | 1.5 |
| text-lg | leading-7 | 1.56 |
| text-xl | leading-7 | 1.4 |
| text-2xl | leading-8 | 1.33 |
| text-3xl | leading-9 | 1.2 |

### Spacing Scale
Consistent spacing using Tailwind's default 4px base unit.

#### Spacing Values
| Class | Value | Usage |
|-------|-------|--------|
| `p-1` | 0.25rem (4px) | Minimal padding |
| `p-2` | 0.5rem (8px) | Small padding |
| `p-3` | 0.75rem (12px) | Medium-small padding |
| `p-4` | 1rem (16px) | Standard padding |
| `p-6` | 1.5rem (24px) | Large padding |
| `p-8` | 2rem (32px) | Extra large padding |

#### Gap Values
| Class | Value | Usage |
|-------|-------|--------|
| `gap-1` | 0.25rem (4px) | Tight spacing |
| `gap-2` | 0.5rem (8px) | Standard spacing |
| `gap-3` | 0.75rem (12px) | Medium spacing |
| `gap-4` | 1rem (16px) | Comfortable spacing |
| `gap-6` | 1.5rem (24px) | Large spacing |
| `gap-8` | 2rem (32px) | Section spacing |

#### Layout Spacing
| Type | Classes | Usage |
|------|---------|--------|
| Page | py-12 md:py-16 lg:py-20 | Major page sections |
| Section | py-8 md:py-10 | Content blocks |
| Component | py-4 md:py-6 | Individual components |
| Element | py-2 md:py-3 | Small elements |

### Border Radius
Consistent rounded corners throughout the application.

```css
:root {
  --radius: 0.5rem; /* 8px - base radius */
}
```

#### Radius Scale
| Class | Value | Usage |
|-------|-------|--------|
| `rounded-sm` | calc(var(--radius) - 4px) | 4px - Small elements |
| `rounded` | calc(var(--radius) - 2px) | 6px - Buttons, inputs |
| `rounded-md` | var(--radius) | 8px - Cards, modals |
| `rounded-lg` | calc(var(--radius) + 2px) | 10px - Large cards |
| `rounded-xl` | calc(var(--radius) + 4px) | 12px - Containers |
| `rounded-2xl` | calc(var(--radius) + 8px) | 16px - Major sections |

### Shadows
Consistent elevation system for depth and hierarchy.

#### Shadow Scale
| Class | Value | Usage |
|-------|-------|--------|
| `shadow-sm` | 0 1px 2px 0 rgb(0 0 0 / 0.05) | Subtle depth |
| `shadow` | 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1) | Cards, buttons |
| `shadow-md` | 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) | Dropdowns |
| `shadow-lg` | 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1) | Modals |
| `shadow-xl` | 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1) | Overlays |

### Z-Index System
Consistent layering for overlapping elements.

| Layer | Z-Index | Classes | Usage |
|-------|---------|---------|--------|
| Base | z-0 | z-0 | Default layer |
| Dropdown | z-10 | z-10 | Dropdown menus |
| Sticky | z-20 | z-20 | Sticky headers |
| Fixed | z-30 | z-30 | Fixed positioning |
| Modal Backdrop | z-40 | z-40 | Modal overlays |
| Modal Content | z-50 | z-50 | Modal dialogs |
| Tooltip | z-60 | z-60 | Tooltip overlays |
| Toast | z-70 | z-70 | Toast notifications |

### Animations and Transitions

#### Timing System
```css
:root {
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --easing-ease-out: cubic-bezier(0, 0, 0.2, 1);
  --easing-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}
```

#### Animation Library
| Animation | Duration | Easing | Usage |
|-----------|----------|--------|--------|
| Fade In | 200ms | ease-out | Content appearance |
| Fade Out | 150ms | ease-out | Content disappearance |
| Slide Down | 300ms | ease-out | Dropdown menus |
| Slide Up | 300ms | ease-out | Modal entrance |
| Scale | 150ms | ease-out | Button interactions |
| Shimmer | 3s loop | ease-in-out | Loading states |
| Bounce | 500ms | bounce | Success feedback |
| Spin | 1s linear loop | linear | Loading spinners |

#### Standard Transitions
| Class | Duration | Easing | Usage |
|-------|----------|--------|--------|
| `transition-all` | 150ms | cubic-bezier(0.4, 0, 0.2, 1) | General transitions |
| `transition-colors` | 150ms | ease-in-out | Color changes |
| `transition-transform` | 150ms | ease-in-out | Hover effects |
| `transition-opacity` | 200ms | ease-in-out | Fade effects |

#### Hover Transforms
| Class | Transform | Usage |
|-------|-----------|--------|
| `hover:scale-105` | scale(1.05) | Button hover |
| `hover:-translate-y-1` | translateY(-0.25rem) | Card hover |
| `hover:shadow-lg` | Enhanced shadow | Interactive elements |

#### Interaction Animations
| Interaction | Animation | Duration | Easing |
|-------------|-----------|----------|--------|
| Button hover | Scale, shadow | 150ms | ease-out |
| Card hover | Lift, shadow | 200ms | ease-out |
| Modal enter | Fade + scale | 200ms | ease-out |
| Page transition | Slide, fade | 300ms | ease-in-out |
| Loading | Spin, pulse | ongoing | linear/ease-in-out |

#### State Transitions
| State Change | Animation | Implementation |
|--------------|-----------|----------------|
| Loading → Success | Fade out spinner, fade in checkmark | Sequence animations |
| Error → Normal | Color transition | transition-colors |
| Empty → Populated | Fade in content | animate-in fade-in |
| Collapsed → Expanded | Height animation | accordion animations |

## Component Standards

### Buttons
All buttons follow consistent sizing, spacing, and interaction patterns.

#### Button Base Classes
```
inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50
```

#### Button Variants
| Variant | Additional Classes | Usage |
|---------|-------------------|--------|
| Primary | bg-primary text-primary-foreground shadow hover:bg-primary/90 | Primary actions, main CTAs |
| Secondary | bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 | Secondary actions, cancel |
| Destructive | bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 | Delete, dangerous actions |
| Outline | border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground | Subtle actions, filters |
| Ghost | hover:bg-accent hover:text-accent-foreground | Minimal actions, navigation |
| Link | text-primary underline-offset-4 hover:underline | Text-only actions |

#### Button Sizes
| Size | Height | Padding | Text Size | Usage |
|------|--------|---------|-----------|--------|
| Small | 32px (h-8) | px-3 | text-xs | Compact UI |
| Default | 36px (h-9) | px-4 py-2 | text-sm | Standard actions |
| Large | 40px (h-10) | px-8 | text-sm | Primary CTAs |
| Icon | 36x36px (h-9 w-9) | - | - | Icon-only buttons |

#### Button States
| State | Visual | Classes | Behavior |
|-------|--------|---------|----------|
| Default | Standard appearance | base classes | Standard interaction |
| Hover | Darker background | hover:bg-primary/90 | Pointer cursor |
| Active | Pressed appearance | active:scale-95 | Brief scale effect |
| Focus | Ring outline | focus-visible:ring-2 focus-visible:ring-ring | Keyboard focus |
| Disabled | Reduced opacity | disabled:opacity-50 disabled:pointer-events-none | No interaction |
| Loading | Spinner + text | opacity-75 + spinner | Show loading spinner |

#### Button Loading Patterns
| Button Type | Loading State | Implementation |
|-------------|---------------|----------------|
| Primary | Spinner + reduced opacity | `<Loader2 class="h-4 w-4 animate-spin mr-2" /> Processing...` |
| Submit | Spinner + disabled | `disabled opacity-75` with spinner |
| Icon | Replace icon with spinner | `<Loader2 class="h-4 w-4 animate-spin" />` |

### Form Controls

#### Input Base Classes
```
flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50
```

#### Textarea Base Classes
```
flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y
```

#### Textarea Variants
| Variant | Additional Classes | Usage |
|---------|-------------------|--------|
| Small | min-h-[40px] | Short comments |
| Default | min-h-[60px] | Standard text input |
| Large | min-h-[120px] | Long descriptions |
| Auto-resize | resize-none | Dynamic height |

#### Input Validation States
| State | Border | Background | Text Color | Icon | Ring Color |
|-------|--------|------------|------------|------|------------|
| Default | border-input | bg-background | text-foreground | None | ring-ring |
| Valid | border-success | bg-success/5 | text-foreground | CheckCircle | ring-success |
| Invalid | border-destructive | bg-destructive/5 | text-foreground | XCircle | ring-destructive |
| Warning | border-warning | bg-warning/5 | text-foreground | AlertTriangle | ring-warning |

#### Input Sizes
| Size | Height | Padding | Text Size | Usage |
|------|--------|---------|-----------|--------|
| Small | h-8 | px-2 py-1 | text-xs | Compact forms |
| Default | h-9 | px-3 py-1 | text-sm | Standard forms |
| Large | h-10 | px-4 py-2 | text-base | Prominent fields |

#### Label Base Classes
```
text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70
```

#### Label Variants
| Variant | Additional Classes | Usage |
|---------|-------------------|--------|
| Default | - | Standard labels |
| Required | after:content-['*'] after:ml-0.5 after:text-destructive | Required fields |
| Optional | after:content-['(optional)'] after:ml-1 after:text-muted-foreground | Optional fields |

#### Checkbox Base Classes
```
peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground
```

### Cards
Consistent container component for content organization.

#### Card Base Classes
```
rounded-xl border bg-card text-card-foreground shadow
```

#### Card Structure Classes
| Element | Classes | Usage |
|---------|---------|--------|
| Card Header | flex flex-col space-y-1.5 p-6 | Title and description area |
| Card Title | font-semibold leading-none tracking-tight | Main card title |
| Card Description | text-sm text-muted-foreground | Card subtitle |
| Card Content | p-6 pt-0 | Main content area |
| Card Footer | flex items-center p-6 pt-0 | Action buttons area |

#### Card Variants
| Variant | Additional Classes | Usage |
|---------|-------------------|--------|
| Default | - | Standard content cards |
| Interactive | hover:shadow-md cursor-pointer transition-shadow | Clickable cards |
| Elevated | shadow-lg | Important content |
| Flat | shadow-none border-0 | Minimal styling |
| Success | border-success/20 bg-success/5 | Success states |
| Warning | border-warning/20 bg-warning/5 | Warning states |
| Error | border-destructive/20 bg-destructive/5 | Error states |

#### Card Sizes
| Size | Padding | Usage |
|------|---------|--------|
| Compact | p-4 | Small content |
| Default | p-6 | Standard cards |
| Large | p-8 | Feature cards |

### Tables
Standardized table design for data display.

#### Table Base Classes
| Element | Classes |
|---------|---------|
| Table Container | relative w-full overflow-auto |
| Table | w-full caption-bottom text-sm |
| Table Header | [&_tr]:border-b |
| Table Header Row | border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted |
| Table Header Cell | h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 |
| Table Body | [&_tr:last-child]:border-0 |
| Table Body Row | border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted |
| Table Body Cell | p-2 align-middle [&:has([role=checkbox])]:pr-0 |

#### Data Table Features
| Feature | Implementation | Classes | Usage |
|---------|----------------|---------|--------|
| Hover states | Row highlight | hover:bg-muted/50 | Row interactions |
| Selection | Row selection | data-[state=selected]:bg-muted | Selectable rows |
| Sorting | Sort indicators | Lucide icons in headers | Sortable columns |
| Pagination | Page controls | Separate pagination component | Large datasets |
| Loading | Skeleton rows | Skeleton component rows | Data loading |
| Empty | Empty state | Custom empty state component | No data |

#### Table Sizes
| Size | Row Height | Padding | Usage |
|------|------------|---------|--------|
| Compact | h-8 | px-2 py-1 | Dense data |
| Default | h-10 | px-2 py-2 | Standard tables |
| Large | h-12 | px-4 py-3 | Spacious layout |

### Navigation Components

#### Breadcrumb Base Classes
| Element | Classes |
|---------|---------|
| Nav Container | - |
| Breadcrumb List | flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5 |
| Breadcrumb Item | inline-flex items-center gap-1.5 |
| Breadcrumb Link | transition-colors hover:text-foreground |
| Breadcrumb Separator | [&>svg]:w-3.5 [&>svg]:h-3.5 |
| Breadcrumb Current | font-normal text-foreground |

#### Pagination Base Classes
| Element | Classes |
|---------|---------|
| Pagination Container | flex items-center justify-between |
| Pagination Controls | flex items-center space-x-2 |
| Pagination Button | btn-outline h-8 w-8 p-0 |
| Pagination Active | btn-outline h-8 w-8 p-0 bg-primary text-primary-foreground |
| Pagination Info | text-sm text-muted-foreground |

#### Tabs Base Classes
| Element | Classes |
|---------|---------|
| Tabs Container | inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground |
| Tab Trigger | inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow |

### Modals and Dialogs
Consistent modal design with proper accessibility.

#### Dialog Base Classes
| Element | Classes |
|---------|---------|
| Dialog Overlay | fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 |
| Dialog Content | fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg |
| Dialog Header | flex flex-col space-y-2 text-center sm:text-left |
| Dialog Title | text-lg font-semibold |
| Dialog Description | text-sm text-muted-foreground |
| Dialog Footer | flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 |

#### Modal Sizes
| Size | Max Width | Usage |
|------|-----------|--------|
| Small | max-w-sm (384px) | Confirmations |
| Default | max-w-lg (512px) | Standard modals |
| Large | max-w-2xl (672px) | Forms, content |
| Extra Large | max-w-4xl (896px) | Complex interfaces |
| Full | max-w-none | Full screen modals |

### Alerts and Notifications
Consistent alert system for notifications and status messages.

#### Alert Base Classes
```
relative w-full rounded-lg border px-4 py-3 text-sm
```

#### Alert Variants
| Variant | Additional Classes | Usage |
|---------|-------------------|--------|
| Success | border-success/20 bg-success/10 text-success-foreground [&>svg]:text-success | Success messages |
| Error | border-destructive/20 bg-destructive/10 text-destructive-foreground [&>svg]:text-destructive | Error messages |
| Warning | border-warning/20 bg-warning/10 text-warning-foreground [&>svg]:text-warning | Warning messages |
| Info | border-info/20 bg-info/10 text-info-foreground [&>svg]:text-info | Information messages |

#### Alert Elements
| Element | Classes |
|---------|---------|
| Alert Title | font-medium |
| Alert Description | text-[variant]/80 |

### Toast System
Toast notifications using Sonner integration.

#### Toast Positioning
- **Position:** Top-right corner
- **Z-Index:** z-70 (highest layer)
- **Gap:** 8px between toasts
- **Max Stack:** 5 toasts maximum

#### Toast Base Classes
```
group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full
```

#### Toast Variants
| Variant | Background | Text Color | Icon | Usage |
|---------|------------|------------|------|--------|
| Default | bg-background | text-foreground | None | General messages |
| Success | bg-success | text-success-foreground | CheckCircle | Success feedback |
| Error | bg-destructive | text-destructive-foreground | XCircle | Error messages |
| Warning | bg-warning | text-warning-foreground | AlertTriangle | Warning messages |
| Info | bg-info | text-info-foreground | Info | Information |
| Loading | bg-background | text-foreground | Loader2 | Loading states |

#### Toast Elements
| Element | Classes |
|---------|---------|
| Toast Icon Container | flex items-center gap-2 |
| Toast Title | font-semibold |
| Toast Description | text-sm opacity-90 |
| Toast Close Button | absolute right-1 top-1 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100 |

### Badges
Status indicators and tags.

#### Badge Base Classes
```
inline-flex items-center rounded-md border border-transparent px-2.5 py-0.5 text-xs font-semibold transition-colors shadow
```

#### Badge Variants
| Variant | Classes | Usage |
|---------|---------|--------|
| Default | bg-primary text-primary-foreground | Primary status |
| Secondary | bg-secondary text-secondary-foreground | Secondary status |
| Success | bg-success text-success-foreground | Success states |
| Warning | bg-warning text-warning-foreground | Warning states |
| Destructive | bg-destructive text-destructive-foreground | Error states |
| Outline | border text-foreground | Subtle indicators |

#### Badge Sizes
| Size | Padding | Text Size | Usage |
|------|---------|-----------|--------|
| Small | px-2 py-0.5 | text-xs | Compact indicators |
| Default | px-2.5 py-0.5 | text-xs | Standard badges |
| Large | px-3 py-1 | text-sm | Prominent badges |

### Progress Indicators
Loading and progress states.

#### Progress Bar Base Classes
```
relative w-full overflow-hidden rounded-full bg-secondary h-2
```

#### Progress Bar Fill Classes
```
h-full w-full flex-1 bg-primary transition-all duration-300 ease-out
```

#### Progress Variants
| Variant | Usage | Implementation |
|---------|-------|----------------|
| Determinate | Known progress | style="width: {progress}%" |
| Indeterminate | Unknown progress | animate-pulse bg-primary/30 |
| Striped | Visual interest | bg-gradient-to-r pattern |
| Success | Completed | bg-success |
| Error | Failed | bg-destructive |

#### Progress Sizes
| Size | Height | Usage |
|------|--------|--------|
| Small | h-1 | Subtle progress |
| Default | h-2 | Standard progress |
| Large | h-3 | Prominent progress |

#### Loading Spinner Base Classes
```
animate-spin rounded-full border-2 border-primary border-t-transparent
```

#### Spinner Sizes
| Size | Dimensions | Border Width | Usage |
|------|------------|--------------|--------|
| Small | h-3 w-3 | border | Inline loading |
| Default | h-4 w-4 | border-2 | Button loading |
| Large | h-6 w-6 | border-2 | Page loading |
| Extra Large | h-8 w-8 | border-2 | Full page loading |

#### Skeleton Loading Base Classes
```
animate-pulse rounded-md bg-muted
```

#### Skeleton Patterns
| Pattern | Structure | Usage |
|---------|-----------|--------|
| Text Lines | Multiple h-4 rectangles with varied widths | Text content loading |
| Card | Header + content + footer skeleton | Card loading |
| Table | Row skeletons with column structure | Table data loading |
| Avatar | Circular skeleton | Profile loading |

## File Management Components

### File Upload Zone States
| State | Visual | Classes | Behavior |
|-------|--------|---------|----------|
| Default | Dashed border | border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer group | Ready for files |
| Hover | Primary accent | border-primary/50 bg-primary/5 | Visual feedback |
| Drag Over | Highlighted | border-primary bg-primary/10 | Active drop zone |
| Uploading | Progress overlay | Overlay with progress bar | Show upload progress |
| Error | Error styling | border-destructive bg-destructive/5 | Error state |
| Success | Success styling | border-success bg-success/5 | Upload complete |

### File Preview Card Base Classes
```
flex items-center space-x-4 p-4 bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow
```

### File Card Elements
| Element | Classes | Usage |
|---------|---------|--------|
| File Icon Container | flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center | File type indicator |
| File Info Container | flex-1 min-w-0 | File details area |
| File Name | text-sm font-medium text-foreground truncate | Primary file identifier |
| File Meta | text-xs text-muted-foreground | Size, date, etc. |
| File Actions | flex items-center space-x-2 | Action buttons |
| Action Button | p-2 hover:bg-accent rounded-md transition-colors | Individual actions |

### File Type Icons
Consistent icons for different file types.

#### File Type System
| File Type | Background | Text Color | Icon | Extensions |
|-----------|------------|------------|------|------------|
| PDF | bg-red-100 | text-red-600 | FileText | .pdf |
| Document | bg-blue-100 | text-blue-600 | FileText | .doc, .docx, .txt |
| Spreadsheet | bg-green-100 | text-green-600 | Table | .xls, .xlsx, .csv |
| Image | bg-purple-100 | text-purple-600 | Image | .jpg, .png, .gif |
| Video | bg-orange-100 | text-orange-600 | Video | .mp4, .avi, .mov |
| Audio | bg-pink-100 | text-pink-600 | Music | .mp3, .wav, .ogg |
| Archive | bg-yellow-100 | text-yellow-600 | Archive | .zip, .rar, .7z |
| Code | bg-gray-100 | text-gray-600 | Code | .js, .py, .html |
| Default | bg-slate-100 | text-slate-600 | File | Other files |

### Upload Progress States
| State | Icon | Color | Description | Actions |
|-------|------|-------|-------------|---------|
| Queued | Clock | muted-foreground | Waiting in queue | Cancel |
| Uploading | Loader2 (spinning) | primary | Currently uploading | Pause, Cancel |
| Paused | Pause | warning | Upload paused | Resume, Cancel |
| Completed | CheckCircle | success | Upload successful | None |
| Failed | XCircle | destructive | Upload failed | Retry, Cancel |
| Cancelled | X | muted-foreground | User cancelled | Remove |

### Storage Quota Base Classes
| Element | Classes | Usage |
|---------|---------|--------|
| Storage Container | space-y-3 | Main storage display |
| Storage Header | flex items-center justify-between | Usage summary |
| Storage Label | text-sm font-medium | Usage label |
| Storage Values | text-sm text-muted-foreground | Current/total values |
| Storage Bar | w-full bg-secondary rounded-full h-2 | Progress container |
| Storage Fill | bg-warning h-2 rounded-full transition-all duration-300 | Usage indicator |
| Storage Warning | flex items-center space-x-2 p-3 bg-warning/10 border border-warning/20 rounded-lg | Alert styling |

## Permission and Access Management

### Guest Access Levels
| Level | Icon | Color | Permissions | Duration |
|-------|------|-------|-------------|----------|
| Guest | Eye | muted | View only | 24 hours |
| Viewer | Eye | info | View, Download | 7 days |
| Editor | Edit | primary | View, Download, Upload | 30 days |
| Admin | Shield | success | Full access | Permanent |

### Permission UI Base Classes
| Element | Classes | Usage |
|---------|---------|--------|
| Permission Card | flex items-center space-x-3 p-3 border rounded-lg | Permission option |
| Permission Icon | h-4 w-4 | Permission indicator |
| Permission Content | flex-1 | Text content area |
| Permission Title | font-medium | Main permission name |
| Permission Description | text-sm text-muted-foreground | Permission details |

## Admin Panel Components

### Statistics Cards Base Classes
| Element | Classes | Usage |
|---------|---------|--------|
| Stat Card | bg-card p-6 rounded-xl border shadow-sm | Main container |
| Stat Layout | flex items-center justify-between | Card layout |
| Stat Content | space-y-2 flex-1 | Text content area |
| Stat Label | text-sm font-medium text-muted-foreground | Metric label |
| Stat Value | text-2xl font-bold | Primary value |
| Stat Change | flex items-center space-x-2 text-sm | Change indicator |
| Stat Icon | h-12 w-12 rounded-lg flex items-center justify-center | Icon container |

#### Stat Card Variants
| Variant | Background | Icon Background | Usage |
|---------|------------|-----------------|--------|
| Default | bg-card | bg-primary/10 | Standard metrics |
| Success | bg-success/5 border-success/20 | bg-success/10 | Positive metrics |
| Warning | bg-warning/5 border-warning/20 | bg-warning/10 | Attention needed |
| Error | bg-destructive/5 border-destructive/20 | bg-destructive/10 | Problem metrics |

### Data Tables Base Classes
| Element | Classes |
|---------|---------|
| Table Container | bg-card rounded-xl border shadow-sm |
| Table Header | px-6 py-4 border-b |
| Table Title | text-lg font-semibold |
| Table Description | text-sm text-muted-foreground |
| Table Actions | flex items-center space-x-2 |
| Table Content | overflow-x-auto |
| Table Footer | px-6 py-4 border-t bg-muted/30 |

### Live Event Stream Base Classes
| Element | Classes |
|---------|---------|
| Event Container | bg-card rounded-xl border shadow-sm |
| Event Header | px-6 py-4 border-b |
| Event Status | h-2 w-2 bg-success rounded-full animate-pulse |
| Event List | max-h-96 overflow-y-auto space-y-1 |
| Event Item | px-6 py-3 hover:bg-muted/30 transition-colors |
| Event Icon | h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 |
| Event Content | flex-1 min-w-0 |

### Chart Components Base Classes
| Element | Classes |
|---------|---------|
| Chart Container | bg-card p-6 rounded-xl border shadow-sm |
| Chart Header | mb-6 |
| Chart Title | text-lg font-semibold mb-2 |
| Chart Description | text-sm text-muted-foreground |
| Chart Area | h-80 w-full |
| Chart Legend | flex items-center justify-center space-x-6 mt-4 pt-4 border-t |
| Legend Item | flex items-center space-x-2 |
| Legend Indicator | w-3 h-3 rounded-full |
| Legend Label | text-sm text-muted-foreground |

#### Chart Color System
Charts use design system colors for consistency:

```css
/* Chart color variables */
--chart-primary: hsl(var(--primary));
--chart-success: hsl(var(--success));
--chart-warning: hsl(var(--warning));
--chart-destructive: hsl(var(--destructive));
--chart-muted: hsl(var(--muted-foreground));
```

## Loading States

### Table Loading Base Classes
| Element | Classes |
|---------|---------|
| Table Skeleton | space-y-4 |
| Header Skeleton | flex items-center justify-between |
| Table Container | border rounded-lg overflow-hidden |
| Header Row | bg-muted/50 p-4 border-b |
| Data Rows | divide-y |
| Row Skeleton | p-4 |
| Cell Skeleton | h-4 bg-muted rounded animate-pulse |

### Card Loading Base Classes
| Element | Classes |
|---------|---------|
| Card Skeleton | bg-card p-6 rounded-xl border shadow-sm |
| Skeleton Animation | animate-pulse |
| Skeleton Elements | h-4 bg-muted rounded w-24 |

### Chart Loading Base Classes
| Element | Classes |
|---------|---------|
| Chart Skeleton | bg-card p-6 rounded-xl border shadow-sm |
| Chart Header Skeleton | mb-6 space-y-2 |
| Chart Area Skeleton | h-80 bg-muted rounded-lg |

## Content States

### Empty State Base Classes
| Element | Classes |
|---------|---------|
| Empty Container | flex flex-col items-center justify-center py-12 text-center |
| Empty Icon | mx-auto mb-4 h-12 w-12 text-muted-foreground |
| Empty Title | mb-2 text-lg font-semibold |
| Empty Description | mb-6 text-sm text-muted-foreground max-w-sm |
| Empty Action | btn-primary |

#### Empty State Patterns
| Context | Icon | Title | Description | Action |
|---------|------|-------|-------------|--------|
| No Files | Upload | No files uploaded yet | Upload your first file to get started | Upload Files |
| No Users | Users | No users found | No users match your current search | Clear Filters |
| No Data | BarChart | No data available | Data will appear here once available | Refresh |
| No Results | Search | No search results | Try adjusting your search criteria | Clear Search |
| No Activity | Activity | No recent activity | Activity will appear here when available | - |

### Error State Base Classes
| Element | Classes |
|---------|---------|
| Error Container | flex flex-col items-center justify-center py-12 text-center |
| Error Icon | mx-auto mb-4 h-12 w-12 text-destructive |
| Error Title | mb-2 text-lg font-semibold |
| Error Description | mb-6 text-sm text-muted-foreground max-w-sm |
| Error Actions | flex items-center space-x-3 |

### Success State Base Classes
| Element | Classes |
|---------|---------|
| Success Container | flex flex-col items-center justify-center py-12 text-center |
| Success Icon | mx-auto mb-4 h-12 w-12 text-success |
| Success Title | mb-2 text-lg font-semibold text-success |
| Success Description | mb-6 text-sm text-muted-foreground max-w-sm |
| Success Action | btn-primary |

#### Success State Patterns
| Context | Icon | Title | Description | Action |
|---------|------|-------|-------------|--------|
| Upload Complete | CheckCircle | Upload Successful | Your files have been uploaded successfully | View Files |
| User Created | UserCheck | User Added | New user account has been created | View User |
| Settings Saved | Save | Settings Updated | Your preferences have been saved | Continue |
| Task Complete | CheckCircle2 | Task Completed | The operation completed successfully | Done |

## Layout System

### Grid System
Consistent layout patterns using CSS Grid and Flexbox.

#### Main Layout Pattern
```
min-h-screen grid grid-rows-[auto_1fr_auto]
```

#### Content Grid Patterns
| Pattern | Classes | Usage |
|---------|---------|--------|
| 1 Column | grid-cols-1 | Mobile, simple layouts |
| 2 Column | grid-cols-1 md:grid-cols-2 | Split layouts |
| 3 Column | grid-cols-1 md:grid-cols-2 lg:grid-cols-3 | Card grids |
| 4 Column | grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 | Stats, features |
| 5 Column | grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 | Admin dashboard |
| Sidebar | grid-cols-1 lg:grid-cols-[250px_1fr] | Admin layouts |
| Content | grid-cols-1 lg:grid-cols-[1fr_300px] | Main + sidebar |

### Container System
| Container | Max Width | Usage |
|-----------|-----------|--------|
| container | responsive | Page content |
| max-w-sm | 384px | Small modals |
| max-w-md | 448px | Forms |
| max-w-lg | 512px | Content cards |
| max-w-xl | 576px | Articles |
| max-w-2xl | 672px | Wide content |
| max-w-4xl | 896px | Dashboards |
| max-w-6xl | 1152px | Full layouts |
| max-w-7xl | 1280px | Wide layouts |

### Responsive Breakpoints
| Breakpoint | Min Width | Usage |
|------------|-----------|--------|
| sm | 640px | Tablet portrait |
| md | 768px | Tablet landscape |
| lg | 1024px | Desktop |
| xl | 1280px | Large desktop |
| 2xl | 1536px | Extra large |

#### Responsive Component Behavior
| Component | Mobile (< 640px) | Tablet (640-1024px) | Desktop (> 1024px) |
|-----------|------------------|---------------------|-------------------|
| Navigation | Hamburger menu | Collapsed sidebar | Full sidebar |
| Data Tables | Horizontal scroll | Horizontal scroll | Full width |
| Modals | Full screen (sm only) | Centered | Centered |
| Cards | Single column | 2 columns | 3+ columns |
| Admin Sidebar | Hidden (overlay) | Collapsed | Full width |
| Upload Zone | Stacked layout | Side by side | Side by side |

## Dark Mode Implementation

### Dark Mode Scope
- **Admin Panel**: Full dark mode support with theme toggle
- **Homepage & Dashboard**: Light mode only (no dark mode toggle)
- **Theme Toggle Location**: Admin header only

### Theme-Safe Color Usage
| Element | Light Mode | Dark Mode | Class |
|---------|------------|-----------|-------|
| Page background | White | Dark gray | bg-background |
| Text | Dark gray | Light gray | text-foreground |
| Cards | White | Dark gray | bg-card text-card-foreground |
| Borders | Light gray | Dark gray | border-border |
| Muted text | Gray | Light gray | text-muted-foreground |
| Input backgrounds | Light gray | Dark gray | bg-input |
| Hover states | Light accent | Dark accent | hover:bg-accent |

### Dark Mode Restrictions
- Theme toggle only appears in admin panel header
- Homepage and dashboard remain light mode only
- Theme preference stored in localStorage with admin prefix
- Non-admin routes force light mode regardless of stored preference

## Icon System

### Icon Library
**Primary Library:** Lucide React
**Installation:** Already included in project

### Icon Sizes
| Size | Class | Pixels | Usage |
|------|-------|--------|--------|
| XS | w-3 h-3 | 12px | Inline icons |
| SM | w-4 h-4 | 16px | Button icons, form icons |
| MD | w-5 h-5 | 20px | Navigation icons |
| LG | w-6 h-6 | 24px | Feature icons |
| XL | w-8 h-8 | 32px | Hero icons |

### Icon Usage Patterns
| Context | Size | Color | Example |
|---------|------|-------|---------|
| Buttons | w-4 h-4 | text-current | `<Upload className="w-4 h-4" />` |
| Navigation | w-5 h-5 | text-muted-foreground | Menu icons |
| Status | w-4 h-4 | text-success/warning/destructive | Alert icons |
| Features | w-6 h-6 | text-primary | Hero section icons |

### Common Icons
| Icon | Component | Usage |
|------|-----------|--------|
| Upload | `<Upload />` | File upload |
| Download | `<Download />` | File download |
| User | `<User />` | User profile |
| Settings | `<Settings />` | Configuration |
| Search | `<Search />` | Search functionality |
| Check | `<Check />` | Success states |
| X | `<X />` | Close, cancel |
| ChevronDown | `<ChevronDown />` | Dropdowns |
| Loading | `<Loader2 />` | Loading states |

## Third-Party Library Integration

### Recharts Integration
Chart theming and color coordination.

#### Chart Theme Configuration
```typescript
const chartTheme = {
  primary: 'hsl(var(--primary))',
  success: 'hsl(var(--success))',
  warning: 'hsl(var(--warning))',
  destructive: 'hsl(var(--destructive))',
  muted: 'hsl(var(--muted-foreground))',
}
```

### React Hook Form Integration
Error state styling integration.

#### Form Error Classes
| Element | Classes |
|---------|---------|
| Error Input | input-base border-destructive focus-visible:ring-destructive |
| Error Message | text-sm text-destructive |
| Error State | aria-invalid="true" |

### Sonner Toast Integration
Toast notification styling.

#### Toast Customization
```typescript
const toastStyles = {
  success: 'bg-success text-success-foreground border-success/20',
  error: 'bg-destructive text-destructive-foreground border-destructive/20',
  warning: 'bg-warning text-warning-foreground border-warning/20',
  info: 'bg-info text-info-foreground border-info/20',
}
```

### Next Themes Integration
Theme switching behavior.

#### Theme Provider Configuration
```typescript
<ThemeProvider 
  attribute="class" 
  defaultTheme="light" 
  enableSystem={false}
  disableTransitionOnChange={false}
>
  {children}
</ThemeProvider>
```

## Technical Specifications

### CSS Custom Properties
Complete CSS variable system.

#### Additional Variables
```css
:root {
  /* Timing */
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  
  /* Easing */
  --easing-ease-out: cubic-bezier(0, 0, 0.2, 1);
  --easing-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Breakpoints (for JS usage) */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}
```

### Tailwind Plugin Requirements
Required Tailwind plugins for full functionality.

#### Required Plugins
| Plugin | Purpose | Installation |
|--------|---------|--------------|
| @tailwindcss/forms | Form styling reset | `npm install @tailwindcss/forms` |
| @tailwindcss/typography | Rich text styling | `npm install @tailwindcss/typography` |
| tailwindcss-animate | Animation utilities | Already installed |

### Browser Support
Supported browsers and fallbacks.

#### Browser Compatibility
| Browser | Version | Support Level |
|---------|---------|---------------|
| Chrome | 90+ | Full support |
| Firefox | 88+ | Full support |
| Safari | 14+ | Full support |
| Edge | 90+ | Full support |
| Mobile Safari | 14+ | Full support |
| Chrome Mobile | 90+ | Full support |

#### CSS Fallbacks
```css
/* CSS Variable fallbacks */
.fallback-button {
  background-color: #135ee3; /* fallback */
  background-color: hsl(var(--primary)); /* modern */
}
```

## Accessibility Standards

### Color Contrast
- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text** (18px+): Minimum 3:1 contrast ratio
- **Interactive elements**: Meet focus indicator requirements

### Keyboard Navigation
- All interactive elements accessible via Tab
- Logical tab order maintained
- Skip links for main content areas
- Escape key closes modals and menus

### Screen Reader Support
- Semantic HTML structure with proper headings
- Alt text for images and icons
- ARIA labels for complex interactions
- Status announcements for dynamic content

### Focus Management
- Visible focus indicators on all interactive elements
- Focus trapping in modals
- Focus restoration after modal close
- Logical focus flow in forms

## Performance Guidelines

### CSS Optimization
1. Use Tailwind's purge feature to remove unused styles
2. Minimize custom CSS in favor of utility classes  
3. Leverage CSS variables for dynamic theming
4. Avoid !important declarations

### Component Optimization
1. Use proper semantic HTML for better performance
2. Implement proper focus management for modals
3. Use appropriate ARIA attributes for screen readers
4. Lazy load heavy components when possible

### Image Optimization
1. Use next/image for automatic optimization
2. Implement proper alt text for accessibility
3. Use WebP format when supported
4. Implement lazy loading for non-critical images

## Implementation Guidelines

### CSS Custom Properties Usage
Always use CSS variables for colors to ensure theme compatibility:

```css
/* ✅ Correct */
.bg-primary { background-color: hsl(var(--primary)); }

/* ❌ Incorrect */
.bg-blue-500 { background-color: #3b82f6; }
```

### Component Composition Rules
1. Build complex components by composing simpler ones
2. Use consistent spacing patterns (gap-2, gap-4, gap-6)
3. Follow responsive design patterns (mobile-first)
4. Implement proper state handling (loading, error, empty)

### Responsive Design Principles
Always use mobile-first responsive design:
- Start with mobile layout
- Add breakpoints for larger screens
- Use logical breakpoint progression
- Test on actual devices

### State Management Consistency
Handle loading, error, and empty states consistently across all components:
- Loading: Show spinners with appropriate messaging
- Error: Display clear error messages with recovery options
- Empty: Provide helpful guidance and primary actions
- Success: Confirm completion with next steps

## Migration Guide

### Class Replacement Map
Complete migration from current inconsistent classes:

#### Color Migrations
| Old Class | New Class | Context |
|-----------|-----------|---------|
| `bg-bolt-blue` | `bg-primary` | All buttons, accents |
| `text-bolt-blue` | `text-primary` | Links, accents |
| `border-bolt-blue` | `border-primary` | Focus states |
| `bg-white` | `bg-background` | Page backgrounds |
| `bg-gray-50` | `bg-secondary` | Card backgrounds |
| `text-gray-900` | `text-foreground` | Primary text |
| `text-gray-500` | `text-muted-foreground` | Secondary text |

#### Button Migrations
| Old Pattern | New Pattern | Context |
|-------------|-------------|---------|
| `bg-gradient-to-r from-bolt-blue to-bolt-mid-blue` | `bg-primary hover:bg-primary/90` | Gradient buttons |
| `hover:shadow-xl hover:-translate-y-0.5` | `hover:shadow-md hover:-translate-y-1` | Card hover effects |

#### Form Migrations
| Old Pattern | New Pattern | Context |
|-------------|-------------|---------|
| `border-gray-300` | `border-input` | Input borders |
| `focus:ring-bolt-blue` | `focus-visible:ring-ring` | Focus states |

## Development Checklist

### Before Creating New Components:
- [ ] Check if existing component can be used or extended
- [ ] Use design system colors (primary, secondary, foreground)  
- [ ] Follow consistent spacing patterns
- [ ] Include dark mode support (admin panel only)
- [ ] Test keyboard navigation and screen reader compatibility
- [ ] Validate responsive behavior on all breakpoints

### Component Requirements:
- [ ] Uses CSS variables for colors
- [ ] Follows Tailwind utility class patterns
- [ ] Includes focus states and hover effects
- [ ] Has consistent typography scaling
- [ ] Supports disabled states where applicable
- [ ] Uses semantic HTML elements

### Quality Assurance:
- [ ] Visual consistency across all pages
- [ ] Proper color contrast ratios (4.5:1 minimum)
- [ ] Smooth animations and transitions
- [ ] Loading states for async operations
- [ ] Error states for failed operations
- [ ] Empty states for no-data scenarios

This design system ensures consistent visual design, optimal user experience, and maintainable code across the entire DirectDriveX application.