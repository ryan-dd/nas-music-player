const { rules } = require('./webpack.renderer.rules');
const { plugins } = require('./webpack.plugins');

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

module.exports = {
  mode: 'development',
  module: {
    rules,
  },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
  target: 'electron-renderer',
  output: {
    libraryTarget: 'umd',
    globalObject: 'this',
  },
  node: {
    __dirname: false,
    __filename: false,
  },
};
