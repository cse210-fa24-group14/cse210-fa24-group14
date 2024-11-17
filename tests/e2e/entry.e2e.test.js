import { test, expect } from '../../playwright/fixtures';

test.describe('Chrome Extension E2E Test', () => {
  test('should save and display notes in the popup', async ({
    context,
    extensionId,
  }) => {
    const popupUrl = `chrome-extension://${extensionId}/src/entry.html`;

    // Open the extension popup
    const page = await context.newPage();
    await page.goto(popupUrl);

    // Input a new note
    const testNote = 'E2E Test Note';
    await page.fill('#noteInput', testNote);

    // Click the save button
    await page.click('#saveBtn');

    // Verify the note appears in the UI
    const displayedNotes = await page.$$eval('#notesList li', (items) =>
      items.map((item) => item.textContent.trim()),
    );
    expect(displayedNotes).toContain(testNote + 'Delete');

    // Verify the note is saved in Chrome's storage
    const storedNotes = await page.evaluate(() => {
      return new Promise((resolve) => {
        chrome.storage.sync.get('notes', (data) => resolve(data.notes));
      });
    });
    expect(storedNotes).toContain(testNote);

    // Clean up (optional): Clear storage after the test
    await page.evaluate(() => {
      return new Promise((resolve) => {
        chrome.storage.sync.clear(() => resolve());
      });
    });

    // Verify the storage is cleared
    const clearedNotes = await page.evaluate(() => {
      return new Promise((resolve) => {
        chrome.storage.sync.get('notes', (data) => resolve(data.notes || []));
      });
    });
    expect(clearedNotes).toEqual([]);
  });
});
