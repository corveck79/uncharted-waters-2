// eslint-disable-next-line @typescript-eslint/no-var-requires
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { GenerateSW } = require('workbox-webpack-plugin');

// used for hosting on johan.li/uncharted-waters-2
const PUBLIC_PATH = process.env.PUBLIC_PATH || '/';

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  const config = {
    entry: './src/app',
    output: {
      filename: '[contenthash].js',
      path: `${__dirname}/build/`,
      assetModuleFilename: '[name]-[contenthash][ext]',
      publicPath: PUBLIC_PATH,
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
        maxSize: 200 * 1024, // 200 KB per chunk voor JS/CSS
        cacheGroups: {
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      },
      runtimeChunk: {
        name: 'runtime',
      },
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/i,
          use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
        },
        {
          test: /\.(ogg|mp3|png|wasm)$/,
          type: 'asset/resource',
          generator: {
            filename: 'assets/[name]-[contenthash][ext]',
          },
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/homepage/index.html',
        favicon: './src/homepage/favicon.ico',
      }),
    ],
  };

  if (isProduction) {
    config.mode = 'production';
    delete config.devtool;

    config.plugins.push(
      new MiniCssExtractPlugin({
        filename: '[name]-[contenthash].css',
      }),
      new GenerateSW({
        clientsClaim: true,
        skipWaiting: true,
        // Precache all webpack-emitted assets (JS, CSS, images, audio, wasm).
        // The revision hash is derived from each file's content hash.
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10 MB (for .wasm / .ogg)
      }),
    );
  } else {
    config.mode = 'development';

    // following recommendations from https://webpack.js.org/configuration/devtool/
    config.devtool = 'eval-source-map';

    config.devServer = {
      static: false,
      port: process.env.PORT || 3000,
    };

    config.module.rules[0].options = {
      plugins: [require.resolve('react-refresh/babel')],
    };
    config.plugins.push(
      new ReactRefreshWebpackPlugin({overlay: false}),
      new MiniCssExtractPlugin(),
    );
  }

  return config;
};
