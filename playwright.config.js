import path from 'path';

module.exports = {
  projects: [
    {
      name: 'e2e', // Project for E2E tests
      testDir: './tests/e2e', // Points to the e2e folder
      use: {
        browserName: 'chromium', // Can be configured to use chromium for unit tests
        headless: false,
        args: [
          `--disable-extensions-except=${path.resolve(__dirname)}`,
          `--load-extension=${path.resolve(__dirname)}`,
        ],
      },
    },
    {
      name: 'performance', // Project for performance tests
      testDir: './tests/performance', // Points to the performance folder
      use: {
        browserName: 'chromium',
        headless: false, // We need a visible browser for E2E tests
        args: [
          `--disable-extensions-except=${path.resolve(__dirname)}`,
          `--load-extension=${path.resolve(__dirname)}`,
        ],
      },
    },
  ],
};
