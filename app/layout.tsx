import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ToastProvider } from "@/components/ToastProvider";
import SocialLinks from "@/components/SocialLinks";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-background text-foreground min-h-screen flex flex-col">
        <ToastProvider>
          <Navigation />
          <SocialLinks />
          <main className="flex-grow lg:pl-20">
            {children}
          </main>
          <Footer />
        </ToastProvider>
        <script src="/unregister-sw.js" defer />
      </body>
    </html>
  );
}