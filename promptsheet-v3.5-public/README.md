# PromptSheet

A Chrome sidebar extension for text composition and clipboard management. All data is stored locally in your browser — nothing is sent to any server except optionally via your own mailing list integration.

## Features
- Quick Draft scratchpad with undo/redo history
- Saved Library with up to 100 items
- Recent Drafts with pinning
- 30-item Trash bin with restore support
- Export as TXT, Markdown, PDF, or JSON
- Dark and light mode
- Optional mailing list signup via Google Apps Script

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm

### Install dependencies
npm install

### Run in development mode
npx wxt dev

### Build for production
npx wxt build

The built extension will be in .output/chrome-mv3. Load it in Chrome via chrome://extensions > Load unpacked.

## Configuration

### Mailing List
To enable the mailing list signup modal, replace the placeholder URL in the mail modal component with your own Google Apps Script deployment URL. See the comment in the source file for the exact location.

### Icons
Replace the placeholder PNG files in public/icon/ with your own designs. See public/icon/ICONS_README.txt for size requirements.

## License
MIT
