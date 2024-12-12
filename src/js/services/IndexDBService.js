/**
 * Service class for interacting with IndexedDB. Using IndexDB to get more storage
 */
export class IndexedDBService {
  constructor(dbName = 'AppStorage', storeName = 'keyValueStore') {
    this.dbName = dbName;
    this.storeName = storeName;
    this.db = null;
  }

  /**
   * Opens the IndexedDB database
   * @returns {Promise<IDBDatabase>} A promise that resolves with the database instance
   */
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

  /**
   * Retrieves a value from the database
   * @param {string} key - The key of the value to retrieve
   * @param {*} [defaultValue=null] - The default value to return if the key is not found
   * @returns {Promise<*>} A promise that resolves with the retrieved value or the default value
   */
  async get(key, defaultValue = null) {
    return new Promise((resolve, reject) => {
      this.openDatabase()
        .then((db) => {
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
        })
        .catch(reject);
    });
  }

  /**
   * Sets a value in the database
   * @param {string} key - The key under which to store the value
   * @param {*} value - The value to store
   * @returns {Promise<void>} A promise that resolves when the value is set
   */
  async set(key, value) {
    return new Promise((resolve, reject) => {
      this.openDatabase()
        .then((db) => {
          const transaction = db.transaction([this.storeName], 'readwrite');
          const store = transaction.objectStore(this.storeName);
          const request = store.put(value, key);

          request.onsuccess = () => {
            resolve();
          };

          request.onerror = (event) => {
            reject(new Error(`Failed to save data: ${event.target.error}`));
          };
        })
        .catch(reject);
    });
  }

  /**
   * Deletes a value from the database
   * @param {string} key - The key of the value to delete
   * @returns {Promise<void>} A promise that resolves when the value is deleted
   */
  async delete(key) {
    return new Promise((resolve, reject) => {
      this.openDatabase()
        .then((db) => {
          const transaction = db.transaction([this.storeName], 'readwrite');
          const store = transaction.objectStore(this.storeName);
          const request = store.delete(key);

          request.onsuccess = () => {
            resolve();
          };

          request.onerror = (event) => {
            reject(new Error(`Failed to delete data: ${event.target.error}`));
          };
        })
        .catch(reject);
    });
  }

  /**
   * Clears all data from the object store
   * @returns {Promise<void>} A promise that resolves when the store is cleared
   */
  async clear() {
    return new Promise((resolve, reject) => {
      this.openDatabase()
        .then((db) => {
          const transaction = db.transaction([this.storeName], 'readwrite');
          const store = transaction.objectStore(this.storeName);
          const request = store.clear();

          request.onsuccess = () => {
            resolve();
          };

          request.onerror = (event) => {
            reject(new Error(`Failed to clear store: ${event.target.error}`));
          };
        })
        .catch(reject);
    });
  }
}

