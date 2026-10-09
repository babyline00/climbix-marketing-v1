import { HomePageClient } from "@/components/site/home-client";
import { getHomeData } from "@/lib/homepage";
import { getHeaderData } from "@/lib/header";
import { getAllServices } from "@/lib/service-data";
import { getBrand } from "@/lib/settings";

// Revalidate homepage data every 30 seconds (admin edits also revalidate via revalidatePath)
export const revalidate = 30;

export default async function Home() {
  const [data, header, services, brand] = await Promise.all([
    getHomeData(),
    getHeaderData(),
    getAllServices(),
    getBrand(),
  ]);
  return (
    <HomePageClient
      data={data}
      header={header}
      services={services}
      brand={brand}
    />
  );
}
