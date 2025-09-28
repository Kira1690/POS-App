#!/bin/bash

# Color Replacement Script
# Replaces hardcoded colors with theme color references
# Usage: ./color-replacement.sh [--dry-run] [--aggressive]

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
AGGRESSIVE=false

# Parse command line arguments
for arg in "$@"; do
    case $arg in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --aggressive)
            AGGRESSIVE=true
            shift
            ;;
        *)
            # Unknown option
            ;;
    esac
done

echo -e "${PURPLE}🎨 Color Replacement Script${NC}"
echo -e "${BLUE}Dry Run: $DRY_RUN${NC}"
echo -e "${BLUE}Aggressive Mode: $AGGRESSIVE${NC}"
echo "=================================================="

# Common hardcoded colors and their theme equivalents
declare -A COLOR_MAPPINGS=(
    # White variations
    ["#FFFFFF"]="theme.colors.surface"
    ["#FFF"]="theme.colors.surface"
    ["white"]="theme.colors.surface"

    # Black variations
    ["#000000"]="theme.colors.onSurface"
    ["#000"]="theme.colors.onSurface"
    ["black"]="theme.colors.onSurface"

    # Apple system colors
    ["#1C1C1E"]="theme.colors.onSurface"
    ["#F2F2F7"]="theme.colors.background"
    ["#8E8E93"]="theme.colors.onSurfaceVariant"
    ["#007AFF"]="theme.colors.primary"
    ["#FF3B30"]="theme.colors.error"
    ["#34C759"]="theme.colors.success"
    ["#FF9500"]="theme.colors.warning"

    # Gray variations
    ["#333333"]="theme.colors.onSurface"
    ["#666666"]="theme.colors.onSurfaceVariant"
    ["#999999"]="theme.colors.onSurfaceVariant"
    ["#CCCCCC"]="theme.colors.outline"
    ["#EEEEEE"]="theme.colors.surfaceVariant"

    # Background variations
    ["#F5F5F5"]="theme.colors.background"
    ["#FAFAFA"]="theme.colors.background"
    ["#F9F9F9"]="theme.colors.background"
)

# Aggressive mode additional mappings (use with caution)
declare -A AGGRESSIVE_MAPPINGS=(
    # Blue variations
    ["#0066CC"]="theme.colors.primary"
    ["#0080FF"]="theme.colors.primary"
    ["#1976D2"]="theme.colors.primary"

    # Red variations
    ["#FF0000"]="theme.colors.error"
    ["#DC3545"]="theme.colors.error"
    ["#D32F2F"]="theme.colors.error"

    # Green variations
    ["#00FF00"]="theme.colors.success"
    ["#28A745"]="theme.colors.success"
    ["#4CAF50"]="theme.colors.success"

    # Orange variations
    ["#FFA500"]="theme.colors.warning"
    ["#FF6600"]="theme.colors.warning"
)

# Function to scan for hardcoded colors
scan_hardcoded_colors() {
    echo -e "${BLUE}🔍 Scanning for hardcoded colors...${NC}"

    # Find all TypeScript and TSX files
    local files=$(find src -name "*.tsx" -o -name "*.ts" | grep -v ".d.ts")
    local total_files=0
    local files_with_colors=0

    for file in $files; do
        total_files=$((total_files + 1))

        # Check for hex colors (#RRGGBB or #RGB)
        local hex_colors=$(grep -o '#[0-9A-Fa-f]\{3,6\}' "$file" 2>/dev/null | sort -u)

        # Check for named colors
        local named_colors=$(grep -o '\b\(white\|black\|red\|green\|blue\|yellow\|orange\|purple\|gray\|grey\)\b' "$file" 2>/dev/null | sort -u)

        if [ -n "$hex_colors" ] || [ -n "$named_colors" ]; then
            files_with_colors=$((files_with_colors + 1))
            echo -e "${YELLOW}  📄 $file${NC}"

            if [ -n "$hex_colors" ]; then
                echo -e "${BLUE}    Hex colors:${NC}"
                for color in $hex_colors; do
                    local count=$(grep -c "$color" "$file")
                    echo -e "${BLUE}      $color ($count usages)${NC}"
                done
            fi

            if [ -n "$named_colors" ]; then
                echo -e "${BLUE}    Named colors:${NC}"
                for color in $named_colors; do
                    local count=$(grep -c "\\b$color\\b" "$file")
                    echo -e "${BLUE}      $color ($count usages)${NC}"
                done
            fi
        fi
    done

    echo -e "${GREEN}📊 Scan complete:${NC}"
    echo -e "${GREEN}  Total files: $total_files${NC}"
    echo -e "${GREEN}  Files with colors: $files_with_colors${NC}"
    echo ""
}

