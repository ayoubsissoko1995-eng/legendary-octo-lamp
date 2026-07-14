import logo from '../assets/crave-logo-master.svg'

export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-ink bg-paper">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#top" aria-label="CRAVE home" className="flex items-center">
          <img src={logo} alt="CRAVE" className="h-8 w-auto sm:h-9" />
        </a>
        <a
          href="#drop"
          className="border border-ink px-4 py-2 text-sm font-semibold uppercase tracking-wide transition-colors hover:bg-ink hover:text-paper"
        >
          Grab the drop
        </a>
      </div>
    </header>
  )
}
