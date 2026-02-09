"use client";

import { useState } from "react";
import { TranscriptResult } from "@/lib/types";
import { downloadPdf, fetchSummary } from "@/lib/api";
import { ClipboardIcon, DownloadIcon, CheckIcon, SparklesIcon, GlobeIcon } from "./icons";

interface OutputCardProps {
  result: TranscriptResult;
  url: string;
  loading: boolean;
}

function TransformContent({
  summary,
  summaryLoading,
  summaryError,
  onSummarize,
}: {
  summary: string | null;
  summaryLoading: boolean;
  summaryError: string | null;
  onSummarize: () => void;
}) {
  if (summaryLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-text-secondary">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
        <span className="text-sm">Generating summary...</span>
      </div>
    );
  }

  if (summaryError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <p className="text-sm text-red-500">{summaryError}</p>
        <button
          onClick={onSummarize}
          className="rounded-lg bg-yt-red px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-yt-red-hover"
        >
          Retry
        </button>
      </div>
    );
  }

  if (summary) {
    return (
      <div className="whitespace-pre-wrap text-sm leading-relaxed">
        {summary}
      </div>
    );
  }

  // Default: action cards
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Summarize card */}
      <button
        onClick={onSummarize}
        className="group flex flex-col items-center gap-3 rounded-xl border border-border p-6 transition-colors hover:border-yt-red hover:bg-yt-red/5"
      >
        <SparklesIcon className="h-8 w-8 text-yt-red transition-transform group-hover:scale-110" />
        <span className="text-sm font-semibold">Summarize</span>
        <span className="text-xs text-text-secondary">
          Generate a concise summary of the transcript
        </span>
      </button>

      {/* Translate card (disabled) */}
      <div className="relative flex flex-col items-center gap-3 rounded-xl border border-border p-6 opacity-50 cursor-not-allowed">
        <span className="absolute right-3 top-3 rounded-full bg-border px-2 py-0.5 text-[10px] font-bold uppercase">
          Soon
        </span>
        <GlobeIcon className="h-8 w-8 text-text-secondary" />
        <span className="text-sm font-semibold">Translate</span>
        <span className="text-xs text-text-secondary">
          Translate the transcript to another language
        </span>
      </div>
    </div>
  );
}

export default function OutputCard({ result, url, loading }: OutputCardProps) {
  const [activeTab, setActiveTab] = useState<"transcript" | "transform">("transcript");
  const [copied, setCopied] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const fullText = result.segments
    .map((s) => `${s.timestamp} ${s.text}`)
    .join("\n\n");

  async function handleCopy() {
    const textToCopy = activeTab === "transform" && summary ? summary : fullText;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDownload() {
    await downloadPdf(url);
  }

  async function handleSummarize() {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const transcription = result.segments.map((s) => s.text).join(" ");
      const data = await fetchSummary(transcription);
      setSummary(data.summary);
    } catch (err) {
      setSummaryError(err instanceof Error ? err.message : "Failed to generate summary");
    } finally {
      setSummaryLoading(false);
    }
  }

  const showCopy = activeTab === "transcript" || summary !== null;
  const showDownload = activeTab === "transcript";

  return (
    <div className="animate-slide-up w-full max-w-[800px] overflow-hidden rounded-xl border border-border bg-card">
      {/* Loading bar */}
      {loading && (
        <div className="h-1 w-full overflow-hidden bg-border">
          <div className="animate-indeterminate h-full w-1/4 rounded bg-yt-red" />
        </div>
      )}

      {/* Tabs + Actions */}
      <div className="flex items-center justify-between border-b border-border px-5 pt-3">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("transcript")}
            className={`pb-2 text-sm font-bold transition-colors ${
              activeTab === "transcript"
                ? "border-b-2 border-yt-red"
                : "text-text-secondary hover:text-foreground"
            }`}
          >
            Transcript
          </button>
          <button
            onClick={() => setActiveTab("transform")}
            className={`pb-2 text-sm font-bold transition-colors ${
              activeTab === "transform"
                ? "border-b-2 border-yt-red"
                : "text-text-secondary hover:text-foreground"
            }`}
          >
            Transform
          </button>
        </div>

        <div className="flex items-center gap-2 pb-2">
          {showCopy && (
            <div className="relative">
              <button
                onClick={handleCopy}
                className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-border/50"
                aria-label={activeTab === "transform" ? "Copy summary" : "Copy transcript"}
              >
                {copied ? (
                  <CheckIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <ClipboardIcon className="h-4 w-4" />
                )}
              </button>
              {copied && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-2 py-1 text-xs text-background">
                  Copied!
                </span>
              )}
            </div>
          )}
          {showDownload && (
            <button
              onClick={handleDownload}
              className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-border/50"
              aria-label="Download PDF"
            >
              <DownloadIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Meta info — Transcript tab only */}
      {activeTab === "transcript" && (
        <div className="flex gap-4 border-b border-border px-5 py-2 text-xs text-text-secondary">
          <span>{result.word_count.toLocaleString()} words</span>
          <span>Source: {result.source === "captions" ? "Captions" : "Audio transcription"}</span>
        </div>
      )}

      {/* Content area */}
      <div className="max-h-[480px] overflow-y-auto px-5 py-4">
        {activeTab === "transcript" ? (
          <div className="space-y-4 font-mono text-sm leading-relaxed">
            {result.segments.map((seg, i) => (
              <p key={i}>
                <span className="font-bold text-yt-red">{seg.timestamp}</span>{" "}
                {seg.text}
              </p>
            ))}
          </div>
        ) : (
          <TransformContent
            summary={summary}
            summaryLoading={summaryLoading}
            summaryError={summaryError}
            onSummarize={handleSummarize}
          />
        )}
      </div>
    </div>
  );
}
