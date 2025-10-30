import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface WebmasterSettings {
  id: string;
  google_search_console_meta: string | null;
  yandex_webmaster_meta: string | null;
  bing_webmaster_meta: string | null;
  google_analytics_code: string | null;
  created_at: string;
  updated_at: string;
}

export const useWebmasterSettings = () => {
  return useQuery({
    queryKey: ["webmaster_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("webmaster_settings")
        .select("*")
        .single();

      if (error) throw error;
      return data as WebmasterSettings;
    },
  });
};

export const useUpdateWebmasterSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<WebmasterSettings>) => {
      // Get first record
      const { data: existing } = await supabase
        .from("webmaster_settings")
        .select("id")
        .single();

      if (existing) {
        const { error } = await supabase
          .from("webmaster_settings")
          .update(settings)
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("webmaster_settings")
          .insert(settings);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webmaster_settings"] });
    },
  });
};
