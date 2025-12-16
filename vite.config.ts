
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  console.log('Current ENV:', env);
  return {
    base: './', // Ensures assets are loaded correctly on static hosts
    plugins: [react()],
    server: {
      port: 3000, // Keep port 3000 to avoid EACCES permission issues
      proxy: {
        '/api': {
          target: 'https://cbgknowledgehubmvp.gernas.bankfab.com',
          changeOrigin: true,
          secure: false,
          ws: true,
          configure: (proxy, options) => {
            proxy.on('error', (err) => {
              console.log('Proxy error:', err);
            });
            proxy.on('proxyReq', (_proxyReq, req) => {
              console.log('Proxying API:', req.method, req.url);
            });
          },
        },
        '/azure-blob': {
          target: 'https://auranpunawlsa.blob.core.windows.net',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/azure-blob/, ''),
          configure: (proxy, options) => {
             proxy.on('proxyReq', (_proxyReq, req) => {
              console.log('Proxying Azure Blob:', req.method, req.url);
            });
          }
        }
      },
    },
    define: {
      // This ensures process.env.API_KEY is replaced with the actual value (or undefined) during build
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});
