import { test, expect } from '../../playwright/fixtures';

test.describe('displayNotes Functionality', () => {
  test('should display notes correctly from chrome storage', async ({
    context,
    extensionId,
  }) => {
    const popupUrl = `chrome-extension://${extensionId}/src/entry.html`;

    // Open the extension popup
    const page = await context.newPage();
    await page.goto(popupUrl);

    // Add a note directly to Chrome storage
    const testNote = 'Note for Display Test';
    await page.evaluate((note) => {
      chrome.storage.sync.set({ notes: [note] });
    }, testNote);

    // Reload the popup to trigger `displayNotes`
    await page.reload();

    // Check if the note is displayed in the UI
    const displayedNote = await page.$$eval(
      '#notesList li',
      (items) => {
        return items.map((item) => item.textContent);
      }, //text content will contain 'Delete' as well
    );

    expect(displayedNote).toContain(testNote + 'Delete');
  });
});
