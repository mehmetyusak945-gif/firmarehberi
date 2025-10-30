import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardStats {
  totalFirms: number;
  totalCategories: number;
  todayFirms: number;
  yesterdayFirms: number;
  weekFirms: number;
  monthFirms: number;
  categoryDistribution: { name: string; count: number }[];
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      // Total firms
      const { count: totalFirms } = await supabase
        .from("firms")
        .select("*", { count: "exact", head: true })
        .eq("is_approved", true);

      // Total categories
      const { count: totalCategories } = await supabase
        .from("categories")
        .select("*", { count: "exact", head: true });

      // Today firms
      const { count: todayFirms } = await supabase
        .from("firms")
        .select("*", { count: "exact", head: true })
        .eq("is_approved", true)
        .gte("created_at", today.toISOString());

      // Yesterday firms
      const { count: yesterdayFirms } = await supabase
        .from("firms")
        .select("*", { count: "exact", head: true })
        .eq("is_approved", true)
        .gte("created_at", yesterday.toISOString())
        .lt("created_at", today.toISOString());

      // Week firms
      const { count: weekFirms } = await supabase
        .from("firms")
        .select("*", { count: "exact", head: true })
        .eq("is_approved", true)
        .gte("created_at", weekAgo.toISOString());

      // Month firms
      const { count: monthFirms } = await supabase
        .from("firms")
        .select("*", { count: "exact", head: true })
        .eq("is_approved", true)
        .gte("created_at", monthAgo.toISOString());

      // Category distribution
      const { data: categories } = await supabase
        .from("categories")
        .select("id, name");

      const categoryDistribution = await Promise.all(
        (categories || []).map(async (cat) => {
          const { count } = await supabase
            .from("firms")
            .select("*", { count: "exact", head: true })
            .eq("is_approved", true)
            .eq("category_id", cat.id);

          return {
            name: cat.name,
            count: count || 0,
          };
        })
      );

      // Sort by count and take top 10
      categoryDistribution.sort((a, b) => b.count - a.count);
      const topCategories = categoryDistribution.slice(0, 10);

      return {
        totalFirms: totalFirms || 0,
        totalCategories: totalCategories || 0,
        todayFirms: todayFirms || 0,
        yesterdayFirms: yesterdayFirms || 0,
        weekFirms: weekFirms || 0,
        monthFirms: monthFirms || 0,
        categoryDistribution: topCategories,
      } as DashboardStats;
    },
  });
}

export function useSerperAccount() {
  return useQuery({
    queryKey: ["serper-account"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("serper-account");
      
      if (error) {
        console.error("Serper account error:", error);
        return null;
      }

      return data;
    },
    retry: false,
  });
}
