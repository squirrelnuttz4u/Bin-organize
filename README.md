# Bin Organize

A cross-platform storage organization app to help you track and find items in your containers, totes, and bins. Personal clone of ToteScan.

## Features

- **Container Management**: Create, edit, and organize containers with custom colors and locations
- **Item Tracking**: Add items with titles, descriptions, quantities, and multiple images
- **Parent/Child Containers**: Nest containers within each other for hierarchical organization
- **QR Code Generation**: Generate QR codes for each container to quickly access them
- **QR Code Scanning**: Scan QR codes with your camera to instantly navigate to containers
- **Powerful Search**: Search across all containers and items by name, description, location, or barcode
- **Data Export**: Export your inventory in JSON, CSV, or PDF formats
- **Data Import/Backup**: Import data from JSON backups
- **Offline Support**: Works offline as a Progressive Web App (PWA)
- **Cross-Platform**: Runs on Windows (Electron), Android, iOS, and any modern browser

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS Variables with custom design system
- **Database**: IndexedDB (via idb library) for local storage
- **QR Codes**: qrcode (generation) & @zxing/library (scanning)
- **PDF Export**: jsPDF with autotable plugin
- **Icons**: Lucide React
- **Desktop**: Electron
- **PWA**: vite-plugin-pwa

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Desktop App (Electron)

```bash
# Run in development
npm run electron:dev

# Build for distribution
npm run electron:build
```

## Usage

### Creating Containers

1. Click "Add Container" on the home page
2. Enter a name, description, and location
3. Choose a color to help identify the container
4. Click "Create Container"

### Adding Items

1. Open a container
2. Click "Add Item"
3. Enter the item details (title, description, quantity)
4. Optionally add images by clicking the "+" button
5. Click "Add Item"

### Using QR Codes

1. Open a container and click the QR code icon
2. Download or print the QR code
3. Attach the QR code to your physical container
4. Use the Scan feature to quickly access the container

### Searching

1. Go to the Search page
2. Type at least 2 characters to search
3. Results show matching containers and items

### Exporting Data

1. Go to Settings
2. Choose your export format (JSON, CSV, or PDF)
3. The file will download automatically

### Backing Up

1. Export your data as JSON regularly
2. To restore, go to Settings and import the JSON file

## Platforms

### Web Browser (PWA)

The app works in any modern browser and can be installed as a PWA:
- Visit the app URL
- Click "Install" or "Add to Home Screen"
- Works offline after initial load

### Android

1. Open the app in Chrome
2. Tap the menu (three dots)
3. Select "Add to Home Screen"
4. The app will be available like a native app

### iOS

1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. The app will be available like a native app

### Windows

Build the Electron app:
```bash
npm run electron:build
```
The installer will be in the `dist-electron` folder.

## Data Storage

All data is stored locally in your browser's IndexedDB. Data is never sent to any server. Export your data regularly to back it up.

## License

MIT
