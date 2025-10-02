# Settings Components Standardization Map

## Applied Theme Values

### Typography Standardization
```typescript
// Page Titles (20px)
fontSize: 20 → theme.typography.title3.fontSize (22) or keep 20 for consistency

// Section Titles (16-18px)
fontSize: 16-18 → theme.typography.body.fontSize (16) or headline (18)

// Labels & Headings (14px)
fontSize: 14 → theme.typography.subhead.fontSize (14)

// Body Text (12px)
fontSize: 12 → theme.typography.footnote.fontSize (12)

// Small Text (11px)
fontSize: 11 → theme.typography.caption1.fontSize (11)

// Tiny Text (10px)
fontSize: 10 → theme.typography.caption2.fontSize (10)
```

### Border Radius Standardization
```typescript
// Section Cards
borderRadius: 8 → theme.borderRadius.md (10) or keep 8

// Item Cards/Rows
borderRadius: 8 → theme.borderRadius.md (10) or keep 8

// Avatar/Icon Circles (40x40)
borderRadius: 20 → theme.borderRadius.round (50) or keep 20 (50% of size)

// Small Buttons
borderRadius: 6-8 → theme.borderRadius.sm (6) or md (10)

// Pills/Tags
borderRadius: 10-12 → theme.borderRadius.md (10) or lg (14)
```

### Spacing Standardization
```typescript
// Section Margins
marginBottom: 20 → theme.spacing.lg (24) or keep 20

// Card Padding
padding: 20 → theme.spacing.lg (24) or keep 20

// Element Gaps
gap: 15 → theme.spacing.md (16)
gap: 10 → theme.spacing.sm (8) or theme.spacing.md (16)
```

## Files Completed
- [x] Phase 1: Icon replacements and CLAUDE.md fixes
- [ ] Phase 2: Typography standardization
- [ ] Phase 2: BorderRadius standardization
- [ ] Phase 2: Spacing standardization

## Notes
- Some custom values retained for specific UI requirements
- Balance between standardization and visual design
- All changes maintain backward compatibility with existing theme system
