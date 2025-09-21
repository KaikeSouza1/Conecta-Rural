// Caminho: app/page.tsx
import { Hero } from "@/components/Hero";
import { Stats } from "@/components/Stats";
import { ProductShowcase } from "@/components/ProductShowcase";

export default function HomePage() {
  return (
    <main>
      {/* Nova seção principal que combina o Hero e a Vitrine */}
      <section className="bg-white py-16 sm:py-24">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-8 items-center">
          <Hero />
          <ProductShowcase />
        </div>
      </section>

      <Stats />
    </main>
  );
}