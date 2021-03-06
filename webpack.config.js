const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin')
const { argv } = require('process')

module.exports = (env, argv) => {
  const dev = argv.mode === 'development' ? true : false

  return {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'build'),
      publicPath: '',
      filename: dev ? '[name].js' : '[name].[hash].bundle.js',
      assetModuleFilename: 'images/[hash][ext][query]',
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [dev ? 'style-loader' : MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
          exclude: /node_modules/,
        },
        {
          test: /\.js$/,
          use: ['babel-loader'],
          exclude: /node_modules/,
        },
        {
          test: /\.(?:ico|gif|svg|png|jpg|jpeg)$/i,
          type: 'asset/resource',
        },
        {
          test: /\.(woff(2)?|eot|ttf|otf|svg|)$/,
          type: 'asset/inline',
        },
      ],
    },
    devtool: false,
    devServer: {
      open: true,
      bonjour: true,
      compress: true,
      hot: true,
      historyApiFallback: true,
      contentBase: path.join(__dirname, 'build'),
      overlay: {
        warnings: true,
        errors: true,
      },
    },
    resolve: {
      alias: {
        '~': path.resolve(__dirname, 'src'),
      },
      extensions: ['.js', '.vue', '.json', '.css'],
    },
    watchOptions: {
      aggregateTimeout: 300,
      ignored: /node_modules/,
    },
    optimization: {
      minimize: true,
      minimizer: [new OptimizeCssAssetsPlugin(), new TerserPlugin()],
      moduleIds: 'deterministic',
      runtimeChunk: {
        name: 'runtime',
      },
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            enforce: true,
          },
        },
      },
    },
    performance: {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
      }),
      new webpack.HotModuleReplacementPlugin(),
      new ImageMinimizerPlugin({
        minimizerOptions: {
          plugins: [
            ['gifsicle', { interlaced: true }],
            ['jpegtran', { progressive: true }],
            ['optipng', { optimizationLevel: 5 }],
            ['svgo', { plugins: [{ removeViewBox: false }] }],
          ],
        },
      }),
      new MiniCssExtractPlugin({
        linkType: 'text/css',
        filename: '[name].bundle.css',
        chunkFilename: '[id].css',
        ignoreOrder: false,
      }),
      new CleanWebpackPlugin(),
    ],
  }
}
