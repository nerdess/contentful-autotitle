const webpack = require('webpack');

module.exports = {
	webpack: {
	  plugins: [
		new webpack.ProvidePlugin({
		  $: 'jquery',
		  jQuery: 'jquery',
		  'window.jQuery': 'jquery',
		}),
	  ],
	},
  };
