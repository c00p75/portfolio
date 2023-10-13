import { cx } from '@/utils'
import './globals.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Inter, Manrope } from 'next/font/google'
import NavBar from '@/components/navbar/NavBar';

const inter = Inter({ subsets: ['latin'], display: "swap", variable: "--font-in" })
const manrope = Manrope({ subsets: ['latin'], display: "swap", variable: "--font-mr" })

export const metadata = {
  title: "George M'sapenda | Portfolio",
  description: "George M'sapenda portfolio and blog website",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={cx(inter.variable,
        manrope.variable,
        "font-mr bg-light dark:bg-dark"
      )}
      id='light'
      >
        <NavBar />
        {children}
      </body>
    </html>
  )
}
