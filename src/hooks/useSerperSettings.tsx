import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SerperSettings {
  id: string;
  gl: string;
  hl: string;
  location: string;
  created_at: string;
  updated_at: string;
}

export const useSerperSettings = () => {
  return useQuery({
    queryKey: ["serper_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("serper_settings")
        .select("*")
        .single();

      if (error) throw error;
      return data as SerperSettings;
    },
  });
};

export const useUpdateSerperSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<SerperSettings>) => {
      const { data: existing } = await supabase
        .from("serper_settings")
        .select("id")
        .single();

      if (existing) {
        const { error } = await supabase
          .from("serper_settings")
          .update(settings)
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("serper_settings")
          .insert(settings);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serper_settings"] });
    },
  });
};