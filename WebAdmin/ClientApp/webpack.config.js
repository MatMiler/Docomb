const path = require('path');

module.exports = {
	mode: 'development',
	entry: path.resolve(__dirname, 'src', 'index.js'),
	output: {
		path: path.resolve(__dirname, '../wwwroot/_resources/admin'),
		filename: 'bundle.js'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				loader: 'buble-loader',
				include: path.join(__dirname, 'src'),
				options: {
					objectAssign: 'Object.assign',
					transforms: { asyncAwait: false, generator: false }
				}
			}
		]
	}
};