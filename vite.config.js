import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  base: "/binary-effect/",
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'src/binary-effect.js'),
      name: 'BinaryEffect',
      // the proper extensions will be added
      fileName: 'binary-effect',
    }
  }
})