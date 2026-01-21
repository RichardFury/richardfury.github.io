# Richard Fury Portfolio

A minimalist personal portfolio website for Richard Fury, featuring a clean design with liquid glass effects and comprehensive content sections.

## 🌟 Features

- **Minimalist Design**: Clean, elegant interface with lots of whitespace
- **Liquid Glass Effects**: Modern glassmorphism design elements
- **Responsive Layout**: Fully responsive across all devices
- **Theme Support**: Dark and light theme switching
- **Multiple Sections**: Home, CV, Blog, Research, Gallery, Contact
- **Analytics Dashboard**: Hidden data visualization page with password protection
- **Performance Optimized**: Fast loading and smooth animations
- **Accessibility**: WCAG 2.1 AA compliant

## 🚀 Tech Stack

- **Frontend**: Vue 3 (Composition API)
- **Build Tool**: Vite 6
- **Styling**: CSS with CSS Variables
- **Routing**: Vue Router 4
- **Charts**: ECharts 6
- **Maps**: Leaflet.js
- **Security**: bcryptjs for password hashing
- **Deployment**: GitHub Pages

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/richardfury.github.io.git

# Navigate to the project directory
cd richardfury.github.io

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
richardfury.github.io/
├── src/
│   ├── components/          # Vue components
│   │   ├── HomePage/       # Home page components
│   │   ├── BlogPage/       # Blog page components
│   │   ├── CVPage/         # CV page components
│   │   ├── ResearchPage/    # Research page components
│   │   ├── GalleryPage/     # Gallery page components
│   │   ├── ContactPage/     # Contact page components
│   │   ├── AnalyticsPage/   # Analytics dashboard components
│   │   ├── TheHeader.vue    # Main header component
│   │   └── TheFooter.vue    # Main footer component
│   ├── styles/            # CSS styles
│   │   ├── style.css       # Global styles
│   │   ├── analytics.css   # Analytics dashboard styles
│   │   └── minimalist.css  # Minimalist utility classes
│   ├── data/              # Data files
│   ├── services/          # Service files
│   ├── utils/             # Utility functions
│   ├── App.vue            # Root component
│   └── main.js            # Entry point
├── public/               # Static assets
├── .github/              # GitHub workflows
└── package.json          # Project dependencies
```

## 🎨 Design System

### Colors

**Dark Theme**:
- Background: `#0a0a0a` (primary), `#141414` (secondary), `#1f1f1f` (tertiary)
- Text: `#f5f5f5` (primary), `#a1a1aa` (secondary), `#71717a` (tertiary)
- Accent: `#404040` (primary), `#737373` (secondary), `#a3a3a3` (tertiary)

**Light Theme**:
- Background: `#ffffff` (primary), `#f8f9fa` (secondary), `#f0f1f3` (tertiary)
- Text: `#1a1a1a` (primary), `#6b7280` (secondary), `#9ca3af` (tertiary)
- Accent: `#404040` (primary), `#737373` (secondary), `#a3a3a3` (tertiary)

### Typography

- **Font Family**: Playfair Display (headings), Inter (body)
- **Font Sizes**: 0.875rem - 4.5rem
- **Line Heights**: 1.4 - 2.0
- **Letter Spacing**: -0.02em to 0.05em

### Spacing

- **Base Unit**: 0.25rem (4px)
- **Scale**: 1x, 2x, 3x, 4x, 5x, 6x, 8x, 10x, 12x, 16x, 20x, 24x

### Breakpoints

- **Mobile**: < 480px
- **Mobile-L**: 480px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px - 1439px
- **Large**: ≥ 1440px

## 📄 Pages

### Home Page
- Hero section with carousel
- Concepts section
- Works preview section
- Contact section

### CV Page
- Professional experience
- Education
- Skills
- Projects

### Blog Page
- Blog post list
- Blog post detail
- Comments section
- Nested replies

### Research Page
- Research publications
- Visualizations
- Papers

### Gallery Page
- Photo gallery
- Image modal
- Camera parameters

### Contact Page
- Contact form
- Contact information
- Social links

### Analytics Dashboard
- Password-protected login
- World map visualization
- Access statistics
- User behavior analysis
- Device analysis
- Page ranking
- Geographic analysis

## 🔐 Analytics Dashboard

The analytics dashboard is a hidden page accessible at `/analytics` with password protection.

**Default Password**: `RichardFury2026`

**Features**:
- World map with visitor locations
- Access statistics (PV, UV, duration, bounce rate)
- User behavior analysis
- Device information
- Page ranking
- Geographic analysis

**Security**:
- bcrypt password hashing
- JWT token authentication
- Route guards
- Attempt limiting

## 🎯 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📦 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 👤 Author

Richard Fury

## 🙏 Acknowledgments

- Vue.js team for the amazing framework
- Vite team for the build tool
- ECharts team for the charting library
- Leaflet team for the mapping library
- All other open-source contributors

---

**Last Updated**: 2026-01-18