const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
let ExtractTextPlugin = require('extract-text-webpack-plugin');
let Webpack = require("webpack");
let cssExtractor = new ExtractTextPlugin('style.css', { allChunk: true });
const { VueLoaderPlugin } = require('vue-loader');
//const MiniCssExtractPlugin = require("mini-css-extract-plugin");
//const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

module.exports = {
    entry: './src/all.js',
    output: {
        path: path.resolve(__dirname, 'src/dist'),
        filename: 'build.js'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                options: {
                    configFile: 'tsconfig.json',
                    appendTsSuffixTo: [/\.vue$/]
                }
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {
						scss: cssExtractor.extract({
							fallback: "style-loader",
							use: [
								{
									loader: "css-loader"
								},
								"resolve-url-loader",
								{
									loader: "sass-loader?sourceMap",
									options: {
										includePaths: [path.resolve(__dirname, 'images'), path.resolve(__dirname, 'dist')]
									}
								}
							]
						}),
						sass: 'vue-style-loader!css-loader!sass-loader?indentedSyntax', // <style lang="sass">
						js: [
							{
								loader: 'babel-loader',
								options: {
									presets: ['env', 'es2015', 'stage-0', 'vue']
								}
							}
						]
                    }
                }
            },
            {
                test: /.js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['env', 'es2015', 'stage-0', 'vue']
                        }
                    }
                ]
            },
            {
                test: /\.css$/,
				loaders: cssExtractor.extract({
					fallback: "style-loader",
					use: [
						{
							loader: "css-loader"
						}, 
						"resolve-url-loader"
					]
				})
            },
            {
				test: /\.(sass|scss)$/,
				use: cssExtractor.extract({
					fallback: "style-loader",
					use: [
						{
							loader: "css-loader"
						},
						"resolve-url-loader", 
						{
							loader: "sass-loader?sourceMap",
							options: {
								includePaths: [path.resolve(__dirname, 'images'), path.resolve(__dirname, 'dist')],
								sourceMap: true
							}
						}
					]
				})
			},
			{
				test: /\.(png|svg|jpg|gif)$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: "[name].[hash].[ext]"
						}
					}
				]
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: "[name].[hash].[ext]"
						}
					}
				]
			}
            /*{
                test: /\.otf$|\.png|\.jpe?g|\.gif$/,
                use: {
                    loader: "url-loader",
                    options: {
                        name: "[name].[hash].[ext]",
                    }
                }
			},
			{
				test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
				loader: "url?limit=10000&mimetype=application/font-woff"
			},
			{
				test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
				loader: "url?limit=10000&mimetype=application/font-woff"
			},
			{
				test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
				loader: "url?limit=10000&mimetype=application/octet-stream"
			},
			{
				test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
				loader: "file"
			},
			{
				test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
				loader: "url?limit=10000&mimetype=image/svg+xml"
			}*/
        ]
    },
	devtool: 'source-map',
	resolve: {
		modules: [
			"node_modules",
			path.resolve(__dirname, "wwwroot")
		]
	},
    plugins: [
        cssExtractor,
        new Webpack.ProvidePlugin({
            Vue: "vue/dist/vue.min.js"
		}),
		/*new MiniCssExtractPlugin({
			filename: "[name].css",
			chunkFilename: "[id].css"
		})*/
    ],
    optimization: {
        minimizer: [
            /*new UglifyJsPlugin({
                uglifyOptions: {
                    beautify: true,
                    comments: true,
                    compress: {
                        sequences     : true,
                        booleans      : true,
                        loops         : true,
                        unused      : true,
                        warnings    : false,
                        drop_console: true,
                        unsafe      : true
                    }
                }
			}),
			new OptimizeCSSAssetsPlugin({})*/
        ]
    }
};