import { test, expect } from '../../playwright/fixtures';

test.describe('saveNotes Functionality', () => {
  test('should save a new note and display it', async ({
    context,
    extensionId,
  }) => {
    const popupUrl = `chrome-extension://${extensionId}/src/entry.html`;

    // Open the extension popup
    const page = await context.newPage();
    await page.goto(popupUrl);

    // Input a new note in the text box
    const newNote = 'New Note for Save Test';
    await page.fill('#noteInput', newNote);

    // Click the save button
    await page.click('#saveBtn');

    // Verify the note is displayed in the list
    const displayedNotes = await page.$$eval('#notesList li', (items) =>
      items.map((item) => item.textContent),
    );
    expect(displayedNotes).toContain(newNote + 'Delete'); //text content will contain 'Delete' as well

    // Verify the note is saved in Chrome storage
    const storedNotes = await page.evaluate(() => {
      return new Promise((resolve) => {
        chrome.storage.sync.get('notes', (data) => resolve(data.notes));
      });
    });
    expect(storedNotes).toContain(newNote);
  });
});
