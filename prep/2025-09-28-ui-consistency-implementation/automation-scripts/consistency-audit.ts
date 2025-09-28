#!/usr/bin/env npx ts-node

/**
 * UI Consistency Audit Script
 * Monitors and tracks UI consistency metrics across the codebase
 * Usage: npx ts-node consistency-audit.ts [--output=json|markdown] [--save]
 */

import { execSync } from 'child_process';
import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { join, extname } from 'path';

interface ConsistencyMetrics {
  timestamp: string;
  overallScore: number;
  themeUsage: ThemeUsageMetrics;
  componentUsage: ComponentUsageMetrics;
  styleMetrics: StyleMetrics;
  fileAnalysis: FileAnalysisMetrics;
}

interface ThemeUsageMetrics {
  useThemeFiles: number;
  professionalThemeFiles: number;
  hardcodedColorFiles: number;
  themeConsistencyScore: number;
  totalThemeUsages: number;
}

interface ComponentUsageMetrics {
  appleComponentFiles: number;
  legacyComponentFiles: number;
  inlineStyleFiles: number;
  componentConsistencyScore: number;
  totalComponents: number;
}

interface StyleMetrics {
  stylesheetInstances: number;
  duplicatePatterns: number;
  averageStylesPerFile: number;
  styleUtilityUsage: number;
}

interface FileAnalysisMetrics {
  totalTsxFiles: number;
  analyzedFiles: number;
  largeFiles: number; // > 300 lines
  complexComponents: number; // > 200 lines
}

class ConsistencyAuditor {
  private srcPath: string;
  private outputFormat: 'json' | 'markdown';
  private saveResults: boolean;

  constructor(outputFormat: 'json' | 'markdown' = 'markdown', saveResults: boolean = false) {
    this.srcPath = join(process.cwd(), 'src');
    this.outputFormat = outputFormat;
    this.saveResults = saveResults;
  }

  /**
   * Main audit function
   */
  public async audit(): Promise<ConsistencyMetrics> {
    console.log('🔍 Starting UI Consistency Audit...\n');

    const files = this.getAllTsxFiles();

    const themeUsage = this.analyzeThemeUsage(files);
    const componentUsage = this.analyzeComponentUsage(files);
    const styleMetrics = this.analyzeStyleMetrics(files);
    const fileAnalysis = this.analyzeFileMetrics(files);

    const overallScore = this.calculateOverallScore(themeUsage, componentUsage, styleMetrics);

    const metrics: ConsistencyMetrics = {
      timestamp: new Date().toISOString(),
      overallScore,
      themeUsage,
      componentUsage,
      styleMetrics,
      fileAnalysis,
    };

    this.outputResults(metrics);

    if (this.saveResults) {
      this.saveToFile(metrics);
    }

    return metrics;
  }

  /**
   * Get all TypeScript/TSX files in src directory
   */
  private getAllTsxFiles(): string[] {
    const files: string[] = [];

    const walkDir = (dir: string) => {
      const items = readdirSync(dir);

      for (const item of items) {
        const fullPath = join(dir, item);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          walkDir(fullPath);
        } else if (['.tsx', '.ts'].includes(extname(item)) && !item.includes('.d.ts')) {
          files.push(fullPath);
        }
      }
    };

