先增加依赖

```bash
// npm
$ npm install --save-dev webpack-bundle-analyzer

// or yarn
$ yarn add webpack-bundle-analyzer -D
```

配置文件 `vue.config.js` 增加 `configureWebpack.plugins` 参数

```
const path = require('path')
const webpack = require('webpack')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

function resolve (dir) {
  return path.join(__dirname, dir)
}

// vue.config.js
module.exports = {
  configureWebpack: {
    plugins: [
      // Ignore all locale files of moment.js
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      // 依赖大小分析工具
      new BundleAnalyzerPlugin(),
    ]
  },
  //配置端口和接口本地代理
  
  ...
}
```



启动 `cli` 的 `build` 命令进行项目编译，编译完成时，会自动运行一个 http://localhost:2365 的地址，完整显示了支持库依赖
