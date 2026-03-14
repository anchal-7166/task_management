import Link from 'next/link'
import { CheckSquare, Shield, Zap, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-ink-950 bg-grid noise flex flex-col">
      {/* Nav */}
      <nav className="border-b border-ink-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="font-display text-xl text-amber-400 italic">TaskFlow</span>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost">Sign in</Link>
            <Link href="/register" className="btn-primary">Get started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 text-amber-400 text-sm mb-8">
            <Shield size={14} />
            <span>JWT Auth · AES Encryption · HTTP-only Cookies</span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-light text-ink-50 mb-6 leading-tight">
            Manage tasks with
            <br />
            <em className="text-gradient not-italic">production-grade</em> security
          </h1>

          <p className="text-ink-400 text-lg md:text-xl mb-10 max-w-xl mx-auto leading-relaxed font-light">
            Full-stack Next.js app with MongoDB, encrypted task descriptions,
            secure authentication, and paginated filtering.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link href="/register" className="btn-primary flex items-center gap-2 text-base px-6 py-3">
              Start managing tasks <ArrowRight size={16} />
            </Link>
            <Link href="/login" className="btn-secondary text-base px-6 py-3">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-ink-800 px-6 py-16">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Shield,
              title: 'Secure by Default',
              desc: 'HTTP-only cookies, bcrypt hashing, AES-256 encrypted descriptions',
            },
            {
              icon: CheckSquare,
              title: 'Full Task CRUD',
              desc: 'Create, filter by status, search by title, paginate—all via REST API',
            },
            {
              icon: Zap,
              title: 'Production Ready',
              desc: 'Zod validation, compound DB indexes, structured error responses',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass rounded-xl p-6 animate-fade-in">
              <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center mb-4">
                <Icon size={20} className="text-amber-400" />
              </div>
              <h3 className="font-display text-lg text-ink-100 mb-2">{title}</h3>
              <p className="text-ink-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}