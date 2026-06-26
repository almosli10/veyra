import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useTranslation } from 'react-i18next'

interface Category { id: number; name: string; icon: string; slug: string }
interface Place {
  id: number; name: string; slug: string; description: string
  address: string; rating: number; reviews_count: number
  image: string; featured: boolean; opening_hours?: string
  categories?: { name: string; icon: string }
}

function TiltCard({ children, style = {}, className = '' }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  function handleMove(e: React.MouseEvent) {
    const el = ref.current; if (!el) return
    const r = el.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width - 0.5) * 18
    const y = ((e.clientY - r.top) / r.height - 0.5) * -18
    el.style.transform = `perspective(800px) rotateX(${y}deg) rotateY(${x}deg) translateZ(16px) scale(1.03)`
    el.style.boxShadow = `${-x*1.5}px ${y*1.5}px 40px rgba(124,77,255,0.25), 0 20px 50px rgba(0,0,0,0.5)`
  }
  function handleLeave() {
    const el = ref.current; if (!el) return
    el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)'
    el.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)'
  }
  return (
    <div ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave}
      className={className}
      style={{ transition: 'transform 0.15s ease, box-shadow 0.15s ease', transformStyle: 'preserve-3d', ...style }}>
      {children}
    </div>
  )
}

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const [category, setCategory] = useState<Category | null>(null)
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'rating' | 'reviews' | 'newest'>('rating')
  const { t } = useTranslation()

  useEffect(() => { if (slug) fetchData() }, [slug])

  async function fetchData() {
    setLoading(true)
    const { data: cat } = await supabase.from('categories').select('*').eq('slug', slug).single()
    if (cat) {
      setCategory(cat)
      const { data: placesData } = await supabase.from('places').select('*, categories(name, icon)').eq('category_id', cat.id).order('rating', { ascending: false })
      if (placesData) setPlaces(placesData)
    }
    setLoading(false)
  }

  function getSortedPlaces() {
    const s = [...places]
    if (sortBy === 'rating') return s.sort((a, b) => b.rating - a.rating)
    if (sortBy === 'reviews') return s.sort((a, b) => b.reviews_count - a.reviews_count)
    return s
  }

  if (loading) {
    return (
      <div style={{ background: '#080C1A', minHeight: '100vh', padding: '40px 16px' }}>
        <div style={{ maxWidth: 1152, margin: '0 auto' }}>
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 24, height: 160, marginBottom: 32 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 20, height: 220 }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div style={{ background: '#080C1A', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontSize: 60 }}>😕</p>
        <p style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>{t('categoryNotFound')}</p>
        <Link to="/" style={{ background: 'linear-gradient(135deg,#7C4DFF,#00E5FF)', color: 'white', padding: '12px 28px', borderRadius: 16, textDecoration: 'none', fontWeight: 700 }}>
          {t('backHome')}
        </Link>
      </div>
    )
  }

  const sortedPlaces = getSortedPlaces()

  return (
    <div style={{ background: '#080C1A', minHeight: '100vh' }}>
      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
        @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        .glass { background:rgba(255,255,255,0.04); backdrop-filter:blur(24px); border:1px solid rgba(255,255,255,0.08); }
        .glass-strong { background:rgba(255,255,255,0.07); backdrop-filter:blur(40px); border:1px solid rgba(255,255,255,0.12); }
        .neon-border { border:1px solid rgba(124,77,255,0.35) !important; box-shadow:0 0 20px rgba(124,77,255,0.1); }
        .sort-btn { transition:all 0.2s ease; cursor:pointer; border:none; }
        .card-anim { animation: slideUp 0.5s ease both; }
      `}</style>

      <div style={{ position: 'relative', overflow: 'hidden', padding: '60px 16px 48px' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0B1020 0%, #1a0533 60%, #030812 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(124,77,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(124,77,255,0.05) 1px,transparent 1px)`, backgroundSize: '50px 50px' }} />
        <div style={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,77,255,0.2) 0%, transparent 70%)', animation: 'floatY 8s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,229,255,0.15) 0%, transparent 70%)', animation: 'floatY 10s ease-in-out infinite reverse' }} />

        <div style={{ maxWidth: 1152, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
            <Link to="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#a78bfa')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}>
              {t('home')}
            </Link>
            <span style={{ color: 'rgba(124,77,255,0.6)' }}>✦</span>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>{category.name}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <TiltCard>
              <div className="glass-strong neon-border" style={{ width: 72, height: 72, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34 }}>
                {category.icon}
              </div>
            </TiltCard>
            <div>
              <h1 style={{ fontSize: 36, fontWeight: 900, margin: '0 0 8px',
                background: 'linear-gradient(90deg, #fff, #a78bfa)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {category.name}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: 0 }}>
                <span style={{ color: '#00E5FF', fontWeight: 700 }}>{places.length}</span>&nbsp;{t('placesIn')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1152, margin: '0 auto', padding: '32px 16px' }}>

        {places.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: 0 }}>
              <span style={{ color: '#00E5FF', fontWeight: 700 }}>{sortedPlaces.length}</span> {t('results')}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {[{ key: 'rating', label: t('highestRated') }, { key: 'reviews', label: t('mostReviewed') }, { key: 'newest', label: t('newest') }].map(opt => (
                <button key={opt.key} onClick={() => setSortBy(opt.key as any)} className="sort-btn glass"
                  style={{
                    fontSize: 12, padding: '8px 16px', borderRadius: 12,
                    color: sortBy === opt.key ? 'white' : 'rgba(255,255,255,0.5)',
                    background: sortBy === opt.key ? 'linear-gradient(135deg,#7C4DFF,#00E5FF)' : 'rgba(255,255,255,0.04)',
                    border: sortBy === opt.key ? 'none' : '1px solid rgba(255,255,255,0.08)',
                    fontWeight: sortBy === opt.key ? 700 : 400,
                  }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {sortedPlaces.length === 0 ? (
          <div className="glass" style={{ textAlign: 'center', padding: '80px 0', borderRadius: 28 }}>
            <p style={{ fontSize: 50, marginBottom: 16 }}>{category.icon}</p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: 16, marginBottom: 8 }}>{t('noPlacesYet')}</p>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginBottom: 24 }}>{t('beFirst')}</p>
            <Link to="/add-place" style={{ display: 'inline-block', background: 'linear-gradient(135deg,#7C4DFF,#00E5FF)', color: 'white', fontSize: 13, padding: '12px 28px', borderRadius: 14, textDecoration: 'none', fontWeight: 700 }}>
              {t('addPlaceBtn')}
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
            {sortedPlaces.map((place, i) => (
              <Link key={place.id} to={`/place/${place.slug}`} style={{ textDecoration: 'none' }}>
                <TiltCard className="card-anim" style={{ borderRadius: 20, animationDelay: `${i * 0.06}s`, height: '100%' }}>
                  <div className="glass" style={{ borderRadius: 20, overflow: 'hidden', height: '100%', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ position: 'relative' }}>
                      <img
                        src={place.image && place.image !== 'EMPTY' ? place.image : 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'}
                        alt={place.name}
                        style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}
                      />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,12,26,0.8) 0%, transparent 55%)' }} />
                      {place.featured && (
                        <span style={{ position: 'absolute', top: 10, right: 10, background: 'linear-gradient(135deg,#7C4DFF,#00E5FF)', color: 'white', fontSize: 10, padding: '4px 10px', borderRadius: 999, fontWeight: 700 }}>✦ {t('featured')}</span>
                      )}
                      <div style={{ position: 'absolute', bottom: 10, left: 10 }}>
                        <span style={{ color: '#fbbf24', fontSize: 12, fontWeight: 700 }}>⭐ {place.rating}</span>
                      </div>
                    </div>
                    <div style={{ padding: '14px 14px 16px' }}>
                      <p style={{ fontWeight: 700, color: 'white', fontSize: 14, margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{place.name}</p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '0 0 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📍 {place.address}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{place.reviews_count} {t('reviews')}</span>
                        {place.opening_hours && (
                          <span style={{ fontSize: 10, color: '#34d399', background: 'rgba(52,211,153,0.1)', padding: '2px 8px', borderRadius: 999 }}>🕐 {place.opening_hours}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}