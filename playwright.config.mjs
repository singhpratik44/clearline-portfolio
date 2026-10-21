import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'./tests',use:{baseURL:'http://127.0.0.1:8765',browserName:'chromium'},webServer:{command:'python3 -m http.server 8765',url:'http://127.0.0.1:8765',reuseExistingServer:!process.env.CI},reporter:'list'});
