import Hero from '@/components/Hero';
import FeaturedArticles from '@/components/FeaturedArticles';
import CTASection from '@/components/CTASection';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  
  return (
    <>
      <Hero locale={locale} />
      <FeaturedArticles locale={locale} />
      <CTASection locale={locale} />
    </>
  );
}