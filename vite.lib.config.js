import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  publicDir: false,
  build: {
    lib: {
      entry: resolve(__dirname, 'src/binary-effect.js'),
      name: 'BinaryEffect',
      fileName: 'binary-effect',
    },
  }
});
