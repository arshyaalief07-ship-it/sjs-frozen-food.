import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import { SettingsMap } from '@/types'
import { publicImageUrl } from '@/lib/supabaseClient'

export default function Hero({ settings }: { settings: SettingsMap }) {
  const heroImage = publicImageUrl('site-images', settings.hero_image_path)

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white">
      <div className="container-app grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-2 lg:py-24">
        <div className="reveal text-center lg:text-left">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-4 py-1.5 text-xs font-bold text-brand-700">
            <Sparkles className="h-3.5 w-3.5" /> Frozen Food Terpercaya
          </span>
          <h1 className="font-display text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
            {settings.hero_title}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base text-slate-500 lg:mx-0">{settings.hero_subtitle}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Link to="/produk" className="btn-primary">
              {settings.hero_cta_text} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/promo" className="btn-secondary">
              {settings.hero_cta_secondary_text}
            </Link>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="absolute -z-10 h-64 w-64 rounded-full bg-brand-200/50 blur-3xl sm:h-80 sm:w-80" />
          {heroImage ? (
            <img
              src={heroImage}
              alt="Produk frozen food SJS"
              className="relative z-10 w-full max-w-md animate-float rounded-3xl object-cover shadow-soft"
            />
          ) : (
            <div className="relative z-10 grid w-full max-w-md grid-cols-2 gap-4">
              {['🍗', '🌭', '🍡', '🦐'].map((emoji, i) => (
                <div
                  key={i}
                  className="flex aspect-square animate-float items-center justify-center rounded-3xl bg-white text-6xl shadow-soft"
                  style={{ animationDelay: `${i * 0.3}s` }}
                >
                  {emoji}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
