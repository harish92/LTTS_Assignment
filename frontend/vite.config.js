import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react', 'react-dom', '@mui/material', '@mui/x-data-grid', '@emotion/react', '@emotion/styled'],
  },
})
