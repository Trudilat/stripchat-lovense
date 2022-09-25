const { defineConfig } = require('@vue/cli-service')
module.exports = {
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        productName: "Stripchat Lovense integration",
        appId: 'LovenseStripchat',
        win: {
          "target": [
            "nsis"
          ],
          icon: 'public/icon.png',
        },
        "nsis": {
          "installerIcon": "public/favicon.ico",
          "uninstallerIcon": "public/favicon.ico",
          "uninstallDisplayName": "Stripchat Lovense integration",
          "license": "public/license.txt",
          "oneClick": false,
          "allowToChangeInstallationDirectory": true
        }
      },
    },
  },
}
