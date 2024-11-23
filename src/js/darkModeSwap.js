/**
 * Automatically syncs the theme with the system's preference.
 */
export function initializeSystemTheme() {
  const body = document.body;

  // Function to apply the system theme
  const applySystemTheme = () => {
    const systemPrefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches;
    body.classList.toggle('dark-mode', systemPrefersDark);
    console.log(
      `System theme applied: ${systemPrefersDark ? 'dark' : 'light'}`,
    );
  };

  applySystemTheme();

  // Listen for system preference changes
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', applySystemTheme);
}

/**
 * Add a manual toggle button for dark mode.
 */
export function initializeManualThemeToggle() {
  const body = document.body;
  const container = document.querySelector('.container');

  // Create the dark mode toggle button
  const darkModeBtn = document.createElement('button');
  darkModeBtn.id = 'darkModeToggle'; // modify it in css with style
  container.appendChild(darkModeBtn);

  darkModeBtn.textContent = body.classList.contains('dark-mode')
    ? 'Disable Dark Mode'
    : 'Enable Dark Mode';

  // Add click event listener to toggle dark mode
  darkModeBtn.addEventListener('click', () => {
    const isDark = body.classList.toggle('dark-mode');
    darkModeBtn.textContent = isDark ? 'Disable Dark Mode' : 'Enable Dark Mode';
    console.log(`Manual theme change: ${isDark ? 'dark' : 'light'}`);
  });
}
