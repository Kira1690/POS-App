#!/bin/bash

# Batch Theme Migration Script
# Migrates all ProfessionalTheme files in priority order
# Usage: ./batch-theme-migration.sh [--dry-run] [--phase=1|2|3|4|all]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Default values
DRY_RUN=false
PHASE="1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
THEME_MIGRATION_SCRIPT="$SCRIPT_DIR/theme-migration.sh"

# Parse command line arguments
for arg in "$@"; do
    case $arg in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --phase=*)
            PHASE="${arg#*=}"
            shift
            ;;
        *)
            # Unknown option
            ;;
    esac
done

# Validate phase
if [[ ! "$PHASE" =~ ^(1|2|3|4|all)$ ]]; then
    echo -e "${RED}Error: Phase must be 1, 2, 3, 4, or all${NC}"
    exit 1
fi

echo -e "${PURPLE}🚀 Starting Batch Theme Migration${NC}"
echo -e "${BLUE}Phase: $PHASE${NC}"
echo -e "${BLUE}Dry Run: $DRY_RUN${NC}"
echo "=================================================="

# Define file groups by priority (based on audit results)
declare -A PHASE_1_FILES=(
    ["src/screens/menu-management/components/MenuItemCard.tsx"]="96"
    ["src/screens/menu-management/components/MenuItemFiltersBar.tsx"]="89"
    ["src/screens/menu-management/components/AddMenuItemModal.tsx"]="75"
)

declare -A PHASE_2_FILES=(
    ["src/screens/menu-management/components/MenuStatsPanel.tsx"]="71"
    ["src/screens/menu-management/components/SearchFilterBar.tsx"]="61"
    ["src/screens/menu-management/components/CategoryCard.tsx"]="49"
    ["src/screens/menu-management/MenuItemsScreen.tsx"]="45"
)

declare -A PHASE_3_FILES=(
    ["src/screens/dashboard/components/ChartsSection.tsx"]="34"
    ["src/screens/dashboard/components/QuickActionsSection.tsx"]="26"
    ["src/screens/dashboard/components/SimpleChart.tsx"]="19"
    ["src/screens/dashboard/components/KPICard.tsx"]="17"
    ["src/screens/dashboard/components/KPISection.tsx"]="13"
)

declare -A PHASE_4_FILES=(
    ["src/constants/theme.ts"]="37"
)

