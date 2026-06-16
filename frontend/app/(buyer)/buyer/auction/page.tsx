import { BuyerProductList } from "@/components/buyer/BuyerProductList";

export default function BuyerAuctionPage() {
  return (
    <BuyerProductList
      title="Enchères"
      allowedQualities={["C"]}
      emptyStateDescription="Aucune enchère de qualité C n'est disponible pour le moment."
    />
  );
}
