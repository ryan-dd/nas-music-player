// Renderer process rules - without asset relocator that causes __dirname issues
module.exports = {
  rules: [
    {
      test: /\.tsx?$/,
      exclude: /(node_modules|\.webpack)/,
      use: {
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
        },
      },
    },
  ],
};