# Function to replace colors in a file
replace_colors_in_file() {
    local file="$1"
    local temp_file=$(mktemp)
    local changes_made=false

    # Copy original to temp file
    cp "$file" "$temp_file"

    echo -e "${BLUE}  🎨 Processing: $file${NC}"

    # Process standard color mappings
    for color in "${!COLOR_MAPPINGS[@]}"; do
        local replacement="${COLOR_MAPPINGS[$color]}"

        # For hex colors, we need to escape the # character
        if [[ $color == \#* ]]; then
            local escaped_color=$(echo "$color" | sed 's/#/\\#/g')

            # Replace in various contexts (backgroundColor, color, borderColor, etc.)
            if sed -n "/$escaped_color/p" "$temp_file" | grep -q "$color"; then
                echo -e "${YELLOW}    Replacing $color → $replacement${NC}"
                sed -i "s/'$color'/$replacement/g" "$temp_file"
                sed -i "s/\"$color\"/$replacement/g" "$temp_file"
                sed -i "s/$escaped_color/$replacement/g" "$temp_file"
                changes_made=true
            fi
        else
            # For named colors, use word boundaries
            if grep -q "\\b$color\\b" "$temp_file"; then
                # Only replace in style contexts, not in strings or comments
                if grep -q "color.*['\"]$color['\"]" "$temp_file" || grep -q "backgroundColor.*['\"]$color['\"]" "$temp_file"; then
                    echo -e "${YELLOW}    Replacing '$color' → $replacement${NC}"
                    sed -i "s/'$color'/$replacement/g" "$temp_file"
                    sed -i "s/\"$color\"/$replacement/g" "$temp_file"
                    changes_made=true
                fi
            fi
        fi
    done

    # Process aggressive mappings if enabled
    if [ "$AGGRESSIVE" = true ]; then
        for color in "${!AGGRESSIVE_MAPPINGS[@]}"; do
            local replacement="${AGGRESSIVE_MAPPINGS[$color]}"

            if [[ $color == \#* ]]; then
                local escaped_color=$(echo "$color" | sed 's/#/\\#/g')

                if sed -n "/$escaped_color/p" "$temp_file" | grep -q "$color"; then
                    echo -e "${PURPLE}    [AGGRESSIVE] Replacing $color → $replacement${NC}"
                    sed -i "s/'$color'/$replacement/g" "$temp_file"
                    sed -i "s/\"$color\"/$replacement/g" "$temp_file"
                    sed -i "s/$escaped_color/$replacement/g" "$temp_file"
                    changes_made=true
                fi
            fi
        done
    fi

    # Apply changes if not in dry-run mode
    if [ "$DRY_RUN" = false ] && [ "$changes_made" = true ]; then
        mv "$temp_file" "$file"
        echo -e "${GREEN}    ✅ Changes applied${NC}"
    elif [ "$DRY_RUN" = true ] && [ "$changes_made" = true ]; then
        echo -e "${YELLOW}    DRY-RUN: Changes would be applied${NC}"
        rm "$temp_file"
    else
        echo -e "${BLUE}    ℹ️  No changes needed${NC}"
        rm "$temp_file"
    fi
}

# Function to process all files
process_all_files() {
    echo -e "${BLUE}🔄 Processing all files for color replacement...${NC}"

    # Find all TypeScript and TSX files
    local files=$(find src -name "*.tsx" -o -name "*.ts" | grep -v ".d.ts")
    local total_files=0
    local processed_files=0

    for file in $files; do
        total_files=$((total_files + 1))

        # Check if file has hardcoded colors
        if grep -q '#[0-9A-Fa-f]\{3,6\}\|\\b\(white\|black\)\b' "$file"; then
            processed_files=$((processed_files + 1))
            replace_colors_in_file "$file"
        fi
    done

    echo -e "${GREEN}📊 Processing complete:${NC}"
    echo -e "${GREEN}  Total files: $total_files${NC}"
    echo -e "${GREEN}  Files processed: $processed_files${NC}"
}

# Function to validate theme hook usage
validate_theme_usage() {
    echo -e "${BLUE}🔍 Validating theme hook usage...${NC}"

    local files_needing_theme=0
    local files=$(find src -name "*.tsx" -o -name "*.ts" | grep -v ".d.ts")

    for file in $files; do
        # Check if file uses theme colors but doesn't import useTheme
        if grep -q "theme\.colors\." "$file" && ! grep -q "useTheme" "$file"; then
            files_needing_theme=$((files_needing_theme + 1))
            echo -e "${YELLOW}  ⚠️  $file uses theme colors but doesn't import useTheme${NC}"
        fi
    done

    if [ "$files_needing_theme" -eq 0 ]; then
        echo -e "${GREEN}  ✅ All files using theme colors have proper imports${NC}"
    else
        echo -e "${YELLOW}  ⚠️  $files_needing_theme files may need useTheme import${NC}"
    fi
}

# Main execution
echo -e "${BLUE}📋 Starting color replacement process...${NC}"
echo ""

# Step 1: Scan for hardcoded colors
scan_hardcoded_colors

# Step 2: Process files (or show what would be processed)
process_all_files

echo ""

# Step 3: Validate theme usage
validate_theme_usage

echo ""
echo "=================================================="
echo -e "${PURPLE}📊 Color Replacement Summary${NC}"

if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}DRY-RUN mode: No actual changes were made${NC}"
    echo -e "${YELLOW}To apply changes, run: ./color-replacement.sh${NC}"
    echo -e "${YELLOW}For aggressive replacements: ./color-replacement.sh --aggressive${NC}"
else
    echo -e "${GREEN}✅ Color replacement completed!${NC}"
    echo -e "${BLUE}💡 Next steps:${NC}"
    echo -e "${BLUE}   1. Review changes for accuracy${NC}"
    echo -e "${BLUE}   2. Test application for visual consistency${NC}"
    echo -e "${BLUE}   3. Add useTheme imports where needed${NC}"
    echo -e "${BLUE}   4. Run type checking: npm run type-check${NC}"
fi

echo -e "${GREEN}🎉 Color replacement script completed!${NC}"