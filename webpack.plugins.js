// ForkTsCheckerWebpackPlugin disabled due to TypeScript version compatibility issues
// const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
  plugins: [
    // Type checking disabled to allow compilation to proceed
    // Will be enabled after TypeScript version upgrade
    // new ForkTsCheckerWebpackPlugin({
    //   logger: 'webpack-infrastructure',
    // }),
  ],
};
