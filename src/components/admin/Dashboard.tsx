import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStats, useSerperAccount } from "@/hooks/useDashboardStats";
import {
  Building2,
  FolderTree,
  TrendingUp,
  Calendar,
  Clock,
  CalendarDays,
  Zap,
  Brain,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(142, 71%, 45%)",
  "hsl(346, 77%, 50%)",
];

export function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: serperAccount, isLoading: serperLoading } = useSerperAccount();

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Toplam Firma",
      value: stats?.totalFirms || 0,
      icon: Building2,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Toplam Kategori",
      value: stats?.totalCategories || 0,
      icon: FolderTree,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      title: "Bugün Eklenen",
      value: stats?.todayFirms || 0,
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Dün Eklenen",
      value: stats?.yesterdayFirms || 0,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Bu Hafta",
      value: stats?.weekFirms || 0,
      icon: CalendarDays,
      color: "text-purple-600",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Bu Ay",
      value: stats?.monthFirms || 0,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-500/10",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          Dashboard
        </h2>
        <p className="text-muted-foreground mt-1">
          Sistem istatistikleri ve genel bakış
        </p>
      </div>

      {/* API Credits Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-2 hover:shadow-lg transition-shadow animate-scale-in">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Zap className="mr-2 h-5 w-5 text-yellow-500" />
              Serper API Kredisi
            </CardTitle>
          </CardHeader>
          <CardContent>
            {serperLoading ? (
              <Skeleton className="h-12 w-32" />
            ) : serperAccount ? (
              <div className="space-y-2">
                <div className="text-4xl font-bold text-yellow-600">
                  {serperAccount.balance?.toLocaleString() || 0}
                </div>
                <p className="text-sm text-muted-foreground">
                  Kalan arama kredisi
                </p>
                {serperAccount.rateLimit && (
                  <p className="text-xs text-muted-foreground">
                    Limit: {serperAccount.rateLimit} istek/dakika
                  </p>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                API bağlantısı kurulamadı
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow animate-scale-in">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Brain className="mr-2 h-5 w-5 text-purple-500" />
              AI Model Bilgisi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm font-medium">Lovable AI</div>
              <p className="text-xs text-muted-foreground">
                Sınırsız kullanım (Entegre)
              </p>
              <div className="text-xs text-muted-foreground mt-2">
                💡 OpenAI API kullanıyorsanız, kredi bilgisi OpenAI
                hesabınızdan kontrol edilebilir.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, index) => (
          <Card
            key={stat.title}
            className="hover:shadow-lg transition-all hover:-translate-y-1 duration-300 animate-scale-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${stat.color}`}>
                {stat.value.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Bar Chart - Top 10 Categories */}
        <Card className="hover:shadow-lg transition-shadow animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-primary" />
              En Çok Firma Olan Kategoriler (Top 10)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.categoryDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 11 }}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="hsl(var(--primary))"
                  radius={[8, 8, 0, 0]}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart - Top 10 Categories */}
        <Card className="hover:shadow-lg transition-shadow animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FolderTree className="mr-2 h-5 w-5 text-secondary" />
              Kategori Dağılımı (Top 10)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats?.categoryDistribution || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="hsl(var(--primary))"
                  dataKey="count"
                  animationDuration={1000}
                >
                  {(stats?.categoryDistribution || []).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Card */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 animate-fade-in">
        <CardHeader>
          <CardTitle className="text-xl">📊 Özet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Günlük Ortalama</p>
              <p className="text-2xl font-bold text-primary">
                {stats?.monthFirms
                  ? Math.round(stats.monthFirms / 30)
                  : 0}{" "}
                <span className="text-sm font-normal">firma/gün</span>
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Kategori Başına Ortalama</p>
              <p className="text-2xl font-bold text-secondary">
                {stats?.totalCategories && stats?.totalFirms
                  ? Math.round(stats.totalFirms / stats.totalCategories)
                  : 0}{" "}
                <span className="text-sm font-normal">firma</span>
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Büyüme Trendi</p>
              <p className="text-2xl font-bold text-green-600">
                {stats?.todayFirms && stats?.yesterdayFirms
                  ? stats.todayFirms > stats.yesterdayFirms
                    ? "📈 Artış"
                    : stats.todayFirms < stats.yesterdayFirms
                    ? "📉 Azalış"
                    : "➡️ Stabil"
                  : "➡️ Stabil"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