# Function to migrate files in a phase
migrate_phase() {
    local phase_name="$1"
    local -n files_ref=$2
    local total_files=${#files_ref[@]}
    local current_file=0
    local total_usages=0
    local migrated_usages=0

    echo -e "${YELLOW}📋 $phase_name Migration${NC}"
    echo -e "${BLUE}Files to migrate: $total_files${NC}"

    # Calculate total usages
    for file in "${!files_ref[@]}"; do
        total_usages=$((total_usages + ${files_ref[$file]}))
    done

    echo -e "${BLUE}Total usages to migrate: $total_usages${NC}"
    echo ""

    # Migrate each file
    for file in "${!files_ref[@]}"; do
        current_file=$((current_file + 1))
        usage_count=${files_ref[$file]}

        echo -e "${GREEN}[$current_file/$total_files] Migrating: $file${NC}"
        echo -e "${YELLOW}  Expected usages: $usage_count${NC}"

        # Check if file exists
        if [ ! -f "$file" ]; then
            echo -e "${RED}  ❌ File not found: $file${NC}"
            continue
        fi

        # Check if file actually uses ProfessionalTheme
        if ! grep -q "ProfessionalTheme" "$file"; then
            echo -e "${YELLOW}  ⚠️  No ProfessionalTheme usage found - skipping${NC}"
            continue
        fi

        # Run migration script
        if [ "$DRY_RUN" = true ]; then
            "$THEME_MIGRATION_SCRIPT" "$file" --dry-run
        else
            "$THEME_MIGRATION_SCRIPT" "$file"
        fi

        # Count migrated usages (if not dry run)
        if [ "$DRY_RUN" = false ]; then
            remaining_count=$(grep -c "ProfessionalTheme" "$file" 2>/dev/null || echo "0")
            file_migrated=$((usage_count - remaining_count))
            migrated_usages=$((migrated_usages + file_migrated))

            if [ "$remaining_count" -gt 0 ]; then
                echo -e "${YELLOW}  ⚠️  $remaining_count usages remain - may need manual review${NC}"
            else
                echo -e "${GREEN}  ✅ Fully migrated${NC}"
            fi
        fi

        echo ""
    done

    # Phase summary
    echo -e "${GREEN}📊 $phase_name Summary:${NC}"
    echo -e "${GREEN}  Files processed: $total_files${NC}"
    if [ "$DRY_RUN" = false ]; then
        echo -e "${GREEN}  Usages migrated: $migrated_usages / $total_usages${NC}"
        local percentage=$((migrated_usages * 100 / total_usages))
        echo -e "${GREEN}  Migration rate: $percentage%${NC}"
    else
        echo -e "${YELLOW}  DRY-RUN: No actual changes made${NC}"
    fi
    echo ""
}

# Function to run pre-migration checks
pre_migration_checks() {
    echo -e "${BLUE}🔍 Pre-migration checks${NC}"

    # Check if theme migration script exists and is executable
    if [ ! -x "$THEME_MIGRATION_SCRIPT" ]; then
        echo -e "${RED}❌ Theme migration script not found or not executable: $THEME_MIGRATION_SCRIPT${NC}"
        exit 1
    fi

    # Check if we're in the right directory (should have src/ folder)
    if [ ! -d "src" ]; then
        echo -e "${RED}❌ Must be run from project root (src/ directory not found)${NC}"
        exit 1
    fi

    # Check if useTheme hook exists
    if [ ! -f "src/hooks/useTheme.ts" ] && [ ! -f "src/hooks/useTheme.tsx" ]; then
        echo -e "${YELLOW}⚠️  useTheme hook not found - make sure it exists${NC}"
    fi

    echo -e "${GREEN}✅ Pre-migration checks passed${NC}"
    echo ""
}

# Function to display migration summary
display_summary() {
    echo "=================================================="
    echo -e "${PURPLE}📊 Migration Summary${NC}"

    # Count total files and usages across all phases
    local total_files=0
    local total_usages=0

    total_files=$((${#PHASE_1_FILES[@]} + ${#PHASE_2_FILES[@]} + ${#PHASE_3_FILES[@]} + ${#PHASE_4_FILES[@]}))

    for usage in "${PHASE_1_FILES[@]}"; do total_usages=$((total_usages + usage)); done
    for usage in "${PHASE_2_FILES[@]}"; do total_usages=$((total_usages + usage)); done
    for usage in "${PHASE_3_FILES[@]}"; do total_usages=$((total_usages + usage)); done
    for usage in "${PHASE_4_FILES[@]}"; do total_usages=$((total_usages + usage)); done

    echo -e "${BLUE}Total files to migrate: $total_files${NC}"
    echo -e "${BLUE}Total ProfessionalTheme usages: $total_usages${NC}"

    if [ "$DRY_RUN" = false ]; then
        # Count remaining ProfessionalTheme usages
        remaining_total=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -c "ProfessionalTheme" 2>/dev/null | awk '{sum += $1} END {print sum}' || echo "0")
        migrated_total=$((total_usages - remaining_total))

        echo -e "${GREEN}Usages migrated: $migrated_total${NC}"
        echo -e "${GREEN}Usages remaining: $remaining_total${NC}"

        if [ "$remaining_total" -eq 0 ]; then
            echo -e "${GREEN}🎉 Complete success! All ProfessionalTheme usages migrated!${NC}"
        else
            local percentage=$((migrated_total * 100 / total_usages))
            echo -e "${YELLOW}Migration progress: $percentage%${NC}"
        fi
    fi

    echo "=================================================="
}

# Main execution
pre_migration_checks

case $PHASE in
    "1")
        migrate_phase "Phase 1 (Critical Priority)" PHASE_1_FILES
        ;;
    "2")
        migrate_phase "Phase 2 (High Priority)" PHASE_2_FILES
        ;;
    "3")
        migrate_phase "Phase 3 (Medium Priority)" PHASE_3_FILES
        ;;
    "4")
        migrate_phase "Phase 4 (Theme Cleanup)" PHASE_4_FILES
        ;;
    "all")
        migrate_phase "Phase 1 (Critical Priority)" PHASE_1_FILES
        migrate_phase "Phase 2 (High Priority)" PHASE_2_FILES
        migrate_phase "Phase 3 (Medium Priority)" PHASE_3_FILES
        migrate_phase "Phase 4 (Theme Cleanup)" PHASE_4_FILES
        ;;
esac

display_summary

if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}💡 To perform actual migration, run without --dry-run flag${NC}"
    echo -e "${YELLOW}💡 Example: ./batch-theme-migration.sh --phase=1${NC}"
else
    echo -e "${GREEN}🎉 Batch theme migration completed!${NC}"
    echo -e "${BLUE}💡 Next steps:${NC}"
    echo -e "${BLUE}   1. Test the application for visual regressions${NC}"
    echo -e "${BLUE}   2. Run type checking: npm run type-check${NC}"
    echo -e "${BLUE}   3. Run linting: npm run lint${NC}"
    echo -e "${BLUE}   4. Run tests: npm test${NC}"
fi