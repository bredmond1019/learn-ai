export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This layout is required by Next.js but the middleware handles redirects
  return children
}