"use client";

interface HeroProps {
  url: string;
  loading: boolean;
  onUrlChange: (url: string) => void;
  onSubmit: () => void;
}

export default function Hero({ url, loading, onUrlChange, onSubmit }: HeroProps) {
  return (
    <section className="flex flex-col items-center gap-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Video to Text<span className="text-yt-red">.</span>
      </h1>
      <p className="max-w-md text-text-secondary">
        Paste a YouTube link and get a formatted transcript with timestamps — instantly.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="mt-4 flex w-full max-w-[560px] flex-col gap-3 sm:flex-row sm:gap-0"
      >
        <div className="relative flex w-full items-center">
          <input
            type="text"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="h-12 w-full rounded-full border border-border bg-card px-5 pr-4 text-sm outline-none transition-colors placeholder:text-text-secondary focus:border-yt-red sm:rounded-r-none sm:pr-2"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="h-12 shrink-0 rounded-full bg-yt-red px-7 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50 sm:rounded-l-none"
        >
          {loading ? "CONVERTING..." : "CONVERT"}
        </button>
      </form>
    </section>
  );
}
