export default function HomePage({ onGoToLogin, onDevEnter }) {
  return (
    <div className="home-hero min-h-full flex flex-col">
      {/* Optional: add a nature wallpaper in frontend/public/ (e.g. public/hero.jpg)
          and in index.css set .home-hero { background-image: url('/hero.jpg'); } */}

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <h1
          className="text-4xl sm:text-5xl font-bold tracking-tight mb-3"
          style={{ color: 'var(--col-text-heading)' }}
        >
          Garden of Tasks
        </h1>
        <p
          className="text-lg sm:text-xl max-w-md mb-2 font-medium"
          style={{ color: 'var(--col-green-800)' }}
        >
          Grow your habits. Tame your to-dos.
        </p>
        <p
          className="text-sm sm:text-base max-w-lg mb-10"
          style={{ color: 'var(--col-text-muted)' }}
        >
          Track dailies and tasks in a calm, focused space. Complete what matters and watch your garden thrive.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={onGoToLogin}
            className="px-8 py-4 rounded-xl text-lg font-semibold shadow-lg btn-accent hover:scale-[1.02] transition-transform"
          >
            Log in
          </button>
          {onDevEnter && (
            <button
              type="button"
              onClick={onDevEnter}
              className="text-sm font-medium px-4 py-2 rounded-lg border-2 border-dashed opacity-70 hover:opacity-100 transition-opacity"
              style={{ borderColor: 'var(--col-text-muted)', color: 'var(--col-text-muted)' }}
            >
              DEV: SKIP LOGIN
            </button>
          )}
        </div>
      </div>

      <footer
        className="py-4 text-center text-sm"
        style={{ color: 'var(--col-text-muted)' }}
      >
        The Greenhouse · The Garden · The Arboretum
      </footer>
    </div>
  )
}
