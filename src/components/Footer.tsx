import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-card-border bg-card-bg mt-20">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <p className="text-accent font-mono font-bold text-lg">
              NotSoFool<span className="text-foreground">AI</span>
            </p>
            <p className="text-muted text-sm mt-2 leading-relaxed">
              AI-driven stock analysis. Full reasoning shown.
              No black boxes. No paywalls. No bull.
            </p>
          </div>
          <div>
            <p className="text-foreground font-mono text-sm font-semibold mb-3">Links</p>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/about" className="text-muted hover:text-accent transition-colors">About</Link>
              <Link href="/disclaimer" className="text-muted hover:text-accent transition-colors">Disclaimer</Link>
              <a href="https://x.com/notsofoolai" className="text-muted hover:text-accent transition-colors" target="_blank" rel="noopener noreferrer">X / Twitter</a>
            </div>
          </div>
          <div>
            <p className="text-foreground font-mono text-sm font-semibold mb-3">Legal</p>
            <p className="text-muted text-xs leading-relaxed">
              NotSoFoolAI is not affiliated with, endorsed by, or connected to
              The Motley Fool or any of its subsidiaries. All analysis is
              AI-generated for educational and entertainment purposes only.
              This is not financial advice.
            </p>
          </div>
        </div>
        <div className="border-t border-card-border mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted text-xs">
            &copy; {new Date().getFullYear()} NotSoFoolAI. All content is AI-generated.
          </p>
          <p className="text-muted text-xs">
            Not financial advice. Not affiliated with The Motley Fool.
          </p>
        </div>
      </div>
    </footer>
  );
}
