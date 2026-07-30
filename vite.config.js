import { defineConfig } from 'vite';

export default defineConfig({
  // Serve from the src folder where index.html lives
  root: 'src',
  server: {
    open: true, // open browser automatically
    port: 5173,
  },
  build: {
    outDir: '../dist', // output one level up from src
    // Ensure assets are placed correctly
    assetsDir: 'assets',
  },
});
