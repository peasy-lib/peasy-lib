/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const Dotenv = require('dotenv-webpack');
const nodeExternals = require('webpack-node-externals');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const cssLoader = 'css-loader';


const postcssLoader = {
  loader: 'postcss-loader',
  options: {
    postcssOptions: {
      plugins: ['autoprefixer']
    }
  }
};

module.exports = function (env, { analyze }) {
  const production = env.production || process.env.NODE_ENV === 'production';
  return {
    target: production ? 'node' : 'web',
    mode: production ? 'production' : 'development',
    devtool: production ? undefined : 'eval-cheap-source-map',
    entry: {
      // Build only plugin in production mode,
      // build dev-app in non-production mode
      entry: production ? './src/index.ts' : './dev-app/main.ts'
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: production ? 'index.js' : '[name].bundle.js',
      library: production ? { type: 'commonjs' } : undefined
    },
    resolve: {
      extensions: ['.ts', '.js'],
      modules: [path.resolve(__dirname, 'src'), path.resolve(__dirname, 'dev-app'), 'node_modules'],
      alias: production ? {
        // add your production aliasing here
      } : {
        // ...[
        //   'peasy-audio',
        // ].reduce((map, pkg) => {
        //   const name = `@peasy-lib/${pkg}`;
        //   map[name] = path.resolve(__dirname, 'node_modules', name, 'dist/esm/index.dev.mjs');
        //   return map;
        // }, {
        //   'peasy-lib': path.resolve(__dirname, 'node_modules/peasy-lib/dist/esm/index.dev.mjs'),
        //   // add your development aliasing here
        // })
      }
    },
    devServer: {
      historyApiFallback: true,
      open: !process.env.CI,
      port: 9066,
      // https: true,
      // headers: {
      //   "Access-Control-Allow-Origin": "*",
      // },
    },
    module: {
      rules: [
        { test: /\.(png|svg|jpg|jpeg|gif)$/i, type: 'asset' },
        { test: /\.(woff|woff2|ttf|eot|svg|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/i, type: 'asset' },
        { test: /\.css$/i, use: ['style-loader', cssLoader, postcssLoader] },
        { test: /\.ts$/i, use: ['ts-loader'], exclude: /node_modules/ } /*,
        { test: /\.html$/i, use: 'html-loader', exclude: /node_modules/ } */
      ]
    },
    externalsPresets: { node: production },
    externals: [
      // Skip npm dependencies in plugin build.
      production && nodeExternals()
    ].filter(p => p),
    plugins: [
      !production && new HtmlWebpackPlugin({ template: 'index.html' }),
      new Dotenv({
        path: `./.env${production ? '' : '.' + (process.env.NODE_ENV || 'development')}`,
      }),
      analyze && new BundleAnalyzerPlugin(),
      new CopyWebpackPlugin({
        patterns: [
          { from: 'timer.html' },
          // { from: 'global-item.js' }
        ]
      })
    ].filter(p => p)
  }
}
