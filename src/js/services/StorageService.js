// This is the service to interact with the Chrome storage
// We can switch this service to IndexedDBService if we want to use IndexedDB instead of Chrome storage
export class StorageService {
  /**
   * Retrieves a value from Chrome storage.
   *
   * @param {string} key - The key to retrieve the value for.
   * @param {*} [defaultValue=null] - The default value to return if the key does not exist.
   * @returns {Promise<*>} A promise that resolves with the retrieved value or the default value.
   * @throws {Error} If there is an error accessing Chrome storage.
   */
  async get(key, defaultValue = null) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get({ [key]: defaultValue }, (data) => {
        if (chrome.runtime.lastError) {
          reject(
            new Error(
              `Failed to get data: ${chrome.runtime.lastError.message}`,
            ),
          );
          return;
        }
        resolve(data[key]);
      });
    });
  }

  /**
   * Stores a key-value pair in Chrome storage.
   *
   * @param {string} key - The key to store the value under.
   * @param {*} value - The value to store.
   * @returns {Promise<void>} A promise that resolves when the value is successfully stored.
   * @throws {Error} If there is an error saving to Chrome storage.
   */
  async set(key, value) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set({ [key]: value }, () => {
        if (chrome.runtime.lastError) {
          reject(
            new Error(
              `Failed to save data: ${chrome.runtime.lastError.message}`,
            ),
          );
          return;
        }
        resolve();
      });
    });
  }
}
