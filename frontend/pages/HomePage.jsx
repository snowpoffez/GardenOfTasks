export default function HomePage({ onGoToLogin }) {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center p-8"
      style={{ backgroundColor: 'var(--col-bg-page)' }}
    >
      <button
        type="button"
        onClick={onGoToLogin}
        className="px-8 py-4 rounded-lg text-lg font-semibold shadow btn-accent"
      >
        Log in
      </button>
    </div>
  )
}
