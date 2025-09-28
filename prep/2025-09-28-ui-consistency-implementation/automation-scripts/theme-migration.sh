#!/bin/bash

# Theme Migration Script
# Converts ProfessionalTheme usage to useTheme hook pattern
# Usage: ./theme-migration.sh <file_path> [--dry-run]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if file path is provided
if [ $# -eq 0 ]; then
    echo -e "${RED}Error: Please provide a file path${NC}"
    echo "Usage: $0 <file_path> [--dry-run]"
    exit 1
fi

FILE_PATH="$1"
DRY_RUN=false

# Check for dry-run flag
if [ "$2" = "--dry-run" ]; then
    DRY_RUN=true
    echo -e "${YELLOW}Running in DRY-RUN mode - no changes will be made${NC}"
fi

# Check if file exists
if [ ! -f "$FILE_PATH" ]; then
    echo -e "${RED}Error: File '$FILE_PATH' does not exist${NC}"
    exit 1
fi

# Check if file uses ProfessionalTheme
if ! grep -q "ProfessionalTheme" "$FILE_PATH"; then
    echo -e "${YELLOW}File '$FILE_PATH' does not use ProfessionalTheme - skipping${NC}"
    exit 0
fi

echo -e "${BLUE}🔄 Migrating theme usage in: $FILE_PATH${NC}"

# Count current ProfessionalTheme usages
USAGE_COUNT=$(grep -c "ProfessionalTheme" "$FILE_PATH")
echo -e "${YELLOW}Found $USAGE_COUNT ProfessionalTheme usages${NC}"

# Create backup
if [ "$DRY_RUN" = false ]; then
    cp "$FILE_PATH" "$FILE_PATH.backup"
    echo -e "${GREEN}✅ Backup created: $FILE_PATH.backup${NC}"
fi

# Function to perform replacements
perform_replacements() {
    local file="$1"
    local temp_file=$(mktemp)

    # Copy original to temp file
    cp "$file" "$temp_file"

    # 1. Add useTheme import if not present and ProfessionalTheme import exists
    if grep -q "import.*ProfessionalTheme" "$temp_file" && ! grep -q "import.*useTheme" "$temp_file"; then
        echo -e "${BLUE}  📦 Adding useTheme import${NC}"
        # Add useTheme import after React import
        sed -i '/import.*React/a import { useTheme } from '\''@/hooks/useTheme'\'';' "$temp_file"
    fi

    # 2. Add const { theme } = useTheme(); at the beginning of component function
    if grep -q "const.*=.*() => {" "$temp_file" && ! grep -q "const { theme } = useTheme();" "$temp_file"; then
        echo -e "${BLUE}  🎨 Adding useTheme hook usage${NC}"
        # Add theme destructuring after function declaration
        sed -i '/const.*=.*() => {/a \  const { theme } = useTheme();' "$temp_file"
    fi

    # 3. Replace ProfessionalTheme color references
    echo -e "${BLUE}  🎨 Replacing color references${NC}"
    sed -i 's/ProfessionalTheme\.colors\.surface/theme.colors.surface/g' "$temp_file"
    sed -i 's/ProfessionalTheme\.colors\.text/theme.colors.onSurface/g' "$temp_file"
    sed -i 's/ProfessionalTheme\.colors\.textSecondary/theme.colors.onSurfaceVariant/g' "$temp_file"
    sed -i 's/ProfessionalTheme\.colors\.primary/theme.colors.primary/g' "$temp_file"
    sed -i 's/ProfessionalTheme\.colors\.secondary/theme.colors.secondary/g' "$temp_file"
    sed -i 's/ProfessionalTheme\.colors\.error/theme.colors.error/g' "$temp_file"
    sed -i 's/ProfessionalTheme\.colors\.success/theme.colors.success/g' "$temp_file"
    sed -i 's/ProfessionalTheme\.colors\.warning/theme.colors.warning/g' "$temp_file"
    sed -i 's/ProfessionalTheme\.colors\.info/theme.colors.info/g' "$temp_file"
    sed -i 's/ProfessionalTheme\.colors\.background/theme.colors.background/g' "$temp_file"
    sed -i 's/ProfessionalTheme\.colors\.card/theme.colors.surface/g' "$temp_file"
    sed -i 's/ProfessionalTheme\.colors\.border/theme.colors.outline/g' "$temp_file"

    # 4. Replace ProfessionalTheme spacing references
    echo -e "${BLUE}  📏 Replacing spacing references${NC}"
    sed -i 's/ProfessionalTheme\.spacing\.xs/theme.spacing.xs/g' "$temp_file"
    sed -i 's/ProfessionalTheme\.spacing\.sm/theme.spacing.sm/g' "$temp_file"
    sed -i 's/ProfessionalTheme\.spacing\.md/theme.spacing.md/g' "$temp_file"
    sed -i 's/ProfessionalTheme\.spacing\.lg/theme.spacing.lg/g' "$temp_file"
    sed -i 's/ProfessionalTheme\.spacing\.xl/theme.spacing.xl/g' "$temp_file"

    # 5. Replace ProfessionalTheme border radius references
    echo -e "${BLUE}  🔄 Replacing border radius references${NC}"
    sed -i 's/ProfessionalTheme\.borderRadius\.xs/theme.borderRadius.xs/g' "$temp_file"
    sed -i 's/ProfessionalTheme\.borderRadius\.sm/theme.borderRadius.sm/g' "$temp_file"
    sed -i 's/ProfessionalTheme\.borderRadius\.md/theme.borderRadius.md/g' "$temp_file"
    sed -i 's/ProfessionalTheme\.borderRadius\.lg/theme.borderRadius.lg/g' "$temp_file"
    sed -i 's/ProfessionalTheme\.borderRadius\.xl/theme.borderRadius.xl/g' "$temp_file"

    # 6. Replace ProfessionalTheme typography references
    echo -e "${BLUE}  📝 Replacing typography references${NC}"
    sed -i 's/ProfessionalTheme\.typography\./theme.typography./g' "$temp_file"

    # 7. Replace ProfessionalTheme shadow references
    echo -e "${BLUE}  🌙 Replacing shadow references${NC}"
    sed -i 's/ProfessionalTheme\.shadows\./theme.shadows./g' "$temp_file"

    # 8. Remove ProfessionalTheme import
    echo -e "${BLUE}  🗑️  Removing ProfessionalTheme import${NC}"
    sed -i '/import.*ProfessionalTheme/d' "$temp_file"

    # 9. Clean up any remaining ProfessionalTheme references
    sed -i 's/ProfessionalTheme\./theme./g' "$temp_file"

    if [ "$DRY_RUN" = false ]; then
        mv "$temp_file" "$file"
    else
        echo -e "${YELLOW}DRY-RUN: Changes would be applied to $file${NC}"
        rm "$temp_file"
    fi
}

# Perform the replacements
perform_replacements "$FILE_PATH"

# Count remaining ProfessionalTheme usages
if [ "$DRY_RUN" = false ]; then
    REMAINING_COUNT=$(grep -c "ProfessionalTheme" "$FILE_PATH" 2>/dev/null || echo "0")
    echo -e "${GREEN}✅ Migration complete!${NC}"
    echo -e "${GREEN}   Original usages: $USAGE_COUNT${NC}"
    echo -e "${GREEN}   Remaining usages: $REMAINING_COUNT${NC}"

    if [ "$REMAINING_COUNT" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Warning: Some ProfessionalTheme references may need manual review${NC}"
        echo -e "${YELLOW}   Check for complex usage patterns that require manual migration${NC}"
    fi
else
    echo -e "${YELLOW}DRY-RUN complete - no actual changes made${NC}"
fi

# Show diff if in dry-run mode
if [ "$DRY_RUN" = true ]; then
    echo -e "${BLUE}📊 Preview of changes that would be made:${NC}"
    # Create a temporary file with changes to show diff
    temp_preview=$(mktemp)
    cp "$FILE_PATH" "$temp_preview"
    perform_replacements "$temp_preview" > /dev/null 2>&1

    echo -e "${YELLOW}--- Original${NC}"
    echo -e "${GREEN}+++ After Migration${NC}"
    diff -u "$FILE_PATH" "$temp_preview" | head -20 || true

    rm "$temp_preview"
fi

echo -e "${GREEN}🎉 Theme migration script completed!${NC}"