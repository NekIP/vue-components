const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
let ExtractTextPlugin = require('extract-text-webpack-plugin');
let Webpack = require("webpack");
let cssExtractor = new ExtractTextPlugin('style.css', { allChunk: true })
const { VueLoaderPlugin } = require('vue-loader')

module.exports = {
    entry: './index.js',
    output: {
        path: path.resolve(__dirname, ''),
        filename: 'build.js'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                options: {
                    configFileName: 'tsconfig.json',
                    appendTsSuffixTo: [/\.vue$/]
                }
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {
                        scss: 'vue-style-loader!css-loader!sass-loader', // <style lang="scss">
                        sass: 'vue-style-loader!css-loader!sass-loader?indentedSyntax', // <style lang="sass">
                        ts: 'ts-loader'
                    }
                }
            },
            {
                test: /.js$/,
                use: 'babel-loader'
            },
            {
                test: /\.css$/,
                loaders: cssExtractor.extract({fallback: "style-loader", use: [
                    "css-loader", 
                    "resolve-url-loader"
                ]})
            },
            {
                test: /\.scss$/,
                use: cssExtractor.extract({fallback: "style-loader", use: [
                    "css-loader", 
                    "resolve-url-loader", 
                    {
                        loader: "sass-loader?sourceMap",
                        options: {
                            includePaths: [path.resolve(__dirname, 'images'), path.resolve(__dirname, 'dist')]
                        }
                    }
                ]})
            },
            {
                test: /\.woff2?$|\.ttf$|\.otf$|\.eot$|\.svg$|\.png|\.jpe?g|\.gif$/,
                use: {
                    loader: "url-loader",
                    options: {
                        name: "[name].[hash].[ext]",
                    },
                },
            }
        ]
    },
    plugins: [
        /*new VueLoaderPlugin(),*/
        cssExtractor,
        new Webpack.ProvidePlugin({
            Vue: "vue/dist/vue.min.js",
            /*$: "jquery/dist/jquery.min.js",
            jQuery: "jquery/dist/jquery.min.js",
            "window.jQuery": "jquery/dist/jquery.min.js",*/
        })
    ],
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                uglifyOptions: {
                    beautify: false,
                    comments: false,
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
            })
        ]
    }
};