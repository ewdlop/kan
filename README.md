# Kan: Browser extensions for reading nLab

Kan is a browser *extension* for nLab that does 2 simple things:

- Makes [nlab](ncatlab.org/nlab/) articles look like textbook chapters.
- Hover over a reference to quickly check a definition


![demo](https://user-images.githubusercontent.com/5866348/32987959-4407361a-ccae-11e7-805c-2c955f46822c.gif)

## Browser Support(RAG said so)

Kan supports all major modern browsers with comprehensive cross-browser compatibility:

### Supported Browsers

| Browser | Support Level | Notes |
|---------|---------------|-------|
| 🟢 **Chrome** | Full Support | Recommended browser, all features available |
| 🟢 **Firefox** | Full Support | Includes Firefox-specific optimizations |
| 🟢 **Edge** | Full Support | Microsoft Edge (Chromium-based) |
| 🟢 **Opera** | Full Support | Opera (Chromium-based) |
| 🟡 **Safari** | Limited Support | Some features may be limited due to Safari's extension API differences |

### Browser-Specific Features

- **Automatic browser detection** and API polyfills
- **Cross-browser storage** with fallbacks to localStorage
- **Browser-specific manifest** generation for optimal compatibility
- **Responsive UI** that adapts to different browser rendering engines
- **Dark mode support** across all browsers
- **High DPI display support** for crisp icons and fonts

### Building for Different Browsers

The project includes separate build commands for each browser:

```bash
# Build for specific browsers
npm run chrome-build   # Build for Chrome
npm run firefox-build  # Build for Firefox  
npm run edge-build     # Build for Microsoft Edge
npm run opera-build    # Build for Opera

# Build for all browsers
npm run build

# Development with live reload
npm run chrome-watch   # Development mode for Chrome
npm run firefox-watch  # Development mode for Firefox
npm run edge-watch     # Development mode for Edge
npm run opera-watch    # Development mode for Opera
```

### Installation

Download from the appropriate browser extension store:

- **Chrome**: [Chrome Web Store](link-pending)
- **Firefox**: [Firefox Add-ons](link-pending) 
- **Edge**: [Microsoft Edge Add-ons](link-pending)
- **Opera**: [Opera Add-ons](link-pending)

*Note: Extension store submissions are in progress. Links will be updated once approved.*

### Technical Implementation

The extension uses a sophisticated cross-browser compatibility layer:

- **Extension API wrapper** (`src/scripts/utils/ext.js`) that normalizes differences between browser APIs
- **Storage polyfills** that provide consistent storage interface across browsers
- **Browser-specific manifest generation** for optimal feature support
- **CSS compatibility layers** for consistent visual appearance
- **Automatic feature detection** and graceful degradation

### Development

For developers working on browser compatibility:

1. The build system automatically generates browser-specific builds
2. Cross-browser testing is recommended using the watch commands
3. Browser-specific configurations are in the `config/` directory
4. Polyfills and compatibility code is in `src/scripts/utils/`
