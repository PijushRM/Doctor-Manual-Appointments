module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['module-resolver', {root: ['.'], alias: {src: './src'}}],
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        // Only these names can be imported. A missing one is undefined:
        // src/configs checks API_URL and gives MAX_UPLOAD_MB a default.
        allowlist: ['API_URL', 'MAX_UPLOAD_MB', 'LOG_LEVEL'],
        allowUndefined: true,
      },
    ],
  ],
};
