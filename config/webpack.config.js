/* eslint strict: 0 */
'use strict';
const path = require('path');
const webpack = require('webpack');

const config = {
  entry: {
    app: ['./app/main.tsx']
  },
  target: 'electron',
  output: {
    path: path.join(__dirname, '../dist'),
    filename: 'bundle.js',
    publicPath: '/dist/',
    libraryTarget: 'commonjs2'
  },
  resolve: {
    extensions: ['', '.ts', '.tsx', '.js'],
  },
  devtool: 'source-map',
  module: {
    loaders: [
      {test: /\.tsx?$/, loaders: ['babel', 'ts-loader']}
    ]
  },
  plugins: []
};

if (process.env.HOT) {
  config.debug = true;
  config.devtool = 'cheap-module-eval-source-map';
  config.plugins.unshift(
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      '__DEV__': true,
      'process.env': {
        'NODE_ENV': JSON.stringify('development')
      }
    })
  );
}

module.exports = config;
