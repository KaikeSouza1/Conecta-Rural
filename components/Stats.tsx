// Caminho: components/Stats.tsx

'use client';

import { useEffect, useState } from 'react';

interface StatsData {
  produtores: number;
  produtos: number;
  avaliacao: number;
}

export function Stats() {
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          setStats(await response.json());
        }
      } catch (error) {
        console.error('Falha ao carregar estatísticas:', error);
      }
    }
    fetchStats();
  }, []);

  return (
    <section className="bg-emerald-50 py-12 sm:py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-center">
          {/* Estatística 1: Produtores */}
          <div>
            <p className="text-4xl font-bold text-emerald-600">
              {stats ? `${stats.produtores}+` : '...'}
            </p>
            <p className="mt-1 text-sm font-medium text-gray-500 uppercase tracking-wider">
              Produtores
            </p>
          </div>
          {/* Estatística 2: Produtos */}
          <div>
            <p className="text-4xl font-bold text-emerald-600">
              {stats ? `${stats.produtos}+` : '...'}
            </p>
            <p className="mt-1 text-sm font-medium text-gray-500 uppercase tracking-wider">
              Produtos
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}