import { useEffect, useState } from 'react';

export default function SafeHydrate({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Return null on server-side
  if (typeof window === 'undefined') return null;
  
  // Return null until component is mounted
  if (!mounted) return null;

  return <>{children}</>;
} 