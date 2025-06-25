import "../globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ToastProvider } from "@/components/ToastProvider";
import SocialLinks from "@/components/SocialLinks";
import { locales } from "@/middleware";
import { notFound } from "next/navigation";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Props) {
  const { locale } = await params;
  
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  return (
    <html lang={locale} className="dark">
      <body className="antialiased bg-background text-foreground min-h-screen flex flex-col">
        <ToastProvider>
          <Navigation locale={locale} />
          <SocialLinks />
          <main className="flex-grow lg:pl-20">
            {children}
          </main>
          <Footer locale={locale} />
        </ToastProvider>
        <script src="/unregister-sw.js" defer />
      </body>
    </html>
  );
}