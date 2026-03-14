import Link from 'next/link'

export default function NotFound() {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#0e0e0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h1 style={{ color: '#fbbf24', fontSize: '2rem', fontStyle: 'italic', marginBottom: '1rem' }}>
            TaskFlow
          </h1>
          <h2 style={{ color: '#f4f4f0', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
            404 — Page not found
          </h2>
          <p style={{ color: '#888', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            The page you are looking for does not exist.
          </p>
          <Link
            href="/"
            style={{ padding: '0.5rem 1.25rem', background: '#f59e0b', color: '#0e0e0a', borderRadius: '8px', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}
          >
            Go home
          </Link>
        </div>
      </body>
    </html>
  )
}