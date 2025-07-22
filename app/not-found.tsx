import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8">
        <h2 className="text-4xl font-bold mb-4">404</h2>
        <p className="text-xl text-muted-foreground mb-6">
          Page not found
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity inline-block"
        >
          Go back home
        </Link>
      </div>
    </div>
  )
}