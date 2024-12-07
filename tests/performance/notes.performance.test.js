import { test, expect } from '../../playwright/fixtures';

test.describe('Notes Performance Tests', () => {
  test('should load notes list within acceptable time', async ({
    context,
    extensionId,
  }) => {
    const popupUrl = `chrome-extension://${extensionId}/src/entry.html`;
    const extensionPage = await context.newPage();

    // Measure page load time
    const startTime = Date.now();
    await extensionPage.goto(popupUrl);
    await extensionPage.waitForSelector('.cell-container');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(1000); // Should load under 1 second
  });

  test('should handle large number of notes efficiently', async ({
    context,
    extensionId,
  }) => {
    // Test with large datasets
    const popupUrl = `chrome-extension://${extensionId}/src/entry.html`;
    const extensionPage = await context.newPage();
    await extensionPage.goto(popupUrl);

    // Measure time to add multiple cells
    const startTime = Date.now();
    for (let i = 0; i < 50; i++) {
      await extensionPage.click('.new-cell-buttons.markdown');
    }
    const addTime = Date.now() - startTime;

    expect(addTime).toBeLessThan(5000); // Should add 50 cells under 5 seconds
  });
});
