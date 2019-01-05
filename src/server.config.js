const path = require('path');
const NodeExternals = require('webpack-node-externals');

module.exports = {
  target: "node",
  entry: {
    'server': './src/server/alex.server.js',
    'test.server' : './test/test.server.js'
  },
  output: {
    path: path.resolve(__dirname, "../"),
    filename: "[name].js"
  },
  externals: [NodeExternals()],
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:8025',
        changeOrigin: true,
        secure: false
      }
    }      
  }  
};