# DirectDriveX Design System Implementation Rules

## Overview
This document defines strict implementation rules for migrating DirectDriveX from the legacy design system to the new unified design system. These rules ensure consistency, prevent technical debt, and maintain visual integrity throughout the transition.

## Core Principles

### 1. Dual System Coexistence
- **Legacy System**: Must remain completely untouched until explicit removal approval
- **New System**: Added alongside with clear separation and prefixing
- **No Mixing**: Never combine old and new system classes in the same component
- **Clean Boundaries**: Each component uses either 100% old or 100% new system

### 2. Zero Visual Regression
- Existing pages must look and function identically during migration
- No changes to user experience until explicit component migration
- All visual changes must be intentional and approved
- Responsive behavior must remain consistent

## Naming Conventions

### CSS Variables
```css
/* ✅ REQUIRED: New system variables */
--ds-primary: 214 96% 56%;
--ds-primary-foreground: 0 0% 98%;

/* ✅ REQUIRED: Legacy variables (preserve) */
--primary: 214 96% 56%;  /* Keep until removal */

/* ❌ FORBIDDEN: Unprefixed new variables */
--new-primary: 214 96% 56%;
```

### CSS Classes
```css
/* ✅ REQUIRED: New system classes */
.ds-btn-primary { }
.ds-card-base { }
.ds-input-field { }

/* ✅ REQUIRED: Legacy classes (preserve) */
.btn-primary { }     /* Keep until removal */

/* ❌ FORBIDDEN: Mixed or unclear naming */
.new-btn-primary { }
.button-v2 { }
```

### Component Files
```
✅ REQUIRED Structure:
/components/ui-new/button.tsx     (new system)
/components/ui/button.tsx         (legacy - preserve)

❌ FORBIDDEN Structure:
/components/ui/button-new.tsx
/components/ui/button-v2.tsx
/components/ui2/button.tsx
```

### TypeScript Files
```
✅ REQUIRED:
/lib/design-system-new.ts
/lib/theme-provider-new.tsx

✅ PRESERVE:
/lib/design-system.ts      (legacy)
/lib/theme-provider.tsx    (legacy)

❌ FORBIDDEN:
/lib/design-system-v2.ts
/lib/new-design-system.ts
```

## Implementation Phases

### Phase 1: Foundation Setup
**SCOPE**: Infrastructure only, zero visual changes

**Requirements**:
- Add new CSS variables with `ds-` prefix to globals.css
- Extend tailwind.config.js with new color system (commented sections)
- Create `/lib/design-system-new.ts` utilities
- Create `/components/ui-new/` directory structure
- Set up new TypeScript types and interfaces

**Forbidden Actions**:
- Modifying existing components
- Changing any visual elements
- Removing legacy code
- Mixing old and new systems

**Success Criteria**:
- All existing pages render identically
- New design system infrastructure available
- Zero compilation errors
- Clear separation between systems

### Phase 2: Component Migration (Per Section)
**SCOPE**: One application section at a time

**Migration Order**:
1. Homepage components
2. Dashboard components  
3. Admin panel components

**Per-Component Process**:
1. Create new component in `/components/ui-new/`
2. Implement using only `ds-` prefixed classes
3. Test component in isolation
4. Replace import in target pages
5. Verify visual and functional consistency
6. Document migration completion

### Phase 3: Legacy Removal (Admin Approval Only)
**SCOPE**: Remove old system after explicit approval

**Process**:
- Only after all components migrated
- Only with explicit "remove legacy system" instruction
- Remove old CSS variables and classes
- Remove legacy component files
- Update imports throughout codebase

## Strict Coding Standards

### Color Usage
```css
/* ✅ REQUIRED: Use design system variables only */
.new-component {
  background-color: hsl(var(--ds-primary));
  color: hsl(var(--ds-primary-foreground));
}

/* ❌ FORBIDDEN: Hardcoded colors */
.bad-component {
  background-color: #135ee3;
  color: white;
  background-color: rgb(19, 94, 227);
}

/* ❌ FORBIDDEN: Tailwind color classes */
.bad-component {
  @apply bg-blue-500 text-white;
}
```

