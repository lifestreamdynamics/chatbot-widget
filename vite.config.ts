import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.tsx'),
      name: 'LifestreamChatbot',
      formats: ['umd', 'es', 'iife'],
      fileName: (format) => `lifestream-chatbot.${format}.js`
    },
    rollupOptions: {
      external: [],
      output: {
        assetFileNames: 'lifestream-chatbot.[ext]',
        globals: {}
      }
    },
    cssCodeSplit: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    sourcemap: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});
