import Hero from '@/features/landing-page/components/hero';
import BusinessSolutions from '@/features/landing-page/components/solutions';
import Testimonials from '@/features/landing-page/components/testimonials';
import About from '@/features/landing-page/components/about';

export default function Home() {
  return (
    <>
      <Hero />
      <BusinessSolutions />
      <Testimonials />
      <About />
    </>
  );
}