### Typography
```css
/* ✅ REQUIRED: Design system typography */
.ds-heading-1 {
  @apply text-3xl font-bold;
}

/* ❌ FORBIDDEN: Custom typography */
.custom-heading {
  font-size: 32px;
  font-weight: 800;
  line-height: 1.1;
}
```

### Spacing
```css
/* ✅ REQUIRED: Design system spacing scale */
.ds-card {
  @apply p-6 gap-4;
}

/* ❌ FORBIDDEN: Custom spacing */
.custom-card {
  padding: 25px;
  gap: 18px;
}
```

### Responsive Design
```css
/* ✅ REQUIRED: Mobile-first responsive */
.ds-grid {
  @apply grid-cols-1 md:grid-cols-2 lg:grid-cols-3;
}

/* ❌ FORBIDDEN: Desktop-first or non-responsive */
.bad-grid {
  @apply grid-cols-3;
}
```

## Component Requirements

### Base Component Structure
```tsx
/* ✅ REQUIRED: New system component structure */
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'
  size?: 'sm' | 'default' | 'lg'
  disabled?: boolean
  children: React.ReactNode
  className?: string
}

const Button = ({ variant = 'primary', size = 'default', ...props }: ButtonProps) => {
  return (
    <button
      className={`ds-btn-base ds-btn-${variant} ds-btn-${size} ${props.className || ''}`}
      {...props}
    >
      {props.children}
    </button>
  )
}
```

### Required Props for All Components
- **variant**: Component style variant (required)
- **size**: Component size option (required)
- **disabled**: Disabled state support (required)
- **className**: Additional CSS classes (optional)
- **children**: Content (required for containers)

### Accessibility Requirements
```tsx
/* ✅ REQUIRED: Accessibility attributes */
<button
  className="ds-btn-primary"
  aria-label="Upload file"
  aria-describedby="upload-help"
  disabled={isUploading}
>
  {isUploading ? <Loader2 className="ds-icon-sm animate-spin" /> : <Upload className="ds-icon-sm" />}
  Upload
</button>

/* ❌ FORBIDDEN: Missing accessibility */
<button className="ds-btn-primary">
  Upload
</button>
```

### State Management
```tsx
/* ✅ REQUIRED: Complete state handling */
const FileList = ({ files, loading, error }) => {
  if (loading) {
    return <LoadingSkeleton className="ds-skeleton-file-list" />
  }
  
  if (error) {
    return (
      <ErrorState 
        title="Failed to load files"
        message={error.message}
        action={<Button variant="primary" onClick={retry}>Try Again</Button>}
      />
    )
  }
  
  if (files.length === 0) {
    return (
      <EmptyState
        icon={Upload}
        title="No files uploaded yet"
        description="Upload your first file to get started"
        action={<Button variant="primary">Upload Files</Button>}
      />
    )
  }
  
  return <FilesGrid files={files} />
}

/* ❌ FORBIDDEN: Incomplete state handling */
const BadFileList = ({ files }) => {
  return <div>{files.map(file => ...)}</div>
}
```

## File Organization Rules

### Directory Structure
```
src/
├── components/
│   ├── ui/              # Legacy components (preserve)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── index.ts
│   ├── ui-new/          # New design system components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── index.ts
│   ├── file-management/ # Feature components
│   ├── admin/           # Admin components
│   └── dashboard/       # Dashboard components
├── lib/
│   ├── design-system.ts     # Legacy utilities (preserve)
│   ├── design-system-new.ts # New system utilities
│   └── theme-provider-new.tsx
└── styles/
    ├── globals.css      # Both systems (clearly commented)
    └── components.css   # Component-specific styles
```

### Import Rules
```tsx
/* ✅ REQUIRED: Clear import distinction */
import { Button } from '@/components/ui-new/button'           // New system
import { OldButton } from '@/components/ui/button'           // Legacy system

/* ❌ FORBIDDEN: Ambiguous imports */
import { Button, NewButton } from '@/components/ui/button'
import { Button as ButtonV2 } from '@/components/ui/button-new'
```

### Component Export Rules
```tsx
/* ✅ REQUIRED: Clear exports */
// /components/ui-new/index.ts
export { Button } from './button'
export { Card } from './card'
export { Input } from './input'

// /components/ui/index.ts (legacy - preserve)
export { Button as LegacyButton } from './button'
export { Card as LegacyCard } from './card'
```

