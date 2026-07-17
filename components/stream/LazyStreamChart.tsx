import dynamic from 'next/dynamic';

// Splits the chart engine into an isolated asynchronous chunk loaded on demand
export const LazyStreamChart = dynamic(
  () => import('./StreamChartCard'),
  {
    ssr: false, // Prevents client hydration layout blocks during initial page render
    loading: () => (
      <div 
        className="h-64 w-full animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded-lg" 
        aria-hidden="true"
      />
    ),
  }
);