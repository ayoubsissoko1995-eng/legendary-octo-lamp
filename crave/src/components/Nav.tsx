import wordmark from '../assets/crave-wordmark.svg'

export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-ink bg-paper">
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-[0_auto_1fr] items-center px-4 sm:grid-cols-[1fr_auto_1fr] sm:px-6">
        <span aria-hidden="true" />
        <a href="#top" aria-label="CRAVE home" className="flex items-center justify-self-start sm:justify-self-center">
          <img src={wordmark} alt="CRAVE" className="h-9 w-auto sm:h-12" />
        </a>
        <a
          href="#drop"
          className="justify-self-end border border-ink px-4 py-2 text-sm font-semibold uppercase tracking-wide transition-colors hover:bg-ink hover:text-paper"
        >
          Grab the drop
        </a>
      </div>
    </header>
  )
}
