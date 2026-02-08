import { GitHubIcon } from "./icons";

export default function Footer() {
  return (
    <footer className="flex items-center justify-center gap-2 py-8 text-sm text-text-secondary">
      <span>TubeText</span>
      <span>&middot;</span>
      <a
        href="https://github.com/luiszg/Youtube_2_Text"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 transition-colors hover:text-foreground"
      >
        <GitHubIcon className="h-4 w-4" />
        <span>GitHub</span>
      </a>
    </footer>
  );
}
