const path = require('path')

module.exports = {
  lintOnSave: false,
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        productName: 'LEV录屏',
        appId: 'com.example.app',
        mac: {
          // 应用程序图标
          icon: './public/mac.png'
        },
        win: {
          icon: './public//win.png'
        }
      }
    },
    'style-resources-loader': {
      preProcessor: 'less',
      patterns: [
        // 全局变量路径
        path.resolve(__dirname, './src/assets/styles/variables.less')
      ]
    }
  }

}
