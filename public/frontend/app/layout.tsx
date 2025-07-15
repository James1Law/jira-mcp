import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'James\'s Jira Bot',
  description: 'MCP for Jira',
  generator: 'James\'s Jira Bot',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <title>James's Jira Bot</title>
      </head>
      <body>{children}</body>
    </html>
  )
}
