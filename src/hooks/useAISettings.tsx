import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AISettings {
  id: string;
  provider: string;
  model: string;
  api_key: string | null;
  created_at: string;
  updated_at: string;
}

export const useAISettings = () => {
  return useQuery({
    queryKey: ["ai_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_settings")
        .select("*")
        .single();

      if (error) throw error;
      return data as AISettings;
    },
  });
};

export const useUpdateAISettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<AISettings>) => {
      // Get first record
      const { data: existing } = await supabase
        .from("ai_settings")
        .select("id")
        .single();

      if (existing) {
        const { error } = await supabase
          .from("ai_settings")
          .update(settings)
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("ai_settings")
          .insert(settings);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai_settings"] });
    },
  });
};
