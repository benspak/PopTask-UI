# Task Dashboard PWA

A modern, responsive Progressive Web App (PWA) for task management and productivity. Built with React, Chakra UI, and Vite.

## ✨ Features

### PWA Capabilities
- **Offline Support**: Works without internet connection
- **Installable**: Can be installed on desktop and mobile devices
- **App-like Experience**: Full-screen mode and native app feel
- **Background Sync**: Automatic data synchronization when online
- **Push Notifications**: (Coming soon)

### Task Management
- **Daily Task Organization**: Organize tasks by day of the week
- **Project-based Filtering**: Filter tasks by project categories
- **Tag System**: Categorize tasks with custom tags
- **Due Date Management**: Color-coded due date indicators
- **Task Completion Tracking**: Checkbox-based completion status
- **Inline Editing**: Edit task titles and descriptions directly
- **Responsive Design**: Works seamlessly on desktop and mobile

### UI/UX Features
- **Dark Theme**: Modern dark interface for reduced eye strain
- **Collapsible Panels**: Customizable layout with collapsible sections
- **Search Functionality**: Quick task search and filtering
- **Drag & Drop**: (Coming soon)
- **Keyboard Shortcuts**: (Coming soon)

## 🚀 Installation

### For Users

#### Desktop Installation
1. Open the Task Dashboard in your browser
2. Look for the "Install App" button in the top-right corner
3. Click "Install" when prompted
4. The app will be installed and accessible from your desktop

#### Mobile Installation
1. Open the Task Dashboard in your mobile browser
2. Tap the "Add to Home Screen" option in your browser menu
3. Follow the prompts to install the app
4. The app will appear on your home screen

### For Developers

#### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

#### Setup
```bash
# Clone the repository
git clone <repository-url>
cd task-dashboard-vite-chakra

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

#### Generate Icons
```bash
# Generate PWA icons
npm run generate-icons
```

## 📱 PWA Features

### Offline Functionality
- The app caches essential resources for offline use
- Tasks can be created and edited while offline
- Changes sync automatically when connection is restored

### Installation Benefits
- **Desktop**: App-like experience with dedicated window
- **Mobile**: Native app feel with home screen access
- **Updates**: Automatic updates when new versions are available

### Performance
- **Fast Loading**: Optimized assets and caching
- **Smooth Animations**: 60fps animations and transitions
- **Efficient Storage**: Minimal storage footprint

## 🛠️ Technology Stack

- **Frontend**: React 18
- **UI Framework**: Chakra UI
- **Build Tool**: Vite
- **PWA**: Vite PWA Plugin
- **Service Worker**: Workbox
- **Icons**: Canvas-generated PNG icons

## 📁 Project Structure

```
task-dashboard-vite-chakra/
├── public/
│   ├── icons/           # PWA icons (generated)
│   ├── manifest.json    # Web app manifest
│   └── sw.js           # Service worker
├── src/
│   ├── App.jsx         # Main application component
│   ├── main.jsx        # Application entry point
│   └── components/     # React components
├── scripts/
│   └── generate-icons.js # Icon generation script
├── vite.config.js      # Vite configuration with PWA
└── package.json        # Dependencies and scripts
```

## 🔧 Configuration

### PWA Settings
The PWA configuration is handled in `vite.config.js`:

- **Manifest**: App metadata, icons, and shortcuts
- **Service Worker**: Caching strategies and offline functionality
- **Icons**: Multiple sizes for different devices and contexts

### Customization
- Modify `public/manifest.json` for app metadata
- Update `scripts/generate-icons.js` for custom icons
- Adjust caching strategies in `vite.config.js`

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

The build process will:
- Generate optimized assets
- Create service worker files
- Generate PWA manifest
- Optimize for production

### Hosting
Deploy the `dist` folder to any static hosting service:
- Netlify
- Vercel
- GitHub Pages
- Firebase Hosting

## 📊 Browser Support

- **Chrome**: Full PWA support
- **Firefox**: Full PWA support
- **Safari**: Limited PWA support (iOS 11.3+)
- **Edge**: Full PWA support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review browser console for errors

---

**Made with ❤️ for productive task management**
