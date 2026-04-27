const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add .db to assetExts so Metro bundles the SQLite file
config.resolver.assetExts.push('db');

module.exports = config;
