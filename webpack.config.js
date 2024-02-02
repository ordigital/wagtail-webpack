'use strict'

const path = require('path')
// Autoprefixer for writing CSS rules without vendor prefixes
const autoprefixer = require('autoprefixer') 
// MiniCssExtractPlugin for combining output css files
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); 
// CopyWebpackPlugin to copy assets that do not need to be compiled
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  // `production` mode results in minified output files
  mode: 'production',
  performance: {
    // Warn us when output file > 512KB
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  },

  entry: {
    /*
     * Instead of putting source static files to default `app/app/static` folder,
     * we create `app/app/assets` folder where we will have our entypoints,
     * js, sass files, images, etc. Webpack will compile entypoints and sass files,
     * and copy `img/*` to `app/app/static folder`. In production mode, 
     * Wagtail will copy all of this to `/app/static`. 
     * Because of this we can simply use {% static 'app.js' %} in template.
     * We use two entrypoints for frontend (`app.js`) and backend (`admin.js`)
     */
    app: path.resolve(__dirname, 'app/assets/app.js'),
    admin: path.resolve(__dirname, 'app/assets/admin.js'),
  },

  output: {
    // Generate app.js and admin.js
    filename: (pathData) => {
      return pathData.chunk.name === 'app' ? 'app.js' : 'admin.js';
    },
    // set chunks names
    chunkFilename: "[id]-[chunkhash].js",
    // set output path to `app/static` (default for STATICFILES_DIRS defined in base.py)
    path: path.resolve(__dirname, 'app/static')
  },

  devServer: {
    // Run dev server with hot reload and writing output files to disk
    port: 8081,
    compress: true,
    hot: true,
    devMiddleware: {
      writeToDisk: true
    }
  },

  module: {
    rules: [
      // Compile and load imported sass files to css
      {
        test: /\.(scss)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
    ],
  },

  plugins: [
    // Generate app.css and admin.css
    new MiniCssExtractPlugin({
      filename: (pathData) => {
        return pathData.chunk.name === 'app' ? 'app.css' : 'admin.css';
      },
    }),
    // Copy img folders to static (we use `context` to keep structure)
    new CopyWebpackPlugin({
      patterns: [
        { from: '*', context: path.resolve(__dirname, 'app/assets/img'), to: path.resolve(__dirname, 'app/static/img/') },
        { from: '*', context: path.resolve(__dirname, 'app/assets/admin/img'), to: path.resolve(__dirname, 'app/static/admin/img/') },
      ],
    })
  ]

}
