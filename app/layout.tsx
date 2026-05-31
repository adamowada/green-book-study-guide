import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Green Book Memorizer',
  description: 'A local-first scaffold for memorizing selected Green Book sections.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
