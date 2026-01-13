# SABR OS Logo Variations

This directory contains all the logo variations for the SABR OS brand.

## 📁 Available Files

### Primary Logo
- **logo-final.png** - Original gold/bronze gradient logo
  - Use for: Main branding, landing page, marketing materials
  - Background: Works best on light or neutral backgrounds

### Color Variations

#### White Version
- **logo-white.png** - Pure white monochrome
  - Use for: Dark backgrounds, dark mode UI, headers, footers
  - Background: Dark colors, colored backgrounds

#### Navy Blue Version
- **logo-navy.png** - Deep navy blue (#1a365d)
  - Use for: Light mode interfaces, professional documents
  - Background: Light or white backgrounds

#### Black Version
- **logo-black.png** - Pure black monochrome
  - Use for: Print materials, minimalist designs, documents
  - Background: Light or white backgrounds

#### Bright Gold Version
- **logo-gold.png** - Luminous bright gold with metallic effect
  - Use for: Premium features, special events, Ramadan themes
  - Background: Dark backgrounds for best effect

### App Icons

#### Square Icon
- **logo-icon.png** - 512x512px square format
  - Use for: PWA app icons, app store listings, mobile home screen
  - Optimized for: All icon sizes (scales well)

#### Favicon
- **favicon.png** - Small optimized version
  - Use for: Browser tabs, bookmarks
  - Size: 64x64px optimized

## 🎨 Usage Guidelines

### For Web Development

```html
<!-- Favicon in HTML head -->
<link rel="icon" type="image/png" href="/favicon.png" />

<!-- Apple Touch Icons -->
<link rel="apple-touch-icon" href="/logo-icon.png" />
<link rel="apple-touch-icon" sizes="512x512" href="/logo-icon.png" />

<!-- PWA Manifest -->
<link rel="manifest" href="/manifest.json" />
```

### For React/JSX Components

```jsx
// Light mode
<img src="/logo-navy.png" alt="SABR OS" />
<img src="/logo-black.png" alt="SABR OS" />

// Dark mode
<img src="/logo-white.png" alt="SABR OS" />
<img src="/logo-gold.png" alt="SABR OS" />

// Original
<img src="/logo-final.png" alt="SABR OS" />
```

### For CSS Background Images

```css
/* Light mode */
.logo-light {
  background-image: url('/logo-navy.png');
}

/* Dark mode */
.logo-dark {
  background-image: url('/logo-white.png');
}

/* Premium/Special */
.logo-premium {
  background-image: url('/logo-gold.png');
}
```

## 📱 PWA Configuration

The `manifest.json` file is configured to use these logos:

```json
{
  "icons": [
    {
      "src": "/logo-icon.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/favicon.png",
      "sizes": "64x64",
      "type": "image/png"
    }
  ]
}
```

## 🎯 Quick Reference

| Background Type | Recommended Logo |
|----------------|------------------|
| Light/White | logo-navy.png or logo-black.png |
| Dark/Black | logo-white.png or logo-gold.png |
| Colored | logo-white.png |
| Neutral | logo-final.png (original) |
| Premium/Special | logo-gold.png |
| PWA Icons | logo-icon.png |
| Browser Tab | favicon.png |

## 🖼️ Logo Showcase

To view all logo variations in action, open:
```
/logo-showcase.html
```

This page displays all variations with different background colors and usage examples.

## 📐 Technical Specifications

- **Format**: PNG with transparency
- **Color Space**: RGB
- **Transparency**: All logos have transparent backgrounds
- **Quality**: High resolution, optimized for web

### Sizes
- Original logos: Variable (maintains aspect ratio)
- App icon: 512x512px
- Favicon: 64x64px

## 🎨 Color Codes

- **Original Gold/Bronze**: Gradient from #d4af37 to #8b6914
- **Navy Blue**: #1a365d
- **Black**: #000000
- **White**: #ffffff
- **Bright Gold**: #ffd700

## 💡 Best Practices

1. **Always use PNG format** for web to maintain transparency
2. **Match logo color to background** for optimal contrast
3. **Use logo-icon.png** for all PWA and app icon needs
4. **Use favicon.png** specifically for browser tabs
5. **Test on both light and dark backgrounds** before deployment
6. **Maintain aspect ratio** when resizing
7. **Don't add backgrounds** to the transparent logos

## 🔄 Theme Switching

For applications with theme switching:

```javascript
// Example theme-aware logo switching
const Logo = ({ theme }) => {
  const logoSrc = theme === 'dark' ? '/logo-white.png' : '/logo-navy.png';
  return <img src={logoSrc} alt="SABR OS" />;
};
```

## 📞 Support

For questions about logo usage or to request additional variations, please contact the SABR OS development team.

---

**Last Updated**: January 2026  
**Version**: 1.0.0  
**Brand**: SABR OS - Islamic Productivity Operating System
