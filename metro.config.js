// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add .wasm to asset extensions so Metro can resolve
// `import wasmModule from './wa-sqlite/wa-sqlite.wasm'` in expo-sqlite web worker
config.resolver.assetExts.push('wasm');

// Ensure .wasm is not treated as a source file
config.resolver.sourceExts = config.resolver.sourceExts.filter((ext) => ext !== 'wasm');

module.exports = config;
