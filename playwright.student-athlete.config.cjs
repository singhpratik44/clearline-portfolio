const { defineConfig } = require('@playwright/test');
module.exports=defineConfig({
  testDir:'./tests',
  timeout:20000,
  retries:1,
  use:{
    browserName:'chromium',
    viewport:process.env.DEVICE==='mobile'?{width:390,height:844}:{width:1280,height:800},
    isMobile:process.env.DEVICE==='mobile',
    hasTouch:process.env.DEVICE==='mobile',
    screenshot:'only-on-failure',
    trace:'retain-on-failure'
  }
});
