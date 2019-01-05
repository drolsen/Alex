const path = require('path');
const NodeExternals = require('webpack-node-externals');

const config = {
  target: "node",
  entry: {
    'alex.server': './src/server/alex.server.js',
    'test.server' : './test/test.server.js'
  },
  output: {
    path: path.resolve(__dirname, "../build"),
    filename: "[name].js"
  },
  externals: [NodeExternals()],
};

module.exports = (env, args) => {
  return config;
};