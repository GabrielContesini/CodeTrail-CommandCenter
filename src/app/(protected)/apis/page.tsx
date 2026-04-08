import { ApiCatalogPage } from "@/components/apis/api-catalog-page";
import { getApiCatalogSnapshot } from "@/lib/api-catalog-data";

export const dynamic = "force-dynamic";

export default async function ApisPage() {
  const snapshot = await getApiCatalogSnapshot();

  return <ApiCatalogPage snapshot={snapshot} />;
}
