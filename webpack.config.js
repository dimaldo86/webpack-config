// npm install webpack webpack-cli webpack-dev-server --D
const path = require('path');
//npm install html-webpack-plugin -D
const HtmlWebpackPlugin = require('html-webpack-plugin');
//npm install --save-dev mini-css-extract-plugin
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// npm install copy-webpack-plugin --save-dev
const CopyWebpackPlugin = require('copy-webpack-plugin');
// npm install terser-webpack-plugin --save-dev
const TerserPlugin = require("terser-webpack-plugin");
// npm install css-minimizer-webpack-plugin --save-dev
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
//npm install image-minimizer-webpack-plugin --save-dev, npm install imagemin-gifsicle imagemin-jpegtran imagemin-optipng imagemin-svgo --save-dev - без потерь 
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
// svg
const { extendDefaultPlugins } = require("svgo");


// какой режим 
//npm i cross-env --save-dev
const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;

const filename = (ext) => isDev ? `[name].${ext}` : `[name].[contenthash].${ext}`;

const optimization = () => {
    const configObj = {
      splitChunks: {
        chunks: 'all'
      }
    };
  
    if (isProd) {
      configObj.minimizer = [
        new CssMinimizerPlugin(),
        new TerserPlugin()
      ];
    }
  
    return configObj;
  };

  const plugins = () => {
      const basePlugins = [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'src/index.html'),
            filename: 'index.html',
            minify: {
              collapseWhitespace: isProd
            }
        }),
        new CssMinimizerPlugin(), 
        new TerserPlugin(),
        new MiniCssExtractPlugin({
        filename: `./css/${filename('css')}`
        }),
        new CopyWebpackPlugin({
            patterns: [
            {from: path.resolve(__dirname, 'src/assets') , 
            to: path.resolve(__dirname, 'dist')}
            ]
        }),  
      ];

      if(isProd) {
          basePlugins.push (
            new ImageMinimizerPlugin({
                minimizerOptions: {
                  // Lossless optimization with custom option
                  // Feel free to experiment with options for better result for you
                  plugins: [
                    ["gifsicle", { interlaced: true }],
                    ["jpegtran", { progressive: true }],
                    ["optipng", { optimizationLevel: 5 }],
                    // Svgo configuration here https://github.com/svg/svgo#configuration
                    [
                      "svgo",
                      {
                        plugins: extendDefaultPlugins([
                          {
                            name: "removeViewBox",
                            active: false,
                          },
                          {
                            name: "addAttributesToSVGElement",
                            params: {
                              attributes: [{ xmlns: "http://www.w3.org/2000/svg" }],
                            },
                          },
                        ]),
                      },
                    ],
                  ],
                },
              }),
          )
      }

      return basePlugins;
  }

module.exports = {
    context: path.resolve(__dirname, 'src'),
    entry: './index.js',
    mode: 'development',
    devtool: isProd ? false : 'source-map', // изпользуем в dev
    //npm install webpack-dev-server --save-dev
    devServer: {
        /** Будет запускать сервер на localhost:8080 в этой папке*/
        historyApiFallback: true,
        static: {
            directory: path.join(__dirname, 'dist'),
          },
        open: true,
        compress: true,
        hot: true,
        port: 8080,
        allowedHosts: 'all',
    },
    output: {
        filename: `./js/${filename('js')}`, // динамичное и уникальное имя файла  для production hash, для dev ...js
        path: path.resolve(__dirname, 'dist'),
        clean: true, // для очистки папки dist при новом билде
        assetModuleFilename: 'img/[name][ext]',
    },
    plugins: plugins(),
    
    module: {
        rules: [
            /** Babel **/
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
                // npm install babel-loader @babel/core @babel/preset-env -D
            },
            /**html **/
            {
                test: /\.html$/,
                loader: 'html-loader',
         
                // npm install --save-dev html-loader
              },


            /** CSS */
            {
                test: /\.css$/i,
                use: [
                  {
                    loader: MiniCssExtractPlugin.loader,
                    options: {
                      hmr: isDev
                    },
                  },
                  'css-loader'
                ],
                // npm i style-loader css-loader -D
            },
            
            /** SCSS/SAAS */
            {
                test: /\.s[ac]ss$/,
                use: [
                  {
                    loader: MiniCssExtractPlugin.loader,
                    // options: {
                    //   publicPath: (resourcePath, context) => {
                    //     return path.relative(path.dirname(resourcePath), context) + '/';
                    //   },
                    // }
                  },
                  'css-loader',
                  'sass-loader'
                ],
                // npm i style-loader css-loader sass sass-loader -D  npm install node-sass
            },
            /** Картинки */
            {
                test: /\.(png|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
                generator: {
					filename: 'img/[name][ext]',
				},
            },
            {
				test: /\.svg$/,
				type: 'asset/resource',
				generator: {
					filename: 'svg/[name][ext]',
				},
			},
            /** Шрифты */
            {
                test: /\.(woff(2)?|eot|ttf|otf)$/,
				type: 'asset/resource',
				generator: {
					filename: 'fonts/[name][ext]',
				},
            },
            /** Файлы CSV */
            {
                test: /\.(csv|tsv)$/i,
                use: ['csv-loader'],
                // npm i csv-loader -D
            },
            /** Файлы XML */
            {
                test: /\.xml$/i,
                use: ['xml-loader'],
                // npm i xml-loader -D 
            },
        ],
    },

    optimization: optimization()
  
};