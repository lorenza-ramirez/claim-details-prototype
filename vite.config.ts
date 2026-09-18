import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Bind IPv4 explicitly: browsers resolve localhost to 127.0.0.1, and the
    // default binding can end up IPv6-only (::1), which refuses those requests.
    host: '127.0.0.1',
    watch: {
      usePolling: true,
    },
  },
})
