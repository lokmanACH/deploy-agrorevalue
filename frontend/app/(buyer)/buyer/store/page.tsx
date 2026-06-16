import { BuyerProductList } from "@/components/buyer/BuyerProductList";

export default function BuyerStorePage() {
  return <BuyerProductList title="Marché" allowedQualities={["A", "B"]} />;
}
