import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Loader2, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PageData {
  id: string;
  slug: string;
  title: string;
  content: string;
  meta_description: string | null;
  is_published: boolean;
}

const Page = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const { data, error } = await supabase
          .from("pages")
          .select("*")
          .eq("slug", slug)
          .eq("is_published", true)
          .maybeSingle();

        if (error) throw error;
        setPage(data);
      } catch (error) {
        console.error("Error fetching page:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchPage();
    }
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!page) {
    return (
      <>
        <SEOHead
          title="Sayfa Bulunamadı - Firmam.org"
          description="Aradığınız sayfa bulunamadı."
        />
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 container mx-auto px-4 py-16 text-center">
            <h1 className="text-3xl font-bold mb-4">Sayfa Bulunamadı</h1>
            <p className="text-muted-foreground mb-8">
              Aradığınız sayfa sistemimizde kayıtlı değil.
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium transition-base bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Ana Sayfaya Dön
            </Link>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title={`${page.title} - Firmam.org`}
        description={page.meta_description || page.title}
        canonical={`https://firmam.org/${page.slug}`}
      />

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 container mx-auto px-4 py-12">
          <article className="max-w-4xl mx-auto">
            <div className="bg-card rounded-xl border p-8 md:p-12 shadow-lg">
              <h1 className="text-3xl md:text-4xl font-bold mb-8">{page.title}</h1>
              <div
                className="prose prose-lg max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            </div>
          </article>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Page;