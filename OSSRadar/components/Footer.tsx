export default function Footer() {
  return (
    <footer className="border-t border-edge">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:px-6">
        <p>
          Live data from the{" "}
          <a
            href="https://docs.github.com/en/rest"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-300 underline decoration-edge underline-offset-4 hover:text-accent"
          >
            GitHub REST API
          </a>{" "}
          · Built by the community, for the community.
        </p>
        <p className="flex items-center gap-4">
          <a
            href="https://github.com/Abdellox/Public_Projects/tree/main/OSSRadar"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent"
          >
            Source
          </a>
          <span aria-hidden>/</span>
          <span>MIT License</span>
        </p>
      </div>
    </footer>
  );
}
