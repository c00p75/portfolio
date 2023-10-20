import { cx } from '@/utils'
import './globals.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Inter, Manrope } from 'next/font/google'
import NavBar from '@/components/navbar/NavBar';
import { ThemeProvider } from './theme-provider';
import Footer from '@/components/footer/Footer';

const inter = Inter({ subsets: ['latin'], display: "swap", variable: "--font-in" })
const manrope = Manrope({ subsets: ['latin'], display: "swap", variable: "--font-mr" })

export const metadata = {
  title: "George M'sapenda | Portfolio",
  description: "George M'sapenda portfolio and blog website",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/public/code-symbol.png" />
      </head>
      <body className={cx(inter.variable,
        manrope.variable,
        "font-mr bg-light dark:bg-dark"
      )}
      >
        <ThemeProvider>
          <NavBar />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
