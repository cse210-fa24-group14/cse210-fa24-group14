import { test, expect } from '../../playwright/fixtures';

test.describe('Notes App E2E Test with URL-specific Notes', () => {
  test('should save notes specific to a URL and persist data correctly', async ({
    context,
    extensionId,
  }) => {
    const popupUrl = `chrome-extension://${extensionId}/src/entry.html`;

    // Open Google and the extension popup
    const googlePage = await context.newPage();
    await googlePage.goto('https://www.google.com');
    const extensionPage = await context.newPage();
    await extensionPage.goto(popupUrl);

    // Verify the app initializes with a default cell
    await extensionPage.waitForSelector('.cell-container .cell', {
      timeout: 1000,
    });
    let initialCells = await extensionPage.$$eval(
      '.cell-container .cell',
      (cells) => cells.length,
    );
    expect(initialCells).toBe(1); // Default cell exists

    // Add a note to Google URL
    const googleNoteContent = 'Google-specific note';
    await extensionPage.fill(
      '.cell-container .cell:nth-child(1) .cell-content textarea',
      googleNoteContent,
    );

    // Add another cell
    await extensionPage.hover('.add-new-buttons');
    await extensionPage.waitForSelector('.new-cell-buttons.markdown', {
      state: 'visible',
    });
    await extensionPage.click('.new-cell-buttons.markdown');

    // Reload Google and the extension
    await googlePage.reload();
    await extensionPage.reload();

    // Wait for saved notes to load
    await extensionPage.waitForSelector('.cell-container .cell-content', {
      timeout: 1000,
    });
    const googleNotes = await extensionPage.$$eval(
      '.cell-container .cell-content textarea',
      (textareas) => textareas.map((textarea) => textarea.value.trim()),
    );
    expect(googleNotes).toContain(googleNoteContent);

    // Open Bing and the extension
    const bingPage = await context.newPage();
    await bingPage.goto('https://www.bing.com');
    await extensionPage.reload();

    // Wait for the default cell on Bing
    await extensionPage.waitForSelector('.cell-container .cell-content', {
      timeout: 1000,
    });
    const bingNotes = await extensionPage.$$eval(
      '.cell-container .cell-content textarea',
      (textareas) => textareas.map((textarea) => textarea.value.trim()),
    );
    expect(bingNotes).toHaveLength(1);
    expect(bingNotes[0]).toBe('');

    // Go back to Google and verify notes
    await googlePage.bringToFront();

    // Reopen the extension popup for Google
    const googleExtensionPage = await context.newPage();
    await googleExtensionPage.goto(popupUrl);

    await googleExtensionPage.waitForSelector('.cell-container .cell-content', {
      timeout: 1000,
    });
    const googleNotesAgain = await googleExtensionPage.$$eval(
      '.cell-container .cell-content textarea',
      (textareas) => textareas.map((textarea) => textarea.value.trim()),
    );
    expect(googleNotesAgain).toContain(googleNoteContent);

    // Delete the Google note
    await googleExtensionPage.click(
      '.cell-container .cell:nth-child(1) .delete-btn',
    );

    // Wait for the note to be removed
    await googleExtensionPage.waitForFunction(() => {
      const textareas = document.querySelectorAll(
        '.cell-container .cell-content textarea',
      );
      return textareas.length === 1 && textareas[0].value.trim() === '';
    });

    // Reload and confirm deletion persists
    await googleExtensionPage.reload();
    const postDeleteCells = await googleExtensionPage.$$eval(
      '.cell-container .cell-content textarea',
      (textareas) => textareas.map((textarea) => textarea.value.trim()),
    );
    expect(postDeleteCells).toHaveLength(1);
    expect(postDeleteCells[0]).toBe('');
  });
});
