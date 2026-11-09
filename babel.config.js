module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['module-resolver', {root: ['.'], alias: {src: './src'}}],
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        // Only these names can be imported; a missing one fails the build.
        allowlist: ['API_URL'],
        allowUndefined: false,
      },
    ],
  ],
};
