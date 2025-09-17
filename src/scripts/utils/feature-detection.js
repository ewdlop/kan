/**
 * Browser Feature Detection for Kan Extension
 * Detects browser capabilities and provides appropriate fallbacks
 */

(function() {
  'use strict';

  const KanFeatureDetection = {
    
    // Cache for feature detection results
    cache: {},

    /**
     * Detect if the browser supports a specific CSS feature
     */
    supportsCSSFeature: function(property, value) {
      const cacheKey = `css_${property}_${value}`;
      if (this.cache[cacheKey] !== undefined) {
        return this.cache[cacheKey];
      }

      let supported = false;
      try {
        supported = CSS.supports(property, value);
      } catch (e) {
        // Fallback for older browsers
        const testElement = document.createElement('div');
        testElement.style[property] = value;
        supported = testElement.style[property] === value;
      }

      this.cache[cacheKey] = supported;
      return supported;
    },

    /**
     * Detect browser's extension API capabilities
     */
    detectExtensionAPI: function() {
      const cacheKey = 'extension_api';
      if (this.cache[cacheKey]) {
        return this.cache[cacheKey];
      }

      const apis = {
        hasChrome: typeof chrome !== 'undefined' && !!chrome.runtime,
        hasBrowser: typeof browser !== 'undefined' && !!browser.runtime,
        hasStorage: false,
        hasAlarms: false,
        hasBrowserAction: false,
        hasTabsAPI: false,
        manifestVersion: 2
      };

      const extensionAPI = apis.hasBrowser ? browser : (apis.hasChrome ? chrome : null);

      if (extensionAPI) {
        apis.hasStorage = !!extensionAPI.storage;
        apis.hasAlarms = !!extensionAPI.alarms;
        apis.hasBrowserAction = !!(extensionAPI.browserAction || extensionAPI.action);
        apis.hasTabsAPI = !!extensionAPI.tabs;

        try {
          const manifest = extensionAPI.runtime.getManifest();
          apis.manifestVersion = manifest.manifest_version || 2;
        } catch (e) {
          // Could not read manifest
        }
      }

      this.cache[cacheKey] = apis;
      return apis;
    },

    /**
     * Detect modern JavaScript features
     */
    detectJSFeatures: function() {
      const cacheKey = 'js_features';
      if (this.cache[cacheKey]) {
        return this.cache[cacheKey];
      }

      const features = {
        promises: typeof Promise !== 'undefined',
        asyncAwait: (function() {
          try {
            eval('(async () => {})');
            return true;
          } catch (e) {
            return false;
          }
        })(),
        arrow: (function() {
          try {
            eval('(() => {})');
            return true;
          } catch (e) {
            return false;
          }
        })(),
        classes: (function() {
          try {
            eval('class Test {}');
            return true;
          } catch (e) {
            return false;
          }
        })(),
        templateLiterals: (function() {
          try {
            eval('`template`');
            return true;
          } catch (e) {
            return false;
          }
        })(),
        destructuring: (function() {
          try {
            eval('const {a} = {a: 1}');
            return true;
          } catch (e) {
            return false;
          }
        })(),
        modules: typeof module !== 'undefined' && !!module.exports
      };

      this.cache[cacheKey] = features;
      return features;
    },

    /**
     * Detect DOM and HTML5 features
     */
    detectDOMFeatures: function() {
      const cacheKey = 'dom_features';
      if (this.cache[cacheKey]) {
        return this.cache[cacheKey];
      }

      const features = {
        querySelector: !!document.querySelector,
        addEventListener: !!document.addEventListener,
        dataset: (function() {
          const div = document.createElement('div');
          return !!div.dataset;
        })(),
        classList: (function() {
          const div = document.createElement('div');
          return !!div.classList;
        })(),
        customElements: !!window.customElements,
        shadowDOM: !!Element.prototype.attachShadow,
        intersectionObserver: !!window.IntersectionObserver,
        mutationObserver: !!window.MutationObserver,
        requestAnimationFrame: !!window.requestAnimationFrame,
        fetch: !!window.fetch,
        localStorage: (function() {
          try {
            return !!window.localStorage;
          } catch (e) {
            return false;
          }
        })(),
        sessionStorage: (function() {
          try {
            return !!window.sessionStorage;
          } catch (e) {
            return false;
          }
        })()
      };

      this.cache[cacheKey] = features;
      return features;
    },

    /**
     * Get browser-specific recommendations
     */
    getBrowserRecommendations: function() {
      const extensionAPI = this.detectExtensionAPI();
      const jsFeatures = this.detectJSFeatures();
      const domFeatures = this.detectDOMFeatures();

      const recommendations = [];

      // Storage recommendations
      if (!extensionAPI.hasStorage) {
        recommendations.push({
          type: 'storage',
          message: 'Extension storage API not available, falling back to localStorage',
          level: 'warning'
        });
      }

      // JavaScript feature recommendations  
      if (!jsFeatures.promises) {
        recommendations.push({
          type: 'javascript',
          message: 'Promises not supported, consider using polyfill',
          level: 'error'
        });
      }

      if (!jsFeatures.arrow) {
        recommendations.push({
          type: 'javascript',
          message: 'Arrow functions not supported, using traditional functions',
          level: 'warning'
        });
      }

      // DOM feature recommendations
      if (!domFeatures.querySelector) {
        recommendations.push({
          type: 'dom',
          message: 'querySelector not supported, using fallback methods',
          level: 'error'
        });
      }

      if (!domFeatures.addEventListener) {
        recommendations.push({
          type: 'dom',
          message: 'addEventListener not supported, using attachEvent fallback',
          level: 'warning'
        });
      }

      // CSS feature recommendations
      if (!this.supportsCSSFeature('display', 'flex')) {
        recommendations.push({
          type: 'css',
          message: 'Flexbox not supported, using fallback layout',
          level: 'warning'
        });
      }

      return recommendations;
    },

    /**
     * Apply browser-specific polyfills and fixes
     */
    applyPolyfills: function() {
      const recommendations = this.getBrowserRecommendations();
      
      recommendations.forEach(rec => {
        console.log(`[Kan Feature Detection] ${rec.level.toUpperCase()}: ${rec.message}`);
        
        // Apply specific polyfills based on recommendations
        switch (rec.type) {
          case 'dom':
            if (rec.message.includes('addEventListener')) {
              this.polyfillAddEventListener();
            }
            break;
          case 'javascript':
            if (rec.message.includes('Promises')) {
              this.polyfillPromises();
            }
            break;
        }
      });
    },

    /**
     * Polyfill for addEventListener
     */
    polyfillAddEventListener: function() {
      if (!Element.prototype.addEventListener && Element.prototype.attachEvent) {
        Element.prototype.addEventListener = function(event, handler, capture) {
          this.attachEvent('on' + event, handler);
        };
        Element.prototype.removeEventListener = function(event, handler, capture) {
          this.detachEvent('on' + event, handler);
        };
      }
    },

    /**
     * Basic Promise polyfill
     */
    polyfillPromises: function() {
      if (typeof Promise === 'undefined') {
        window.Promise = function(executor) {
          const self = this;
          self.state = 'pending';
          self.value = undefined;
          self.handlers = [];

          function resolve(result) {
            if (self.state === 'pending') {
              self.state = 'fulfilled';
              self.value = result;
              self.handlers.forEach(handle);
              self.handlers = null;
            }
          }

          function reject(error) {
            if (self.state === 'pending') {
              self.state = 'rejected';
              self.value = error;
              self.handlers.forEach(handle);
              self.handlers = null;
            }
          }

          function handle(handler) {
            if (self.state === 'pending') {
              self.handlers.push(handler);
            } else {
              setTimeout(function() {
                const handlerCallback = self.state === 'fulfilled' ? handler.onFulfilled : handler.onRejected;
                if (handlerCallback) {
                  try {
                    handlerCallback(self.value);
                  } catch (e) {
                    handler.reject(e);
                  }
                }
              }, 0);
            }
          }

          this.then = function(onFulfilled, onRejected) {
            return new Promise(function(resolve, reject) {
              handle({
                onFulfilled: onFulfilled,
                onRejected: onRejected,
                resolve: resolve,
                reject: reject
              });
            });
          };

          executor(resolve, reject);
        };
      }
    },

    /**
     * Initialize feature detection and apply polyfills
     */
    init: function() {
      this.applyPolyfills();
      
      // Make feature detection available globally
      window.KanFeatures = {
        extension: this.detectExtensionAPI(),
        javascript: this.detectJSFeatures(),
        dom: this.detectDOMFeatures(),
        recommendations: this.getBrowserRecommendations()
      };

      console.log('[Kan Feature Detection] Initialized with features:', window.KanFeatures);
    }
  };

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      KanFeatureDetection.init();
    });
  } else {
    KanFeatureDetection.init();
  }

  // Export for use in other modules
  window.KanFeatureDetection = KanFeatureDetection;

})();