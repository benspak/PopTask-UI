# PopTask Frontend

A modern, responsive Progressive Web App (PWA) for task management with comprehensive user authentication, built with React, Chakra UI, and Vite.

## 💰 Business Value

**Target Market**: SaaS productivity platform serving SMBs and freelancers
**Revenue Potential**: $20M+ ARR by 2050 through scalable subscription model
**Value Delivered**: 10x ROI through time savings and team collaboration
**Key Features**: User authentication, task sharing, project management, PWA capabilities

## ✨ Features

### 🔐 Authentication & User Management
- **User Registration** - Secure registration with email verification
- **User Login** - JWT-based authentication with refresh tokens
- **Password Reset** - Secure password reset via email
- **Email Verification** - Required email verification for new accounts
- **Account Management** - User profile editing and password changes
- **Session Management** - Automatic token refresh and logout
- **Account Locking** - Protection against brute force attacks

### 🚀 PWA Capabilities
- **Offline Support** - Works without internet connection
- **Installable** - Can be installed on desktop and mobile devices
- **App-like Experience** - Full-screen mode and native app feel
- **Background Sync** - Automatic data synchronization when online
- **Push Notifications** - (Coming soon)

### 📋 Task Management
- **Daily Task Organization** - Organize tasks by day of the week
- **Project-based Filtering** - Filter tasks by project categories
- **Tag System** - Categorize tasks with custom tags (up to 3 per task)
- **Due Date Management** - Color-coded due date indicators
- **Task Completion Tracking** - Checkbox-based completion status
- **Inline Editing** - Edit task titles and descriptions directly
- **File Attachments** - Upload and manage files with thumbnails
- **Task Sharing** - Share tasks with specific users via email
- **Time Tracking** - Track time spent on tasks
- **Responsive Design** - Works seamlessly on desktop and mobile

### 🎨 UI/UX Features
- **Dark Theme** - Modern dark interface for reduced eye strain
- **Collapsible Panels** - Customizable layout with collapsible sections
- **Search Functionality** - Quick task search and filtering
- **Real-time Updates** - Instant UI updates on data changes
- **Mobile-first Design** - Optimized for mobile devices
- **Loading States** - Smooth loading indicators
- **Error Handling** - User-friendly error messages
- **Keyboard Shortcuts** - (Coming soon)
- **Drag & Drop** - (Coming soon)

## 🛠️ Technology Stack

- **Frontend**: React 18 with Hooks
- **UI Framework**: Chakra UI v2
- **Build Tool**: Vite
- **PWA**: Vite PWA Plugin
- **Service Worker**: Workbox
- **State Management**: React Context + Custom Hooks
- **HTTP Client**: Fetch API with custom service layer
- **Routing**: React Router DOM
- **Icons**: Canvas-generated PNG icons
- **Testing**: Vitest + Testing Library

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Modern browser with PWA support

## ⚙️ Configuration

### Environment Variables

Copy the example environment file and configure it:

```bash
cp env.example .env
```

#### Available Variables
```env
# API Configuration
VITE_API_URL=                    # Backend API URL (empty for relative URLs)

# App Configuration
VITE_APP_TITLE=PopTask
VITE_APP_DESCRIPTION=A modern task management application

# PWA Configuration
VITE_PWA_NAME=PopTask
VITE_PWA_SHORT_NAME=Tasks
VITE_PWA_THEME_COLOR=#3182CE
VITE_PWA_BACKGROUND_COLOR=#1A202C

# Feature Flags
VITE_ENABLE_OFFLINE=true
VITE_ENABLE_PUSH_NOTIFICATIONS=false

# Analytics (optional)
VITE_GOOGLE_ANALYTICS_ID=

# Error Reporting (optional)
VITE_SENTRY_DSN=
```

## 🚀 Installation & Development

### Quick Start
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

### Development Commands
```bash
# Start development server with HMR
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Generate PWA icons
npm run generate-icons

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Lint code
npm run lint

# Format code
npm run format

# Type checking
npm run type-check

# Bundle analysis
npm run analyze
```

## 🐳 Docker Deployment

### Build and Run
```bash
# Build the image
docker build -t poptask-frontend .

# Run with nginx
docker run -d \
  --name poptask-frontend \
  -p 80:80 \
  poptask-frontend
```

### Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f frontend

# Stop services
docker-compose down
```

## 🌐 Production Deployment

### Static Hosting

#### Netlify
```bash
# Build the project
npm run build

# Deploy dist folder to Netlify
# Or connect GitHub repository for auto-deployment
```

#### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Render.com (Recommended)
```bash
# Connect GitHub repository
# Configure build command: npm run build
# Configure publish directory: dist
```

#### AWS S3 + CloudFront
```bash
# Build the project
npm run build

