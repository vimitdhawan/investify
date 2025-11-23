import Hero from "@/components/landing-page/hero";
import BusinessSolutions from "@/components/landing-page/solutions";
import Testimonials from "@/components/landing-page/testimonials";
import About from "@/components/landing-page/about";

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
