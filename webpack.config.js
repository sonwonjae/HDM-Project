const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // entry file
  // https://webpack.js.org/configuration/entry-context/#entry
  entry: {
    app: './src/js/app.js',
    home: './src/js/home.js',
    setting: './src/js/setting',
    interview: './src/js/interview.js',
    report: './src/js/report.js',
  },
  // 번들링된 js 파일의 이름(filename)과 저장될 경로(path)를 지정
  // https://webpack.js.org/configuration/output/#outputpath
  // https://webpack.js.org/configuration/output/#outputfilename
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'js/[name].bundle.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/template/index.html',
      chunks: ['app', 'home'],
    }),
    new HtmlWebpackPlugin({
      filename: 'setting.html',
      template: 'src/template/setting.html',
      chunks: ['app', 'setting'],
    }),
    new HtmlWebpackPlugin({
      filename: 'interview.html',
      template: 'src/template/interview.html',
      chunks: ['app', 'interview'],
    }),
    new HtmlWebpackPlugin({
      filename: 'report.html',
      template: 'src/template/report.html',
      chunks: ['app', 'report'],
    }),
    new MiniCssExtractPlugin({ filename: 'css/style.css' }),
  ],
  // https://webpack.js.org/configuration/module
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [path.resolve(__dirname, 'src/js')],
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              [
                '@babel/plugin-transform-runtime',
                {
                  // https://babeljs.io/docs/en/babel-plugin-transform-runtime#corejs
                  corejs: 3,
                  proposals: true,
                },
              ],
            ],
          },
        },
      },
      {
        test: /\.s[ac]ss$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
        exclude: /node_modules/,
      },
    ],
  },
  devServer: {
    // https://webpack.js.org/configuration/dev-server/#devserverstatic
    static: {
      // https://webpack.js.org/configuration/dev-server/#directory
      directory: path.join(__dirname, 'public'), //
    },
    // https://webpack.js.org/configuration/dev-server/#devserveropen
    open: true,
    // https://webpack.js.org/configuration/dev-server/#devserverport
    port: 'auto',
    proxy: [
      {
        context: '/news',
        target: 'http://localhost:3000/',
      },
      {
        context: '/mockInterview',
        target: 'http://localhost:3000/',
      },
      {
        context: '/questionList',
        target: 'http://localhost:3000/',
      },
      {
        context: '/userInfo/update',
        target: 'http://localhost:3000/',
      },
      {
        context: '/userInfo',
        target: 'http://localhost:3000/',
      },
    ],
  },
  // 소스 맵(Source Map)은 디버깅을 위해 번들링된 파일과 번들링되기 이전의 소스 파일을 연결해주는 파일이다.
  // 디버깅용이기 때문에 개발할 때만 필요하고 배포할 땐 필요가 없다.
  devtool: 'source-map',
  // https://webpack.js.org/configuration/mode
  mode: 'development',
};
