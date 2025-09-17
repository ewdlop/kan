#!/usr/bin/env node

/**
 * Browser Support Validation Script
 * Validates that browser configurations are correct and compatible
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Kan Browser Support Configuration...\n');

const results = {
    passed: 0,
    failed: 0,
    warnings: 0
};

function logResult(type, message) {
    const icons = { pass: '✅', fail: '❌', warn: '⚠️' };
    console.log(`${icons[type]} ${message}`);
    results[type === 'pass' ? 'passed' : type === 'fail' ? 'failed' : 'warnings']++;
}

// Test 1: Check if all browser config files exist
console.log('📁 Checking browser configuration files...');
const browsers = ['chrome', 'firefox', 'opera', 'edge'];
const configDir = path.join(__dirname, 'config');

browsers.forEach(browser => {
    const configPath = path.join(configDir, `${browser}.json`);
    if (fs.existsSync(configPath)) {
        try {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            if (config.extension === browser) {
                logResult('pass', `${browser}.json configuration valid`);
            } else {
                logResult('fail', `${browser}.json configuration invalid - extension mismatch`);
            }
        } catch (e) {
            logResult('fail', `${browser}.json is malformed JSON: ${e.message}`);
        }
    } else {
        logResult('fail', `${browser}.json not found`);
    }
});

// Test 2: Check package.json build scripts
console.log('\n📦 Checking package.json build scripts...');
const packagePath = path.join(__dirname, 'package.json');

if (fs.existsSync(packagePath)) {
    try {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        const scripts = packageJson.scripts || {};
        
        browsers.forEach(browser => {
            const buildScript = `${browser}-build`;
            const watchScript = `${browser}-watch`;
            const distScript = `${browser}-dist`;
            
            if (scripts[buildScript]) {
                logResult('pass', `${buildScript} script exists`);
            } else {
                logResult('fail', `${buildScript} script missing`);
            }
            
            if (scripts[watchScript]) {
                logResult('pass', `${watchScript} script exists`);
            } else {
                logResult('fail', `${watchScript} script missing`);
            }
            
            if (scripts[distScript]) {
                logResult('pass', `${distScript} script exists`);
            } else {
                logResult('fail', `${distScript} script missing`);
            }
        });
    } catch (e) {
        logResult('fail', `package.json is malformed: ${e.message}`);
    }
} else {
    logResult('fail', 'package.json not found');
}

// Test 3: Check manifest.json structure
console.log('\n📜 Checking manifest.json structure...');
const manifestPath = path.join(__dirname, 'manifest.json');

if (fs.existsSync(manifestPath)) {
    try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        
        // Check required fields
        const requiredFields = ['name', 'version', 'manifest_version', 'description'];
        requiredFields.forEach(field => {
            if (manifest[field]) {
                logResult('pass', `manifest.json has required field: ${field}`);
            } else {
                logResult('fail', `manifest.json missing required field: ${field}`);
            }
        });
        
        // Check content scripts include polyfills
        if (manifest.content_scripts && manifest.content_scripts[0] && 
            manifest.content_scripts[0].js && 
            manifest.content_scripts[0].js.includes('scripts/polyfills.js')) {
            logResult('pass', 'manifest.json includes polyfills in content scripts');
        } else {
            logResult('warn', 'manifest.json may not include polyfills in content scripts');
        }
        
        // Check permissions
        if (manifest.permissions && manifest.permissions.includes('storage')) {
            logResult('pass', 'manifest.json includes storage permission');
        } else {
            logResult('warn', 'manifest.json may not include storage permission');
        }
        
    } catch (e) {
        logResult('fail', `manifest.json is malformed: ${e.message}`);
    }
} else {
    logResult('fail', 'manifest.json not found');
}

// Test 4: Check gulpfile.babel.js for browser support
console.log('\n⚙️ Checking gulpfile.babel.js for browser support...');
const gulpfilePath = path.join(__dirname, 'gulpfile.babel.js');

if (fs.existsSync(gulpfilePath)) {
    const gulpfile = fs.readFileSync(gulpfilePath, 'utf8');
    
    // Check if browsers are supported in gulpfile
    browsers.forEach(browser => {
        if (gulpfile.includes(`target === "${browser}"`)) {
            logResult('pass', `gulpfile.babel.js supports ${browser} target`);
        } else {
            logResult('fail', `gulpfile.babel.js missing ${browser} support`);
        }
    });
    
    // Check if manifest generation includes browser-specific configs
    if (gulpfile.includes('$.mergeJson') && gulpfile.includes('manifest.')) {
        logResult('pass', 'gulpfile.babel.js has browser-specific manifest generation');
    } else {
        logResult('warn', 'gulpfile.babel.js may not have browser-specific manifest generation');
    }
    
} else {
    logResult('fail', 'gulpfile.babel.js not found');
}

// Test 5: Check cross-browser utility files
console.log('\n🛠️ Checking cross-browser utility files...');
const utilFiles = [
    'src/scripts/utils/ext.js',
    'src/scripts/utils/storage.js',
    'src/scripts/utils/polyfills.js',
    'src/scripts/utils/feature-detection.js'
];

utilFiles.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Check for browser detection code
        if (content.includes('chrome') && content.includes('browser')) {
            logResult('pass', `${filePath} has cross-browser support`);
        } else {
            logResult('warn', `${filePath} may have limited browser support`);
        }
    } else {
        logResult('fail', `${filePath} not found`);
    }
});

// Test 6: Check README documentation
console.log('\n📚 Checking README documentation...');
const readmePath = path.join(__dirname, 'README.md');

if (fs.existsSync(readmePath)) {
    const readme = fs.readFileSync(readmePath, 'utf8');
    
    if (readme.includes('Browser Support')) {
        logResult('pass', 'README.md includes browser support documentation');
    } else {
        logResult('warn', 'README.md may not include browser support documentation');
    }
    
    // Check if all browsers are mentioned
    browsers.forEach(browser => {
        if (readme.toLowerCase().includes(browser.toLowerCase())) {
            logResult('pass', `README.md mentions ${browser} support`);
        } else {
            logResult('warn', `README.md may not mention ${browser} support`);
        }
    });
} else {
    logResult('fail', 'README.md not found');
}

// Summary
console.log('\n📊 Validation Summary:');
console.log(`✅ Passed: ${results.passed}`);
console.log(`❌ Failed: ${results.failed}`);
console.log(`⚠️ Warnings: ${results.warnings}`);

const total = results.passed + results.failed + results.warnings;
const passRate = total > 0 ? ((results.passed / total) * 100).toFixed(1) : 0;
console.log(`📈 Pass Rate: ${passRate}%`);

if (results.failed === 0) {
    console.log('\n🎉 All critical browser support validations passed!');
    process.exit(0);
} else {
    console.log('\n🚨 Some browser support validations failed. Please review the issues above.');
    process.exit(1);
}