import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Listly - Smart Shopping Companion',
    short_name: 'Listly',
    description:
      'Mobile-first PWA for smart shopping list management with real-time collaboration, AI suggestions, and pantry tracking.',
    id: '/',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    screenshots: [
      {
        src: '/screenshots/mobile.png',
        sizes: '390x844',
        type: 'image/png',
      },
    ],
    categories: ['productivity', 'shopping', 'utilities'],
  };
}
