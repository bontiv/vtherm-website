# Versatile Thermostat Website

This is a [Next.js](https://nextjs.org) community website for Versatile Thermostat, featuring multilingual documentation and an integrated search powered by Pagefind.

## Features

- 📚 Multilingual documentation (EN, FR, DE)
- 🔍 Full-text search with Pagefind
- 🌐 Static site generation for optimal performance
- 🎨 Responsive design with dark mode support

## Getting Started

### Installation

```bash
npm install
```

### First Time Setup

Before starting development, you need to build the site once to generate the search index:

```bash
npm run build
```

This command will:
1. Generate the static site in `/out`
2. Create the Pagefind search index
3. Copy the index to `/public/pagefind/` for development use

### Development

```bash
npm run dev
```

The dev script automatically copies the Pagefind index before starting the development server.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Development without Search

If you want to start the dev server without the search functionality:

```bash
npm run dev:clean
```

### Updating the Search Index

If you make significant changes to the documentation and want to update the search index:

```bash
npm run build
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server with search enabled
- `npm run dev:clean` - Start development server without search setup
- `npm run build` - Build for production and generate search index
- `npm run start` - Start production server (requires `npm run build` first)
- `npm run lint` - Run ESLint

## Project Structure

```
vtherm-website/
├── app/                    # Next.js app directory
│   ├── [lng]/             # Language-specific routes
│   │   └── docs/          # Documentation pages
├── components/            # React components
│   ├── layout/           # Layout components (Header, Footer, etc.)
│   └── search/           # Pagefind search component
├── plans/                # Implementation plans and guides
├── scripts/              # Build and dev scripts
└── public/               # Static assets
```

## Documentation

- [Pagefind Implementation Plan](./plans/pagefind-implementation.md) - Complete implementation guide
- [Pagefind Testing Guide](./plans/pagefind-testing-guide.md) - Testing checklist and validation
- [Pagefind Dev Mode](./plans/pagefind-dev-mode.md) - Development mode setup explanation

## Technologies

- [Next.js 16](https://nextjs.org/) - React framework
- [Pagefind](https://pagefind.app/) - Static search library
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [i18next](https://www.i18next.com/) - Internationalization

## Contributing

When contributing to the documentation:

1. Add or modify documentation files in the repository
2. Run `npm run build` to regenerate the search index
3. Test your changes with `npm run dev`

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Pagefind Documentation](https://pagefind.app/)
- [Versatile Thermostat GitHub](https://github.com/jmcollin78/versatile_thermostat)

