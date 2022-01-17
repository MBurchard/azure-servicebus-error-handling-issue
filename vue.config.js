const { defineConfig } = require('@vue/cli-service');
module.exports = defineConfig({
  pluginOptions: {
    electronBuilder: {
      mainProcessFile: 'src/electron/main.ts',
      rendererProcessFile: 'src/vue/main.ts',
    },
  },
  transpileDependencies: true,
});
