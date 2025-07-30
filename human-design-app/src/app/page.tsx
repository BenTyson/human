import Hero from "@/components/landing/Hero";
import Background from "@/components/landing/Background";
import CallToAction from "@/components/landing/CallToAction";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Background />
      <CallToAction />
    </main>
  );
}
