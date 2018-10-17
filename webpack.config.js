const path = require('path');
const { VueLoaderPlugin } = require('vue-loader')
let UglifyJSPlugin = require('uglifyjs-webpack-plugin');
let ExtractTextPlugin = require('extract-text-webpack-plugin');
let Webpack = require("webpack");
let extractTextPlugin = new ExtractTextPlugin('styles.css', {
	allChunks: true
})
module.exports = {
    entry: './index.js',
    output: {
        path: path.resolve(__dirname, ''),
        filename: 'build.js'
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {
                        scss: 'vue-style-loader!css-loader!sass-loader', // <style lang="scss">
                        sass: 'vue-style-loader!css-loader!sass-loader?indentedSyntax' // <style lang="sass">
                    }
                }
            },
            {
                test: /\.css$/,
                loaders: ['style-loader', 'css-loader', 'resolve-url-loader']
            },
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: "style-loader"
                    },
                    {
                        loader: "css-loader"
                    },
                    {
                        loader: "resolve-url-loader"
                    },
                    {
                        loader: "sass-loader?sourceMap",
                        options: {
                            includePaths: [path.resolve(__dirname, 'wwwroot/images'), path.resolve(__dirname, 'wwwroot/dist')]
                        }
                    }
                ]
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
        //new UglifyJSPlugin(), // not worked with sass
        new VueLoaderPlugin(),
        extractTextPlugin,
        new Webpack.ProvidePlugin({
            Vue: "vue/dist/vue.min.js",
            $: "jquery/dist/jquery.min.js",
            jQuery: "jquery/dist/jquery.min.js",
            "window.jQuery": "jquery/dist/jquery.min.js",
            d3: "d3/build/d3.min.js"
        })
    ]
};