// This is the service to interact with the IndexedDB
export class StorageService {

  constructor(dbName = 'AppStorage', storeName = 'keyValueStore') {
    this.dbName = dbName;
    this.storeName = storeName;
    this.db = null;
  }

  async openDatabase() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve(this.db);
        return;
      }

      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        reject(new Error(`IndexedDB error: ${event.target.error}`));
      };
    });
  }

  async get(key, defaultValue = null) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDatabase();
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(key);

        request.onsuccess = (event) => {
          const result = event.target.result;
          resolve(result !== undefined ? result : defaultValue);
        };

        request.onerror = (event) => {
          reject(new Error(`Failed to get data: ${event.target.error}`));
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  async set(key, value) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDatabase();
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.put(value, key);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = (event) => {
          reject(new Error(`Failed to save data: ${event.target.error}`));
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  async delete(key) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDatabase();
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.delete(key);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = (event) => {
          reject(new Error(`Failed to delete data: ${event.target.error}`));
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  async clear() {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDatabase();
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.clear();

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = (event) => {
          reject(new Error(`Failed to clear store: ${event.target.error}`));
        };
      } catch (error) {
        reject(error);
      }
    });
  }
}