## Testing Requirements

### Visual Regression Testing
- **Before Migration**: Screenshot existing components
- **After Migration**: Compare new components pixel-perfect
- **Responsive Testing**: Test all breakpoints (sm, md, lg, xl, 2xl)
- **Browser Testing**: Chrome, Firefox, Safari, Edge

### Functional Testing
- **Keyboard Navigation**: Tab order and focus management
- **Screen Reader**: ARIA attributes and announcements
- **Interactive States**: Hover, focus, active, disabled
- **Error Handling**: Loading, error, and empty states

### Performance Testing
- **Bundle Size**: New system must not increase bundle significantly
- **Render Performance**: No regression in component render times
- **Animation Performance**: 60fps animations on target devices

## Code Review Checklist

### Before Submitting PR
- [ ] Component uses only `ds-` prefixed classes
- [ ] No hardcoded colors, spacing, or typography
- [ ] All required props implemented (variant, size, disabled)
- [ ] Accessibility attributes included
- [ ] Responsive behavior tested on all breakpoints
- [ ] Loading, error, and empty states handled
- [ ] TypeScript types properly defined
- [ ] No mixing of old and new system classes
- [ ] Component documented with usage examples

### Reviewer Requirements
- [ ] Visual comparison with existing component
- [ ] Code follows naming conventions
- [ ] No custom CSS beyond design system
- [ ] Accessibility standards met
- [ ] Responsive design implemented correctly
- [ ] State management complete
- [ ] Performance impact acceptable

## Forbidden Practices

### Never Do These
```tsx
/* ❌ FORBIDDEN: Mixing systems */
<div className="old-card ds-new-padding">

/* ❌ FORBIDDEN: Custom CSS overrides */
<div className="ds-card" style={{ padding: '25px' }}>

/* ❌ FORBIDDEN: Hardcoded values */
<div className="ds-card bg-[#135ee3]">

/* ❌ FORBIDDEN: Inline styles for design system properties */
<button style={{ backgroundColor: 'var(--ds-primary)' }}>

/* ❌ FORBIDDEN: Non-standard spacing */
<div className="ds-card px-[23px]">

/* ❌ FORBIDDEN: Incomplete accessibility */
<button className="ds-btn-primary" onClick={handleClick}>
  Click Me
</button>

/* ❌ FORBIDDEN: Missing responsive design */
<div className="ds-grid grid-cols-3">

/* ❌ FORBIDDEN: Custom animations outside design system */
<div className="animate-[wiggle_1s_ease-in-out_infinite]">
```

## Emergency Procedures

### If Visual Regression Occurs
1. **Immediate Action**: Revert the problematic component
2. **Investigation**: Compare old vs new implementation
3. **Fix**: Adjust new component to match legacy exactly
4. **Re-test**: Verify fix before re-deployment

### If Compilation Errors Occur
1. **Check Imports**: Verify correct component imports
2. **Check CSS Variables**: Ensure all `ds-` variables defined
3. **Check TypeScript**: Verify type definitions match implementation
4. **Rollback**: If unfixable, revert to last working state

### If Performance Degrades
1. **Profile**: Identify performance bottleneck
2. **Optimize**: Use design system patterns more efficiently
3. **Test**: Verify optimization doesn't break functionality
4. **Document**: Record solution for future reference

## Migration Tracking

### Required Documentation
- Component migration status spreadsheet
- Visual regression test results
- Performance impact measurements
- Accessibility audit results
- Code review completion status

### Migration Sign-off Requirements
Each component migration requires:
- [ ] Developer implementation complete
- [ ] Visual regression tests pass
- [ ] Accessibility audit complete
- [ ] Performance tests pass
- [ ] Code review approved
- [ ] Project manager sign-off

## Compliance Enforcement

### Automated Checks
- ESLint rules for design system class usage
- CSS linting for hardcoded values
- TypeScript strict mode enabled
- Pre-commit hooks for formatting

### Manual Reviews
- All design system PRs require senior developer review
- Visual changes require project manager approval
- Accessibility changes require accessibility audit
- Performance impacts require performance review

This rules file ensures consistent, high-quality implementation of the DirectDriveX design system while maintaining the existing application's stability and visual integrity.