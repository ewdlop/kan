const apis = [
  'alarms',
  'bookmarks',
  'browserAction',
  'commands',
  'contextMenus',
  'cookies',
  'downloads',
  'events',
  'extension',
  'extensionTypes',
  'history',
  'i18n',
  'idle',
  'notifications',
  'pageAction',
  'runtime',
  'storage',
  'tabs',
  'webNavigation',
  'webRequest',
  'windows',
]

function Extension () {
  const _this = this

  // Detect browser environment
  this.isChrome = typeof chrome !== 'undefined' && !!chrome.runtime
  this.isFirefox = typeof browser !== 'undefined' && !!browser.runtime
  this.isEdge = typeof chrome !== 'undefined' && !!chrome.runtime && navigator.userAgent.includes('Edg')
  this.isOpera = typeof chrome !== 'undefined' && !!chrome.runtime && navigator.userAgent.includes('OPR')
  this.isSafari = typeof safari !== 'undefined' && typeof safari.extension !== 'undefined'

  // Use the appropriate API namespace
  const extensionAPI = this.isFirefox ? browser : (typeof chrome !== 'undefined' ? chrome : null)

  apis.forEach(function (api) {
    _this[api] = null

    try {
      // Try chrome namespace first (Chrome, Edge, Opera)
      if (typeof chrome !== 'undefined' && chrome[api]) {
        _this[api] = chrome[api]
      }
    } catch (e) {}

    try {
      // Try browser namespace (Firefox, newer extensions)
      if (typeof browser !== 'undefined' && browser[api]) {
        _this[api] = browser[api]
      }
    } catch (e) {}

    try {
      // Try window namespace as fallback
      if (window[api]) {
        _this[api] = window[api]
      }
    } catch (e) {}

    try {
      // Try nested extension API
      if (extensionAPI && extensionAPI.extension && extensionAPI.extension[api]) {
        _this[api] = extensionAPI.extension[api]
      }
    } catch (e) {}
  })

  // Ensure critical APIs are available
  try {
    if (extensionAPI && extensionAPI.runtime) {
      this.runtime = extensionAPI.runtime
    }
  } catch (e) {}

  try {
    if (extensionAPI && extensionAPI.browserAction) {
      this.browserAction = extensionAPI.browserAction
    } else if (extensionAPI && extensionAPI.action) {
      // Manifest V3 compatibility
      this.browserAction = extensionAPI.action
    }
  } catch (e) {}

  try {
    if (extensionAPI && extensionAPI.storage) {
      this.storage = extensionAPI.storage
    }
  } catch (e) {}

  // Add polyfills for missing APIs
  this.polyfillMissingAPIs()
}

Extension.prototype.polyfillMissingAPIs = function() {
  // Polyfill for browsers that don't have certain APIs
  if (!this.storage) {
    this.storage = {
      local: {
        get: function(keys, callback) {
          const result = {}
          if (typeof keys === 'string') {
            keys = [keys]
          }
          if (Array.isArray(keys)) {
            keys.forEach(key => {
              result[key] = localStorage.getItem(key)
            })
          }
          callback(result)
        },
        set: function(items, callback) {
          Object.keys(items).forEach(key => {
            localStorage.setItem(key, items[key])
          })
          if (callback) callback()
        }
      }
    }
  }

  // Add browser detection helper methods
  this.getBrowser = function() {
    if (this.isFirefox) return 'firefox'
    if (this.isEdge) return 'edge'
    if (this.isOpera) return 'opera'
    if (this.isChrome) return 'chrome'
    if (this.isSafari) return 'safari'
    return 'unknown'
  }

  // Add manifest version detection
  this.getManifestVersion = function() {
    try {
      const manifest = this.runtime.getManifest()
      return manifest.manifest_version || 2
    } catch (e) {
      return 2
    }
  }

  // Add cross-browser message passing
  this.sendMessage = function(message, callback) {
    try {
      if (this.runtime && this.runtime.sendMessage) {
        this.runtime.sendMessage(message, callback)
      }
    } catch (e) {
      console.warn('Message passing not available:', e)
    }
  }
}

module.exports = new Extension();