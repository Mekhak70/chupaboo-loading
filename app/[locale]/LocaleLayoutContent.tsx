// components/LocaleLayoutContent.tsx
import { ReactNode } from "react";

interface LocaleLayoutContentProps {
  children: ReactNode;
  locale: string;
}

export async function LocaleLayoutContent({ children, locale }: LocaleLayoutContentProps) {
  const data = await fetchSomeData(locale); // async fetch
  return <>{children}</>; // կարող ես օգտագործել data rendering
}

// Example placeholder function
async function fetchSomeData(locale: string) {
  // իրական async fetch implementation
  return Promise.resolve({}); 
}
