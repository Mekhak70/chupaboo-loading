import HomePageClient from "./HomePageClient";
import { getHomepageData } from "@/lib/homepage-data";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function HomePage({
  params,
}: PageProps) {
  const { locale } = await params;

  const language = ["hy", "en", "ru", "pl"].includes(locale)
    ? locale
    : "hy";

  const initialData = await getHomepageData(language);

  return (
    <HomePageClient
      key={language}
      initialData={initialData}
    />
  );
}