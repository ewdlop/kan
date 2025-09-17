/**
 * Browser Compatibility Test Suite for Kan Extension
 * Tests cross-browser functionality and API compatibility
 */

(function() {
  'use strict';

  const KanBrowserTest = {
    results: {
      passed: 0,
      failed: 0,
      tests: []
    },

    // Test browser detection
    testBrowserDetection: function() {
      const test = {
        name: 'Browser Detection',
        passed: false,
        details: ''
      };

      try {
        if (typeof window.KanBrowser !== 'undefined') {
          const browser = window.KanBrowser;
          const detectedBrowser = browser.name;
          test.details = `Detected browser: ${detectedBrowser}`;
          test.passed = detectedBrowser !== 'unknown';
        } else {
          test.details = 'KanBrowser object not found';
        }
      } catch (e) {
        test.details = `Error: ${e.message}`;
      }

      this.recordTest(test);
    },

    // Test extension API availability
    testExtensionAPI: function() {
      const test = {
        name: 'Extension API Availability',
        passed: false,
        details: ''
      };

      try {
        const hasChrome = typeof chrome !== 'undefined' && chrome.runtime;
        const hasBrowser = typeof browser !== 'undefined' && browser.runtime;
        const hasKanAPI = typeof window.KanExtensionAPI !== 'undefined';

        if (hasChrome || hasBrowser || hasKanAPI) {
          test.passed = true;
          test.details = `APIs available: ${[
            hasChrome ? 'chrome' : '',
            hasBrowser ? 'browser' : '',
            hasKanAPI ? 'KanExtensionAPI' : ''
          ].filter(Boolean).join(', ')}`;
        } else {
          test.details = 'No extension APIs found';
        }
      } catch (e) {
        test.details = `Error: ${e.message}`;
      }

      this.recordTest(test);
    },

    // Test storage functionality
    testStorage: function() {
      const test = {
        name: 'Storage Functionality',
        passed: false,
        details: ''
      };

      try {
        // Test if storage module is available
        if (typeof require !== 'undefined') {
          const storage = require('./utils/storage');
          if (storage && typeof storage.get === 'function' && typeof storage.set === 'function') {
            test.passed = true;
            test.details = 'Storage API available with get/set methods';
          } else {
            test.details = 'Storage API missing required methods';
          }
        } else {
          // Direct test for extension environment
          const hasStorageAPI = (typeof chrome !== 'undefined' && chrome.storage) || 
                               (typeof browser !== 'undefined' && browser.storage) ||
                               (typeof localStorage !== 'undefined');
          
          if (hasStorageAPI) {
            test.passed = true;
            test.details = 'Storage API available in extension context';
          } else {
            test.details = 'No storage API found';
          }
        }
      } catch (e) {
        test.details = `Error: ${e.message}`;
      }

      this.recordTest(test);
    },

    // Test CSS compatibility
    testCSSCompatibility: function() {
      const test = {
        name: 'CSS Compatibility',
        passed: false,
        details: ''
      };

      try {
        const features = [];
        
        // Test CSS Grid support
        if (CSS.supports('display', 'grid')) {
          features.push('Grid');
        }
        
        // Test CSS Custom Properties
        if (CSS.supports('--test', 'value')) {
          features.push('Custom Properties');
        }
        
        // Test Flexbox
        if (CSS.supports('display', 'flex')) {
          features.push('Flexbox');
        }

        // Test Filter support
        if (CSS.supports('filter', 'invert(1)')) {
          features.push('Filters');
        }

        test.passed = features.length > 0;
        test.details = features.length > 0 ? 
          `Supported features: ${features.join(', ')}` : 
          'No modern CSS features detected';
      } catch (e) {
        test.details = `Error: ${e.message}`;
      }

      this.recordTest(test);
    },

    // Test manifest version compatibility
    testManifestVersion: function() {
      const test = {
        name: 'Manifest Version',
        passed: false,
        details: ''
      };

      try {
        const extensionAPI = window.KanExtensionAPI || 
                           (typeof browser !== 'undefined' ? browser : chrome);
        
        if (extensionAPI && extensionAPI.runtime && extensionAPI.runtime.getManifest) {
          const manifest = extensionAPI.runtime.getManifest();
          const version = manifest.manifest_version;
          test.passed = version === 2 || version === 3;
          test.details = `Manifest version: ${version}`;
        } else {
          test.details = 'Cannot access manifest';
        }
      } catch (e) {
        test.details = `Error: ${e.message}`;
      }

      this.recordTest(test);
    },

    // Test polyfills
    testPolyfills: function() {
      const test = {
        name: 'Polyfills Loading',
        passed: false,
        details: ''
      };

      try {
        const polyfillsLoaded = typeof window.KanBrowser !== 'undefined' && 
                               typeof window.KanExtensionAPI !== 'undefined';
        
        test.passed = polyfillsLoaded;
        test.details = polyfillsLoaded ? 
          'Polyfills loaded successfully' : 
          'Polyfills not loaded';
      } catch (e) {
        test.details = `Error: ${e.message}`;
      }

      this.recordTest(test);
    },

    // Record test result
    recordTest: function(test) {
      this.results.tests.push(test);
      if (test.passed) {
        this.results.passed++;
      } else {
        this.results.failed++;
      }
    },

    // Run all tests
    runAllTests: function() {
      console.log('🧪 Running Kan Browser Compatibility Tests...');
      
      this.testBrowserDetection();
      this.testExtensionAPI();
      this.testStorage();
      this.testCSSCompatibility();
      this.testManifestVersion();
      this.testPolyfills();

      this.reportResults();
    },

    // Report test results
    reportResults: function() {
      const total = this.results.passed + this.results.failed;
      const passRate = ((this.results.passed / total) * 100).toFixed(1);

      console.log('\n📊 Test Results:');
      console.log(`✅ Passed: ${this.results.passed}`);
      console.log(`❌ Failed: ${this.results.failed}`);
      console.log(`📈 Pass Rate: ${passRate}%`);

      console.log('\n📋 Detailed Results:');
      this.results.tests.forEach(test => {
        const icon = test.passed ? '✅' : '❌';
        console.log(`${icon} ${test.name}: ${test.details}`);
      });

      // Return results for programmatic use
      return {
        success: this.results.failed === 0,
        passRate: passRate,
        results: this.results
      };
    }
  };

  // Auto-run tests if in development mode
  if (typeof window !== 'undefined' && window.location && 
      window.location.hostname === 'localhost') {
    KanBrowserTest.runAllTests();
  }

  // Export for manual testing
  window.KanBrowserTest = KanBrowserTest;

})();