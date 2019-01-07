const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const config = {
  target: 'web',
  entry: {
    'client': './src/client/alex.client.js',
    'test.client' : './test/test.client.js'
  },
  module: {
  	rules: [
			{
		    'test': /\.js$/,
		    'exclude': /node_modules/,
		    'use': [{
		      'loader': 'babel-loader', // (see: https://www.npmjs.com/package/babel-loader)
		      'options': {
		        'compact': false,
		        'plugins': [
		          'transform-object-rest-spread', // (see: https://babeljs.io/docs/en/babel-plugin-transform-object-rest-spread)
		          'transform-class-properties',   // (see: https://babeljs.io/docs/en/babel-plugin-transform-class-properties/)
		          'add-react-displayname'         // (see: https://www.npmjs.com/package/babel-plugin-add-react-displayname)
		        ]
		      }
		    }]
		  },
      {
        'test': /\.html$/, // for .html files
        'use': { 
          'loader': 'html-loader',          // (see: https://www.npmjs.com/package/html-loader)
          'options': { 'minimize': true }   // run html files through minification
        }
      }      
  	]
  },
  resolve: {
    extensions: ['.js', '.json', '.css'], // limit alias to these file types (order matters here; css last)
    enforceExtension: false // allows importing of files without file's extension 
  },  
  output: {
    publicPath: '/',
    path: path.resolve(__dirname, '../'),
    filename: '[name].js'
  }
};

module.exports = (env, args) => {
  if (args.clean === 'true') {
    config.plugins = [
      new CleanWebpackPlugin(['build'],
        {
          'root': path.resolve(__dirname, '../') // re-focus CleanWebpackPlugin's root out of build/config/
        }
      )
    ];
  }
  return config;
};