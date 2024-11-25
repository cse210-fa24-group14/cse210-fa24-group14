// This is the service to interact with the Chrome storage
// We can switch this service to IndexedDBService if we want to use IndexedDB instead of Chrome storage
export class StorageService {
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