# Sync to S3
aws s3 sync dist/ s3://your-bucket-name

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/poptask/dist;
    index index.html;

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

## 📱 PWA Features

### Service Worker
- **Offline Caching** - Cache essential resources for offline use
- **Background Sync** - Sync data when connection is restored
- **Push Notifications** - (Coming soon)

### Manifest Configuration
```json
{
  "name": "PopTask",
  "short_name": "Tasks",
  "description": "A modern task management application",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1A202C",
  "theme_color": "#3182CE",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## 🧪 Testing

### Unit Tests
```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### E2E Tests
```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests headless
npm run test:e2e:headless
```

### Test Coverage
- Component testing with React Testing Library
- Hook testing with custom test utilities
- API service testing with MSW
- E2E testing with Playwright

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Auth.jsx         # Authentication components
│   ├── AuthGuard.jsx    # Route protection
│   ├── Dashboard.jsx    # Main dashboard
│   ├── TaskList.jsx     # Task list component
│   ├── ProjectList.jsx  # Project list component
│   ├── SearchAndFilters.jsx # Search and filter UI
│   ├── ShareDialog.jsx  # Task sharing dialog
│   ├── TaskDetailPanel.jsx # Task detail view
│   ├── TimeTrackingButton.jsx # Time tracking component
│   └── ...
├── views/               # Page components
│   ├── Login.jsx        # Login page
│   ├── Register.jsx     # Registration page
│   ├── ForgotPassword.jsx # Password reset page
│   └── Dashboard.jsx    # Main dashboard page
├── contexts/            # React contexts
│   └── AuthContext.jsx  # Authentication context
├── hooks/               # Custom React hooks
│   ├── useTasks.js      # Task management hooks
│   └── useProjects.js   # Project management hooks
├── services/            # API service layer
│   └── api.js           # HTTP client and API calls
├── assets/              # Static assets
├── App.jsx              # Main app component
└── main.jsx             # App entry point
```

## 🔧 Development Tools

### Code Quality
- **ESLint** - Code linting and style enforcement
- **Prettier** - Code formatting
- **TypeScript** - Type checking (optional)

### Build Tools
- **Vite** - Fast build tool and dev server
- **Vite PWA Plugin** - PWA generation
- **Bundle Analyzer** - Bundle size analysis

### Testing Tools
- **Vitest** - Unit testing framework
- **React Testing Library** - Component testing
- **Playwright** - E2E testing
- **MSW** - API mocking

## 🚀 Performance Optimization

### Bundle Optimization
- **Code Splitting** - Automatic route-based code splitting
- **Tree Shaking** - Remove unused code
- **Lazy Loading** - Load components on demand
- **Bundle Analysis** - Monitor bundle size

### Runtime Optimization
- **React.memo** - Prevent unnecessary re-renders
- **useMemo/useCallback** - Optimize expensive operations
- **Virtual Scrolling** - (Coming soon)
- **Image Optimization** - Automatic image optimization

## 🔒 Security

### Frontend Security
- **HTTPS Only** - Secure connections in production
- **Content Security Policy** - XSS protection
- **Input Validation** - Client-side validation
- **Secure Storage** - JWT token storage
- **CORS Handling** - Proper CORS configuration

### Authentication Flow
1. User enters credentials
2. Frontend validates input
3. API call to backend
4. JWT tokens stored securely
5. Automatic token refresh
6. Secure logout with token cleanup

## 📊 Analytics & Monitoring

### Performance Monitoring
- **Core Web Vitals** - Monitor loading performance
- **Error Tracking** - Catch and report errors
- **User Analytics** - Track user behavior (optional)

### Health Checks
- **API Connectivity** - Monitor backend connection
- **Service Worker** - Check PWA functionality
- **Offline Status** - Monitor offline capabilities

## 🆘 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### PWA Not Working
- Check service worker registration
- Verify manifest.json configuration
- Test in incognito mode

#### Authentication Issues
- Check JWT token expiration
- Verify API endpoint configuration
- Clear browser storage

#### Performance Issues
- Run bundle analysis: `npm run analyze`
- Check for memory leaks
- Optimize images and assets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- Check the main [README.md](../README.md) for project overview
- Review [AUTHENTICATION.md](../task-backend-mcp-node/AUTHENTICATION.md) for auth system details
- Review [QUICK_START.md](../QUICK_START.md) for setup help
- Create an issue on GitHub for bugs or feature requests

---

**Built with ❤️ for productive task management**

*PopTask Frontend - Empowering productivity since 2025*
