import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AdCode {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
  created_at: string;
}

export const useAdCodes = () => {
  return useQuery({
    queryKey: ["ad_codes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ad_codes")
        .select("*")
        .eq("is_active", true)
        .order("created_at");

      if (error) throw error;
      return data as AdCode[];
    },
  });
};

// Hook to get a random ad code
export const useRandomAdCode = () => {
  const { data: adCodes, isLoading } = useAdCodes();
  
  const getRandomCode = () => {
    if (!adCodes || adCodes.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * adCodes.length);
    return adCodes[randomIndex];
  };

  return { getRandomCode, isLoading };
};
