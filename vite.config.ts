import { defineConfig } from 'vite';
import { peerDependencies } from './package.json';
import react from '@vitejs/plugin-react-swc';
import dts from 'vite-plugin-dts';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, './src/index.ts'),
      name: 'react-persistent-tabs',
      fileName: 'react-persistent-tabs'
    },
    rollupOptions: {
      // Exclude all peer dependencies from being bundled
      external: [...Object.keys(peerDependencies)],
      output: {
        globals: {
          nanoid: 'nanoid',
          react: 'react',
          'react-dom': 'react-dom'
        }
      }
    }
  },
  plugins: [
    react(),
    dts({
      rollupTypes: true,
      tsconfigPath: './tsconfig.app.json'
    })
  ]
});

