const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { webpack } = require('webpack');

module.exports = {
  mode:'development',
  entry: './src/main.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.(glsl|vs|fs|vert|frag|gltf)$/i,
        exclude: /node_modules/,
        use: ["raw-loader"],
      },
      {
        test: /\.(jpg)$/i,
        exclude: /node_modules/,
        use: ["file-loader"],
      }
    ]
  },
  devServer: {
    port:5555,
    client:{
      overlay:{
        warnings:false
      }
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template:'./index.html'
    })
  ]
};