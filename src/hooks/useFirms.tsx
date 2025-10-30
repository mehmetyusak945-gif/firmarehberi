import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Firm {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  landline_phone: string | null;
  mobile_phone: string | null;
  website: string | null;
  email: string | null;
  description: string | null;
  rating: number | null;
  is_approved: boolean;
  category_id: string | null;
  external_id: string | null;
  created_at: string;
  updated_at: string;
  categories?: {
    id: string;
    name: string;
    slug: string;
  };
}

export function useFirms(categoryId?: string) {
  return useQuery({
    queryKey: ["firms", categoryId],
    queryFn: async () => {
      // First get the total count
      const { count: totalCount } = await supabase
        .from("firms")
        .select("*", { count: 'exact', head: true })
        .eq("is_approved", true);

      let query = supabase
        .from("firms")
        .select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `)
        .eq("is_approved", true)
        .limit(10000); // Yüksek limit

      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }

      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      
      console.log('Total approved firms:', totalCount);
      
      // Store count in a global variable for use in components
      if (typeof window !== 'undefined') {
        (window as any).__TOTAL_FIRMS_COUNT__ = totalCount;
      }
      
      return data as Firm[];
    },
  });
}

export function useFirmBySlug(slug: string) {
  return useQuery({
    queryKey: ["firm", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("firms")
        .select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `)
        .eq("slug", slug)
        .eq("is_approved", true)
        .maybeSingle();

      if (error) throw error;
      return data as Firm | null;
    },
    enabled: !!slug,
  });
}

export function useUserFirmCount(userId?: string) {
  return useQuery({
    queryKey: ["user-firm-count", userId],
    queryFn: async () => {
      if (!userId) return 0;

      const { count, error } = await supabase
        .from("firms")
        .select("*", { count: "exact", head: true })
        .eq("added_by", userId);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!userId,
  });
}
