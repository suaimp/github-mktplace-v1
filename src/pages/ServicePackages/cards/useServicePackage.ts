import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import {
  getServiceCards,
  ServiceCard as ServiceCardType
} from "../../../services/db-services/marketplace-services/card/serviceCardService";

export function useServicePackage(id: string | undefined) {
  const [packageData, setPackageData] = useState<any>(null);
  useEffect(() => {
    const fetchPackage = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("publisher_services")
        .select("*")
        .eq("id", id)
        .single();
      if (error) setPackageData(null);
      else setPackageData(data);
    };
    fetchPackage();
  }, [id]);
  return packageData;
}

export function useServiceCards(id: string | undefined) {
  const [cards, setCards] = useState<ServiceCardType[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function fetchCards() {
      setLoading(true);
      const data = await getServiceCards();
      setCards(data ? data.filter((card) => card.service_id === id) : []);
      setLoading(false);
    }
    if (id) fetchCards();
  }, [id]);
  return { cards, setCards, loading, setLoading };
}
