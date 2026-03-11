import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { auditPlugin } from './vite-plugin-audit'
import { createModuleEndpoint, repairModuleEndpoint } from './vite-plugin-creator'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    auditPlugin(),
    {
      name: 'vite-creator-plugin',
      configureServer(server) { createModuleEndpoint(server); repairModuleEndpoint(server); },
    },
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})

