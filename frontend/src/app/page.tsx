"use client";

import { useState } from "react";
import { TranscriptResult } from "@/lib/types";
import { fetchTranscript } from "@/lib/api";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import OutputCard from "@/components/OutputCard";
import Footer from "@/components/Footer";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TranscriptResult | null>(null);

  async function handleSubmit() {
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await fetchTranscript(url);
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="mx-auto flex w-full max-w-[800px] flex-1 flex-col items-center gap-10 px-4 pt-28 pb-8">
        <Hero
          url={url}
          loading={loading}
          onUrlChange={setUrl}
          onSubmit={handleSubmit}
        />

        {error && (
          <div className="w-full max-w-[560px] rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        {result && <OutputCard result={result} url={url} loading={loading} />}
      </main>

      <Footer />
    </div>
  );
}
