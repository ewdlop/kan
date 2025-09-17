// Browser compatibility polyfills for Kan extension
// Handles differences between Chrome, Firefox, Edge, Opera, and Safari

(function() {
  'use strict';

  // Detect browser environment
  const isChrome = typeof chrome !== 'undefined' && !!chrome.runtime;
  const isFirefox = typeof browser !== 'undefined' && !!browser.runtime;
  const isEdge = isChrome && navigator.userAgent.includes('Edg');
  const isOpera = isChrome && navigator.userAgent.includes('OPR');
  const isSafari = typeof safari !== 'undefined' && typeof safari.extension !== 'undefined';

  // Get the appropriate extension API
  const extensionAPI = isFirefox ? browser : (isChrome ? chrome : null);

  // Polyfill for Promise-based APIs in Chrome/Edge
  if (isChrome && !isFirefox) {
    // Chrome uses callbacks, so we need to promisify some APIs
    if (extensionAPI && extensionAPI.storage) {
      const originalGet = extensionAPI.storage.local.get;
      const originalSet = extensionAPI.storage.local.set;
      
      extensionAPI.storage.local.getAsync = function(keys) {
        return new Promise((resolve, reject) => {
          originalGet.call(this, keys, (result) => {
            if (extensionAPI.runtime.lastError) {
              reject(extensionAPI.runtime.lastError);
            } else {
              resolve(result);
            }
          });
        });
      };

      extensionAPI.storage.local.setAsync = function(items) {
        return new Promise((resolve, reject) => {
          originalSet.call(this, items, () => {
            if (extensionAPI.runtime.lastError) {
              reject(extensionAPI.runtime.lastError);
            } else {
              resolve();
            }
          });
        });
      };
    }
  }

  // Firefox-specific polyfills
  if (isFirefox) {
    // Firefox already has promise-based APIs, so we're good
    // But we might need to handle some Firefox-specific quirks
    if (extensionAPI && extensionAPI.storage) {
      extensionAPI.storage.local.getAsync = extensionAPI.storage.local.get;
      extensionAPI.storage.local.setAsync = extensionAPI.storage.local.set;
    }
  }

  // Safari-specific polyfills
  if (isSafari) {
    // Safari extension API is quite different
    // We'll need to create a bridge to make it compatible
    window.chrome = window.chrome || {};
    window.chrome.runtime = window.chrome.runtime || {
      sendMessage: function(message, callback) {
        // Safari message passing is different
        if (callback) callback();
      }
    };
    
    window.chrome.storage = window.chrome.storage || {
      local: {
        get: function(keys, callback) {
          // Safari storage implementation
          const result = {};
          if (callback) callback(result);
        },
        set: function(items, callback) {
          // Safari storage implementation
          if (callback) callback();
        }
      }
    };
  }

  // Edge-specific adjustments
  if (isEdge) {
    // Edge is mostly Chrome-compatible but might have some quirks
    // Add any Edge-specific fixes here
  }

  // Opera-specific adjustments
  if (isOpera) {
    // Opera is Chrome-compatible
    // Add any Opera-specific fixes here if needed
  }

  // Global browser detection
  window.KanBrowser = {
    isChrome: isChrome && !isEdge && !isOpera,
    isFirefox: isFirefox,
    isEdge: isEdge,
    isOpera: isOpera,
    isSafari: isSafari,
    name: isFirefox ? 'firefox' : 
          isEdge ? 'edge' : 
          isOpera ? 'opera' : 
          isSafari ? 'safari' : 
          isChrome ? 'chrome' : 'unknown'
  };

  // Make extension API globally available with consistent interface
  window.KanExtensionAPI = extensionAPI;

})();