import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DevOps Intelligence Platform | AI Agents Assemble Hackathon',
  description: 'Autonomous AI agent system for DevOps incident response and resolution. Built with Kestra, Cline CLI, Vercel, and CodeRabbit.',
  keywords: [
    'DevOps',
    'AI Agents',
    'Automation',
    'Kestra',
    'Cline CLI',
    'Vercel',
    'CodeRabbit',
    'Hackathon',
    'Incident Response',
    'Autonomous Systems'
  ],
  authors: [{ name: 'DevOps Intelligence Team' }],
  creator: 'DevOps Intelligence Platform',
  publisher: 'Vercel',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://devops-intelligence.vercel.app',
    title: 'DevOps Intelligence Platform',
    description: 'Autonomous AI agent system for DevOps incident response and resolution',
    siteName: 'DevOps Intelligence Platform',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'DevOps Intelligence Platform - AI Agents Assemble Hackathon',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DevOps Intelligence Platform',
    description: 'Autonomous AI agent system for DevOps incident response and resolution',
    images: ['/og-image.png'],
    creator: '@devops_intelligence',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          as="style"
        />
        
        {/* Performance and Analytics */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Performance monitoring
              window.addEventListener('load', function() {
                if ('performance' in window) {
                  const perfData = performance.getEntriesByType('navigation')[0];
                  console.log('Page Load Time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
                }
              });
              
              // Error tracking
              window.addEventListener('error', function(e) {
                console.error('Global Error:', e.error);
              });
              
              // Unhandled promise rejections
              window.addEventListener('unhandledrejection', function(e) {
                console.error('Unhandled Promise Rejection:', e.reason);
              });
            `,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased bg-gray-50 dark:bg-dark-900`}>
        <Providers>
          <div className="min-h-screen">
            {children}
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Providers>
        
        {/* Hackathon Badge */}
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>AI Agents Assemble Hackathon</span>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
