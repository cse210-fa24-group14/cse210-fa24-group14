import { test, expect } from '../../playwright/fixtures';

test.describe('Chrome Extension E2E Test', () => {
  test('should save display and delete notes in the popup', async ({
    context,
    extensionId,
  }) => {
    const popupUrl = `chrome-extension://${extensionId}/src/entry.html`;

    // Open the extension popup
    const page = await context.newPage();
    await page.goto(popupUrl);

    // If there are no notes, should display no notes message
    const noNotesMessage = await page.$eval('.empty-state', (el) =>
      el.textContent.trim(),
    );
    expect(noNotesMessage).toBe('No notes yet. Add your first note!');

    // Input a new note
    const testNote = 'E2E Test Note';
    await page.fill('#noteInput', testNote);

    // Click the save button
    await page.click('#saveBtn');

    // Verify the note appears in the UI
    const displayedNotes = await page.$$eval('.note-item span', (items) =>
      items.map((item) => item.textContent.trim()),
    );
    expect(displayedNotes).toContain(testNote);

    // Verify the note is saved in Chrome's storage
    const storedNotes = await page.evaluate(() => {
      return new Promise((resolve) => {
        chrome.storage.sync.get('notes', (data) => resolve(data.notes));
      });
    });
    expect(storedNotes[0].content).toBe(testNote);

    // Delete the note
    await page.click('.note-item button');

    // Verify the note is removed from UI
    const updatedDisplayedNotes = await page.$$eval(
      '.note-item span',
      (items) => items.map((item) => item.textContent.trim()),
    );
    expect(updatedDisplayedNotes).not.toContain(testNote);

    // Verify the note is removed from storage
    const updatedStoredNotes = await page.evaluate(() => {
      return new Promise((resolve) => {
        chrome.storage.sync.get('notes', (data) => resolve(data.notes));
      });
    });
    expect(updatedStoredNotes).toHaveLength(0);
  });
});
