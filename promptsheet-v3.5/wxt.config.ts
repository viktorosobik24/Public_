import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'PromptSheet',
    permissions: ['sidePanel', 'storage', 'clipboardWrite'],
    side_panel: {
      default_path: 'sidepanel.html',
    },
    action: {
      default_icon: 'icon/48.png',
    },
    icons: {
      '16': 'icon/16.png',
      '32': 'icon/32.png',
      '48': 'icon/48.png',
      '96': 'icon/96.png',
      '128': 'icon/128.png',
    },
  },
});
