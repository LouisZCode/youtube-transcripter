"use client";

import { useState } from "react";
import { TranscriptResult } from "@/lib/types";
import { downloadPdf } from "@/lib/api";
import { ClipboardIcon, DownloadIcon, CheckIcon } from "./icons";

interface OutputCardProps {
  result: TranscriptResult;
  url: string;
  loading: boolean;
}

export default function OutputCard({ result, url, loading }: OutputCardProps) {
  const [copied, setCopied] = useState(false);

  const fullText = result.segments
    .map((s) => `${s.timestamp} ${s.text}`)
    .join("\n\n");

  async function handleCopy() {
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDownload() {
    await downloadPdf(url);
  }

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
          <button className="border-b-2 border-yt-red pb-2 text-sm font-bold">
            Transcript
          </button>
          <button
            disabled
            className="relative pb-2 text-sm text-text-secondary cursor-not-allowed"
          >
            Summary
            <span className="ml-1.5 inline-block rounded-full bg-border px-2 py-0.5 text-[10px] font-bold uppercase">
              Soon
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 pb-2">
          <div className="relative">
            <button
              onClick={handleCopy}
              className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-border/50"
              aria-label="Copy transcript"
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
          <button
            onClick={handleDownload}
            className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-border/50"
            aria-label="Download PDF"
          >
            <DownloadIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Meta info */}
      <div className="flex gap-4 border-b border-border px-5 py-2 text-xs text-text-secondary">
        <span>{result.word_count.toLocaleString()} words</span>
        <span>Source: {result.source === "captions" ? "Captions" : "Audio transcription"}</span>
      </div>

      {/* Transcript body */}
      <div className="max-h-[480px] overflow-y-auto px-5 py-4">
        <div className="space-y-4 font-mono text-sm leading-relaxed">
          {result.segments.map((seg, i) => (
            <p key={i}>
              <span className="font-bold text-yt-red">{seg.timestamp}</span>{" "}
              {seg.text}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
