import ext from "./ext";

// Enhanced cross-browser storage with fallbacks
function getStorage() {
  // Try sync storage first, fallback to local storage
  if (ext.storage && ext.storage.sync) {
    return ext.storage.sync;
  } else if (ext.storage && ext.storage.local) {
    return ext.storage.local;
  } else {
    // Fallback to localStorage-based implementation
    return {
      get: function(keys, callback) {
        const result = {};
        if (typeof keys === 'string') {
          keys = [keys];
        }
        if (Array.isArray(keys)) {
          keys.forEach(key => {
            const value = localStorage.getItem(`kan_${key}`);
            result[key] = value ? JSON.parse(value) : null;
          });
        } else if (typeof keys === 'object') {
          Object.keys(keys).forEach(key => {
            const value = localStorage.getItem(`kan_${key}`);
            result[key] = value ? JSON.parse(value) : keys[key];
          });
        }
        if (callback) callback(result);
        return Promise.resolve(result);
      },
      set: function(items, callback) {
        Object.keys(items).forEach(key => {
          localStorage.setItem(`kan_${key}`, JSON.stringify(items[key]));
        });
        if (callback) callback();
        return Promise.resolve();
      },
      remove: function(keys, callback) {
        if (typeof keys === 'string') {
          keys = [keys];
        }
        keys.forEach(key => {
          localStorage.removeItem(`kan_${key}`);
        });
        if (callback) callback();
        return Promise.resolve();
      }
    };
  }
}

// Cross-browser storage detection and setup
const storage = getStorage();

// Add browser detection for storage capabilities
storage.capabilities = {
  hasExtensionStorage: !!(ext.storage && (ext.storage.sync || ext.storage.local)),
  hasLocalStorage: typeof localStorage !== 'undefined',
  browser: ext.getBrowser ? ext.getBrowser() : 'unknown',
  manifestVersion: ext.getManifestVersion ? ext.getManifestVersion() : 2
};

module.exports = storage;