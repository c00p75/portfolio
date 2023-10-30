import './globals.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import NavBar from '@/components/navbar/NavBar';
import { ThemeProvider } from './theme-provider';
import Footer from '@/components/footer/Footer';
import siteMetadata from "@/utils/siteMetaData";
import Loader from '@/components/loaders/responsiveDesignLoader/Loader';

export const metadata = {
  metadataBase: new URL(siteMetadata.siteUrl),
  title: "George M'sapenda | Portfolio",
  description: siteMetadata.description,
  openGraph: {
    title: siteMetadata.title,
    description: siteMetadata.description,
    url: siteMetadata.siteUrl,
    siteName: siteMetadata.title,
    images: [ siteMetadata.socialBanner],
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  twitter: {
    card: 'summary_large_image',
    title: siteMetadata.title,
    images: siteMetadata.socialBanner,
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="no-overflow">
        <Loader />
        <ThemeProvider>
          <NavBar />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
} 
