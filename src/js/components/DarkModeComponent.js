export class DarkModeComponent {
  constructor() {
    /**
     * Reference to the document body for applying themes.
     * @type {HTMLElement}
     */
    this.body = document.body;

    /**
     * Reference to the dark mode toggle button.
     * @type {HTMLButtonElement|null}
     */
    this.darkModeBtn = null;
  }

  /**
   * Automatically syncs the theme with the system's preference.
   * Adds an event listener to respond to system theme changes.
   */
  initializeSystemTheme() {
    const applySystemTheme = () => {
      /**
       * Applies the current system theme to the body.
       */
      const systemPrefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches;
      this.body.classList.toggle('dark-mode', systemPrefersDark);
      console.log(
        `System theme applied: ${systemPrefersDark ? 'dark' : 'light'}`,
      );
    };

    // Apply the system theme on load
    applySystemTheme();

    // Listen for system preference changes
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', applySystemTheme);
  }

  /**
   * Adds a manual toggle button for dark mode within a specified container.
   * Ensures the button is created only once.
   *
   * @param {HTMLElement} container - The container element where the toggle button will be appended.
   */
  initializeManualThemeToggle(container) {
    if (this.darkModeBtn) {
      console.warn('Dark mode toggle button is already initialized.');
      return;
    }

    if (!container) {
      console.error('Container not found. Cannot initialize dark mode toggle.');
      return;
    }

    // Create the dark mode toggle button
    this.darkModeBtn = document.createElement('button');
    this.darkModeBtn.id = 'dark-mode-toggle'; // Use the ID for styling
    container.appendChild(this.darkModeBtn);

    /**
     * Updates the button icon based on the current theme.
     */
    const setButtonIcon = () => {
      this.darkModeBtn.innerHTML = this.body.classList.contains('dark-mode')
        ? '☀️' // Sun icon for light mode
        : '🌙'; // Moon icon for dark mode
    };

    // Initial icon setup
    setButtonIcon();

    // Add click event listener for manual theme toggle
    this.darkModeBtn.addEventListener('click', () => {
      const isDark = this.body.classList.toggle('dark-mode');
      setButtonIcon();
      console.log(`Manual theme change: ${isDark ? 'dark' : 'light'}`);
    });

    /**
     * Updates the body and button icon when the system theme changes.
     *
     * @param {MediaQueryListEvent} event - The event fired when the system theme changes.
     */
    const systemThemeListener = (event) => {
      const systemPrefersDark = event.matches;
      if (!this.body.classList.contains('dark-mode') && systemPrefersDark) {
        this.body.classList.add('dark-mode');
      } else if (
        this.body.classList.contains('dark-mode') &&
        !systemPrefersDark
      ) {
        this.body.classList.remove('dark-mode');
      }
      setButtonIcon(); // Update the icon when the system theme changes
    };

    const systemDarkModeQuery = window.matchMedia(
      '(prefers-color-scheme: dark)',
    );
    systemDarkModeQuery.addEventListener('change', systemThemeListener);
  }
}
