import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import svgr from 'vite-plugin-svgr'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  server: {
    host: true,
    watch: {
      usePolling: true,
      interval: 100 // 100ms để bắt kịp thay đổi
    }
  },
  resolve : {
    alias : [
      { find : '~', replacement: '/src' }
    ]
  }
})