    walkDir(this.srcPath);
    return files;
  }

  /**
   * Analyze theme usage patterns
   */
  private analyzeThemeUsage(files: string[]): ThemeUsageMetrics {
    let useThemeFiles = 0;
    let professionalThemeFiles = 0;
    let hardcodedColorFiles = 0;
    let totalThemeUsages = 0;

    for (const file of files) {
      const content = readFileSync(file, 'utf-8');

      if (content.includes('useTheme')) {
        useThemeFiles++;
      }

      if (content.includes('ProfessionalTheme')) {
        professionalThemeFiles++;
        const matches = content.match(/ProfessionalTheme/g);
        totalThemeUsages += matches ? matches.length : 0;
      }

      if (content.match(/#[0-9A-Fa-f]{3,6}|\\b(white|black)\\b/)) {
        hardcodedColorFiles++;
      }
    }

    const themeConsistencyScore = this.calculateThemeScore(
      useThemeFiles,
      professionalThemeFiles,
      hardcodedColorFiles,
      files.length
    );

    return {
      useThemeFiles,
      professionalThemeFiles,
      hardcodedColorFiles,
      themeConsistencyScore,
      totalThemeUsages,
    };
  }

  /**
   * Analyze component usage patterns
   */
  private analyzeComponentUsage(files: string[]): ComponentUsageMetrics {
    let appleComponentFiles = 0;
    let legacyComponentFiles = 0;
    let inlineStyleFiles = 0;
    let totalComponents = 0;

    for (const file of files) {
      const content = readFileSync(file, 'utf-8');

      // Count files using Apple components
      if (content.includes('Apple') && (content.includes('AppleCard') || content.includes('AppleButton'))) {
        appleComponentFiles++;
      }

      // Count files with StyleSheet.create (legacy pattern)
      if (content.includes('StyleSheet.create')) {
        legacyComponentFiles++;
      }

      // Count files with inline styles
      if (content.includes('style={{') || content.includes('style={[')) {
        inlineStyleFiles++;
      }

      // Count total components (files exporting React components)
      if (content.includes('export') && (content.includes('FC<') || content.includes('React.Component'))) {
        totalComponents++;
      }
    }

    const componentConsistencyScore = this.calculateComponentScore(
      appleComponentFiles,
      legacyComponentFiles,
      totalComponents
    );

    return {
      appleComponentFiles,
      legacyComponentFiles,
      inlineStyleFiles,
      componentConsistencyScore,
      totalComponents,
    };
  }

  /**
   * Analyze style metrics
   */
  private analyzeStyleMetrics(files: string[]): StyleMetrics {
    let stylesheetInstances = 0;
    let totalStyleLines = 0;
    let styleUtilityUsage = 0;

    for (const file of files) {
      const content = readFileSync(file, 'utf-8');

      // Count StyleSheet.create instances
      const stylesheetMatches = content.match(/StyleSheet\.create/g);
      stylesheetInstances += stylesheetMatches ? stylesheetMatches.length : 0;

      // Count style utility usage
      if (content.includes('createCardStyle') || content.includes('createButtonStyle')) {
        styleUtilityUsage++;
      }

      // Estimate style lines
      const lines = content.split('\n');
      for (const line of lines) {
        if (line.includes(':') && (line.includes('px') || line.includes('#') || line.includes('center'))) {
          totalStyleLines++;
        }
      }
    }

    const averageStylesPerFile = files.length > 0 ? totalStyleLines / files.length : 0;
    const duplicatePatterns = this.estimateDuplicatePatterns(files);

    return {
      stylesheetInstances,
      duplicatePatterns,
      averageStylesPerFile: Math.round(averageStylesPerFile * 100) / 100,
      styleUtilityUsage,
    };
  }

  /**
   * Analyze file metrics
   */
  private analyzeFileMetrics(files: string[]): FileAnalysisMetrics {
    let largeFiles = 0;
    let complexComponents = 0;

    for (const file of files) {
      const content = readFileSync(file, 'utf-8');
      const lineCount = content.split('\n').length;

      if (lineCount > 300) {
        largeFiles++;
      }

      if (lineCount > 200 && content.includes('export')) {
        complexComponents++;
      }
    }

    return {
      totalTsxFiles: files.length,
      analyzedFiles: files.length,
      largeFiles,
      complexComponents,
    };
  }

  /**
   * Calculate theme consistency score
   */
  private calculateThemeScore(
    useTheme: number,
    professionalTheme: number,
    hardcoded: number,
    total: number
  ): number {
    if (total === 0) return 10;

    const useThemeRatio = useTheme / total;
    const professionalThemeRatio = professionalTheme / total;
    const hardcodedRatio = hardcoded / total;

    // Ideal: 100% useTheme, 0% ProfessionalTheme, minimal hardcoded
    const score = (useThemeRatio * 10) - (professionalThemeRatio * 3) - (hardcodedRatio * 2);
    return Math.max(0, Math.min(10, score));
  }

  /**
   * Calculate component consistency score
   */
  private calculateComponentScore(apple: number, legacy: number, total: number): number {
    if (total === 0) return 10;

    const appleRatio = apple / total;
    const legacyRatio = legacy / total;

    // Ideal: High Apple component usage, low legacy
    const score = (appleRatio * 10) - (legacyRatio * 2);
    return Math.max(0, Math.min(10, score));
  }

  /**
   * Calculate overall consistency score
   */
  private calculateOverallScore(
    theme: ThemeUsageMetrics,
    component: ComponentUsageMetrics,
    style: StyleMetrics
  ): number {
    const themeWeight = 0.4;
    const componentWeight = 0.4;
    const styleWeight = 0.2;

    // Style score based on stylesheet reduction
    const styleScore = Math.max(0, 10 - (style.stylesheetInstances / 20));

    const overallScore =
      theme.themeConsistencyScore * themeWeight +
      component.componentConsistencyScore * componentWeight +
      styleScore * styleWeight;

    return Math.round(overallScore * 100) / 100;
  }

  /**
   * Estimate duplicate style patterns
   */
  private estimateDuplicatePatterns(files: string[]): number {
    const patterns = new Map<string, number>();

    for (const file of files) {
      const content = readFileSync(file, 'utf-8');

      // Look for common patterns
      const cardPatterns = content.match(/borderRadius:\s*\d+/g) || [];
      const paddingPatterns = content.match(/padding:\s*\d+/g) || [];
      const colorPatterns = content.match(/backgroundColor:\s*['"][^'"]+['"]/g) || [];

      [...cardPatterns, ...paddingPatterns, ...colorPatterns].forEach(pattern => {
        patterns.set(pattern, (patterns.get(pattern) || 0) + 1);
      });
    }

    // Count patterns that appear more than once
    let duplicates = 0;
    for (const [pattern, count] of patterns) {
      if (count > 1) {
        duplicates += count - 1;
      }
    }

    return duplicates;
  }

  /**
   * Output results based on format
   */
  private outputResults(metrics: ConsistencyMetrics): void {
    if (this.outputFormat === 'json') {
      console.log(JSON.stringify(metrics, null, 2));
    } else {
      this.outputMarkdown(metrics);
    }
  }

  /**
   * Output results in markdown format
   */
  private outputMarkdown(metrics: ConsistencyMetrics): void {
    console.log(`# UI Consistency Audit Report`);
    console.log(`**Generated**: ${new Date(metrics.timestamp).toLocaleString()}\n`);

    console.log(`## 📊 Overall Score: ${metrics.overallScore}/10`);

    const scoreEmoji = metrics.overallScore >= 8 ? '🟢' : metrics.overallScore >= 6 ? '🟡' : '🔴';
    const scoreLabel = metrics.overallScore >= 8 ? 'EXCELLENT' : metrics.overallScore >= 6 ? 'GOOD' : 'NEEDS IMPROVEMENT';

    console.log(`${scoreEmoji} **${scoreLabel}**\n`);

    console.log(`## 🎨 Theme Usage Analysis`);
    console.log(`- **useTheme Hook**: ${metrics.themeUsage.useThemeFiles} files`);
    console.log(`- **ProfessionalTheme**: ${metrics.themeUsage.professionalThemeFiles} files (${metrics.themeUsage.totalThemeUsages} usages)`);
    console.log(`- **Hardcoded Colors**: ${metrics.themeUsage.hardcodedColorFiles} files`);
    console.log(`- **Theme Score**: ${metrics.themeUsage.themeConsistencyScore}/10\n`);

    console.log(`## 🧩 Component Usage Analysis`);
    console.log(`- **Apple Components**: ${metrics.componentUsage.appleComponentFiles} files`);
    console.log(`- **Legacy StyleSheet**: ${metrics.componentUsage.legacyComponentFiles} files`);
    console.log(`- **Inline Styles**: ${metrics.componentUsage.inlineStyleFiles} files`);
    console.log(`- **Component Score**: ${metrics.componentUsage.componentConsistencyScore}/10\n`);

    console.log(`## 📏 Style Metrics`);
    console.log(`- **StyleSheet Instances**: ${metrics.styleMetrics.stylesheetInstances}`);
    console.log(`- **Duplicate Patterns**: ${metrics.styleMetrics.duplicatePatterns}`);
    console.log(`- **Style Utility Usage**: ${metrics.styleMetrics.styleUtilityUsage} files`);
    console.log(`- **Avg Styles/File**: ${metrics.styleMetrics.averageStylesPerFile}\n`);

    console.log(`## 📁 File Analysis`);
    console.log(`- **Total Files**: ${metrics.fileAnalysis.totalTsxFiles}`);
    console.log(`- **Large Files (>300 lines)**: ${metrics.fileAnalysis.largeFiles}`);
    console.log(`- **Complex Components (>200 lines)**: ${metrics.fileAnalysis.complexComponents}\n`);

    // Recommendations
    console.log(`## 🎯 Priority Recommendations`);

    if (metrics.themeUsage.professionalThemeFiles > 0) {
      console.log(`🔴 **CRITICAL**: Migrate ${metrics.themeUsage.professionalThemeFiles} ProfessionalTheme files to useTheme`);
    }

    if (metrics.styleMetrics.stylesheetInstances > 30) {
      console.log(`🟡 **HIGH**: Reduce StyleSheet instances from ${metrics.styleMetrics.stylesheetInstances} to <30`);
    }

    if (metrics.componentUsage.appleComponentFiles < metrics.componentUsage.totalComponents * 0.8) {
      console.log(`🟡 **MEDIUM**: Increase Apple component adoption (currently ${Math.round((metrics.componentUsage.appleComponentFiles / metrics.componentUsage.totalComponents) * 100)}%)`);
    }

    console.log(`\n✅ **Audit Complete**`);
  }

  /**
   * Save results to file
   */
  private saveToFile(metrics: ConsistencyMetrics): void {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `consistency-audit-${timestamp}.json`;
    const filepath = join(process.cwd(), 'prep/2025-09-28-ui-consistency-implementation/progress-tracking', filename);

    writeFileSync(filepath, JSON.stringify(metrics, null, 2));
    console.log(`💾 Results saved to: ${filename}`);
  }
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);

  let outputFormat: 'json' | 'markdown' = 'markdown';
  let saveResults = false;

  for (const arg of args) {
    if (arg.startsWith('--output=')) {
      const format = arg.split('=')[1] as 'json' | 'markdown';
      if (['json', 'markdown'].includes(format)) {
        outputFormat = format;
      }
    }
    if (arg === '--save') {
      saveResults = true;
    }
  }

  const auditor = new ConsistencyAuditor(outputFormat, saveResults);
  await auditor.audit();
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { ConsistencyAuditor, ConsistencyMetrics };