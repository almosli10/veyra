import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface Place {
  id: number; name: string; name_ku?: string; slug: string; category_id: number
  description: string; address: string; phone?: string; whatsapp?: string
  website?: string; latitude?: number; longitude?: number; opening_hours?: string
  rating: number; reviews_count: number; image: string; featured: boolean
  categories?: { name: string; icon: string }
}
interface Review {
  id: number; rating: number; comment: string; created_at: string
  user_id?: string
}
interface PlaceImage {
  id: number; image_url: string
}

function TiltCard({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null)
  function onMove(e: React.MouseEvent) {
    const el = ref.current; if (!el) return
    const r = el.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width - 0.5) * 14
    const y = ((e.clientY - r.top) / r.height - 0.5) * -14
    el.style.transform = `perspective(800px) rotateX(${y}deg) rotateY(${x}deg) translateZ(10px)`
  }
  function onLeave() {
    const el = ref.current; if (!el) return
    el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)'
  }
  return <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={{ transition: 'transform 0.15s ease', transformStyle: 'preserve-3d', ...style }}>{children}</div>
}

export default function PlacePage() {
  const { slug } = useParams<{ slug: string }>()
  const [place, setPlace] = useState<Place | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [profiles, setProfiles] = useState<{[key: string]: string}>({})
  const [placeImages, setPlaceImages] = useState<PlaceImage[]>([])
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'info' | 'reviews' | 'map'>('info')
  const [isFavorite, setIsFavorite] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewHover, setReviewHover] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewSuccess, setReviewSuccess] = useState(false)
  const [reviewError, setReviewError] = useState('')

  useEffect(() => { if (slug) fetchPlace(); checkUser() }, [slug])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (lightboxIndex === null) return
      const allImages = getAllImages()
      if (e.key === 'ArrowRight') setLightboxIndex(i => i !== null ? (i + 1) % allImages.length : null)
      if (e.key === 'ArrowLeft') setLightboxIndex(i => i !== null ? (i - 1 + allImages.length) % allImages.length : null)
      if (e.key === 'Escape') setLightboxIndex(null)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxIndex, placeImages, place])

  function getAllImages() {
    const imgs: string[] = []
    if (place?.image && place.image !== 'EMPTY') imgs.push(place.image)
    placeImages.forEach(img => imgs.push(img.image_url))
    return imgs
  }

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  async function fetchPlace() {
    setLoading(true)
    const { data } = await supabase.from('places').select('*, categories(name, icon)').eq('slug', slug).single()
    if (data) {
      setPlace(data)
      const { data: revData } = await supabase.from('reviews').select('*').eq('place_id', data.id).order('created_at', { ascending: false }).limit(10)
      if (revData) {
        setReviews(revData)
        const userIds = [...new Set(revData.map((r: any) => r.user_id))]
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase.from('profiles').select('id, full_name').in('id', userIds)
          if (profilesData) {
            const profilesMap: {[key: string]: string} = {}
            profilesData.forEach((p: any) => { profilesMap[p.id] = p.full_name })
            setProfiles(profilesMap)
          }
        }
      }
      const { data: imagesData } = await supabase.from('place_images').select('*').eq('place_id', data.id).order('created_at', { ascending: true })
      if (imagesData) setPlaceImages(imagesData)

      const { data: { user: cu } } = await supabase.auth.getUser()
      if (cu) {
        const { data: fav } = await supabase.from('favorites').select('id').eq('user_id', cu.id).eq('place_id', data.id).single()
        setIsFavorite(!!fav)
      }
    }
    setLoading(false)
  }

  async function toggleFavorite() {
    if (!user || favoriteLoading) return
    setFavoriteLoading(true)
    if (isFavorite) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('place_id', place!.id)
      setIsFavorite(false)
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, place_id: place!.id })
      setIsFavorite(true)
    }
    setFavoriteLoading(false)
  }

  async function submitReview() {
    if (!user) { setReviewError('يجب تسجيل الدخول أولاً'); return }
    if (reviewRating === 0) { setReviewError('اختر عدد النجوم'); return }
    setReviewLoading(true); setReviewError('')
    const { error } = await supabase.from('reviews').insert({ place_id: place!.id, user_id: user.id, rating: reviewRating, comment: reviewComment.trim() })
    if (error) { setReviewError(error.message) }
    else { setReviewSuccess(true); setReviewRating(0); setReviewComment(''); await fetchPlace(); setTimeout(() => setReviewSuccess(false), 3000) }
    setReviewLoading(false)
  }

  function renderStars(rating: number, size = 16) {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < Math.round(rating) ? '#fbbf24' : 'rgba(255,255,255,0.15)', fontSize: size }}>★</span>
    ))
  }

  if (loading) return (
    <div style={{ background: '#080C1A', minHeight: '100vh', padding: '40px 16px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 28, height: 320, marginBottom: 24 }} />
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 20, height: 60, marginBottom: 16, width: '60%' }} />
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 20, height: 200 }} />
      </div>
    </div>
  )

  if (!place) return (
    <div style={{ background: '#080C1A', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: 60 }}>😕</p>
      <p style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>المكان غير موجود</p>
      <Link to="/" style={{ background: 'linear-gradient(135deg,#7C4DFF,#00E5FF)', color: 'white', padding: '12px 28px', borderRadius: 16, textDecoration: 'none', fontWeight: 700 }}>العودة للرئيسية</Link>
    </div>
  )

  const allImages = getAllImages()

  return (
    <div style={{ background: '#080C1A', minHeight: '100vh' }}>
      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .glass { background:rgba(255,255,255,0.04); backdrop-filter:blur(24px); border:1px solid rgba(255,255,255,0.08); }
        .glass-strong { background:rgba(255,255,255,0.07); backdrop-filter:blur(40px); border:1px solid rgba(255,255,255,0.12); }
        .neon-border { border:1px solid rgba(124,77,255,0.3) !important; }
        .tab-btn { transition:all 0.25s ease; cursor:pointer; border:none; }
        .info-row { transition: background 0.2s; border-radius: 14px; padding: 12px; }
        .info-row:hover { background: rgba(124,77,255,0.08); }
        textarea { resize:none; outline:none; }
        textarea::placeholder { color:rgba(255,255,255,0.25); }
        .star-btn { background:none; border:none; cursor:pointer; transition:transform 0.15s; padding:0; }
        .star-btn:hover { transform:scale(1.2); }
        .fav-btn { transition:all 0.3s ease; border:none; cursor:pointer; }
        .leaflet-container { border-radius: 0; }
        .thumb-img { cursor:pointer; transition: transform 0.2s, opacity 0.2s; border-radius: 12px; object-fit: cover; }
        .thumb-img:hover { transform: scale(1.05); opacity: 0.85; }
      `}</style>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div onClick={() => setLightboxIndex(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease' }}>
          <button onClick={e => { e.stopPropagation(); setLightboxIndex(i => i !== null ? (i - 1 + allImages.length) % allImages.length : null) }}
            style={{ position: 'absolute', left: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: 28, width: 52, height: 52, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
          <img src={allImages[lightboxIndex]} alt="" onClick={e => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 16, objectFit: 'contain', boxShadow: '0 0 60px rgba(0,0,0,0.8)' }} />
          <button onClick={e => { e.stopPropagation(); setLightboxIndex(i => i !== null ? (i + 1) % allImages.length : null) }}
            style={{ position: 'absolute', right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: 28, width: 52, height: 52, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
          <button onClick={() => setLightboxIndex(null)}
            style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: 20, width: 44, height: 44, borderRadius: '50%', cursor: 'pointer' }}>✕</button>
          <p style={{ position: 'absolute', bottom: 20, color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{lightboxIndex + 1} / {allImages.length}</p>
        </div>
      )}

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px 60px' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: 12, color: 'rgba(255,255,255,0.35)', animation: 'fadeIn 0.5s ease' }}>
          <Link to="/" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#a78bfa')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}>الرئيسية</Link>
          <span style={{ color: 'rgba(124,77,255,0.5)' }}>✦</span>
          {place.categories && <>
            <span style={{ color: 'rgba(255,255,255,0.35)' }}>{place.categories.name}</span>
            <span style={{ color: 'rgba(124,77,255,0.5)' }}>✦</span>
          </>}
          <span style={{ color: 'rgba(255,255,255,0.6)' }}>{place.name}</span>
        </div>

        {/* Hero Image */}
        <div style={{ position: 'relative', borderRadius: 28, overflow: 'hidden', marginBottom: allImages.length > 1 ? 12 : 24, animation: 'slideUp 0.6s ease' }}>
          <img
            src={place.image && place.image !== 'EMPTY' ? place.image : 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'}
            alt={place.name}
            onClick={() => setLightboxIndex(0)}
            style={{ width: '100%', height: 320, objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,12,26,0.85) 0%, rgba(8,12,26,0.2) 50%, transparent 100%)', pointerEvents: 'none' }} />
          {place.featured && (
            <span style={{ position: 'absolute', top: 16, right: 16, background: 'linear-gradient(135deg,#7C4DFF,#00E5FF)', color: 'white', fontSize: 11, padding: '5px 14px', borderRadius: 999, fontWeight: 700 }}>✦ مميز</span>
          )}
          <button onClick={toggleFavorite} disabled={favoriteLoading} className="fav-btn"
            style={{ position: 'absolute', top: 16, left: 16, width: 42, height: 42, borderRadius: '50%', background: isFavorite ? 'rgba(239,68,68,0.9)' : 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', border: isFavorite ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, opacity: favoriteLoading ? 0.5 : 1 }}>
            {isFavorite ? '❤️' : '🤍'}
          </button>
          {allImages.length > 1 && (
            <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: 11, padding: '4px 10px', borderRadius: 8, backdropFilter: 'blur(8px)' }}>
              🖼 {allImages.length} صور
            </div>
          )}
          {place.categories && (
            <div style={{ position: 'absolute', bottom: 16, right: 16 }}>
              <span className="glass-strong" style={{ fontSize: 12, padding: '6px 14px', borderRadius: 999, color: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.15)' }}>
                {place.categories.icon} {place.categories.name}
              </span>
            </div>
          )}
        </div>

        {/* Thumbnails Gallery */}
        {allImages.length > 1 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
            {allImages.map((img, i) => (
              <img key={i} src={img} alt="" className="thumb-img"
                onClick={() => setLightboxIndex(i)}
                style={{ width: 80, height: 60, flexShrink: 0, border: lightboxIndex === i ? '2px solid #7C4DFF' : '2px solid transparent' }} />
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 20, animation: 'slideUp 0.6s 0.1s ease both', opacity: 0 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: 'white', margin: '0 0 6px', background: 'linear-gradient(90deg,#fff,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {place.name}
            </h1>
            {place.name_ku && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: 0 }}>{place.name_ku}</p>}
          </div>
          <TiltCard>
            <div className="glass neon-border" style={{ borderRadius: 20, padding: '12px 18px', textAlign: 'center', flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>{renderStars(place.rating, 18)}</div>
              <p style={{ color: '#fbbf24', fontSize: 22, fontWeight: 900, margin: '0 0 2px' }}>{place.rating}</p>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: 0 }}>{place.reviews_count} تقييم</p>
            </div>
          </TiltCard>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24, animation: 'slideUp 0.6s 0.2s ease both', opacity: 0 }}>
          {place.address && (
            <div className="glass" style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 12, padding: '8px 14px', fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
              <span>📍</span><span>{place.address}</span>
            </div>
          )}
          {place.opening_hours && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 12, padding: '8px 14px', fontSize: 12, color: '#34d399', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
              <span>🕐</span><span>{place.opening_hours}</span>
            </div>
          )}
          {place.phone && (
            <a href={`tel:${place.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 12, padding: '8px 14px', fontSize: 12, color: '#60a5fa', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', textDecoration: 'none' }}>
              <span>📞</span><span>{place.phone}</span>
            </a>
          )}
        </div>

        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 18, padding: 4, marginBottom: 24, animation: 'slideUp 0.6s 0.3s ease both', opacity: 0 }}>
          {[{ key: 'info', label: 'معلومات', icon: 'ℹ️' }, { key: 'map', label: 'الخريطة', icon: '🗺️' }, { key: 'reviews', label: `التقييمات (${reviews.length})`, icon: '⭐' }].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)} className="tab-btn"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px 8px', borderRadius: 14, fontSize: 13, fontWeight: 600, background: activeTab === tab.key ? 'linear-gradient(135deg,#7C4DFF,#00E5FF)' : 'transparent', color: activeTab === tab.key ? 'white' : 'rgba(255,255,255,0.45)', boxShadow: activeTab === tab.key ? '0 4px 20px rgba(124,77,255,0.4)' : 'none' }}>
              <span>{tab.icon}</span><span>{tab.label}</span>
            </button>
          ))}
        </div>

        {activeTab === 'info' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'slideUp 0.4s ease' }}>
            <TiltCard>
              <div className="glass neon-border" style={{ borderRadius: 22, padding: 22 }}>
                <h3 style={{ color: 'white', fontWeight: 700, fontSize: 15, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ background: 'rgba(124,77,255,0.2)', borderRadius: 10, padding: '4px 8px' }}>📝</span> عن المكان
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.8, margin: 0 }}>{place.description}</p>
              </div>
            </TiltCard>
            <TiltCard>
              <div className="glass neon-border" style={{ borderRadius: 22, padding: 22 }}>
                <h3 style={{ color: 'white', fontWeight: 700, fontSize: 15, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ background: 'rgba(124,77,255,0.2)', borderRadius: 10, padding: '4px 8px' }}>📬</span> معلومات التواصل
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {place.address && (<div className="info-row" style={{ display: 'flex', alignItems: 'center', gap: 14 }}><span style={{ width: 36, height: 36, background: 'rgba(96,165,250,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>📍</span><div><p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: '0 0 2px' }}>العنوان</p><p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, margin: 0 }}>{place.address}</p></div></div>)}
                  {place.phone && (<div className="info-row" style={{ display: 'flex', alignItems: 'center', gap: 14 }}><span style={{ width: 36, height: 36, background: 'rgba(52,211,153,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>📞</span><div><p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: '0 0 2px' }}>الهاتف</p><a href={`tel:${place.phone}`} style={{ color: '#60a5fa', fontSize: 13, textDecoration: 'none' }}>{place.phone}</a></div></div>)}
                  {place.whatsapp && (<div className="info-row" style={{ display: 'flex', alignItems: 'center', gap: 14 }}><span style={{ width: 36, height: 36, background: 'rgba(52,211,153,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>💬</span><div><p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: '0 0 2px' }}>واتساب</p><a href={`https://wa.me/${place.whatsapp}`} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', fontSize: 13, textDecoration: 'none' }}>{place.whatsapp}</a></div></div>)}
                  {place.opening_hours && (<div className="info-row" style={{ display: 'flex', alignItems: 'center', gap: 14 }}><span style={{ width: 36, height: 36, background: 'rgba(251,191,36,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🕐</span><div><p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: '0 0 2px' }}>أوقات العمل</p><p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, margin: 0 }}>{place.opening_hours}</p></div></div>)}
                  {place.website && (<div className="info-row" style={{ display: 'flex', alignItems: 'center', gap: 14 }}><span style={{ width: 36, height: 36, background: 'rgba(167,139,250,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🌐</span><div><p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: '0 0 2px' }}>الموقع الإلكتروني</p><a href={place.website} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', fontSize: 13, textDecoration: 'none' }}>{place.website}</a></div></div>)}
                </div>
              </div>
            </TiltCard>
          </div>
        )}

        {activeTab === 'map' && (
          <div style={{ animation: 'slideUp 0.4s ease' }}>
            <div className="glass neon-border" style={{ borderRadius: 22, overflow: 'hidden' }}>
              {place.latitude && place.longitude ? (
                <>
                  <div style={{ height: 380, width: '100%' }}>
                    <MapContainer center={[place.latitude, place.longitude]} zoom={15} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
                      <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker position={[place.latitude, place.longitude]}>
                        <Popup><div style={{ textAlign: 'center', padding: 4 }}><p style={{ fontWeight: 700, margin: '0 0 4px' }}>{place.name}</p><p style={{ fontSize: 11, color: '#666', margin: 0 }}>{place.address}</p></div></Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                  <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ color: 'white', fontWeight: 600, fontSize: 14, margin: '0 0 4px' }}>{place.name}</p>
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0 }}>{place.address}</p>
                    </div>
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`} target="_blank" rel="noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg,#7C4DFF,#00E5FF)', color: 'white', fontSize: 12, padding: '10px 18px', borderRadius: 12, textDecoration: 'none', fontWeight: 700 }}>
                      🧭 الاتجاهات
                    </a>
                  </div>
                </>
              ) : (
                <div style={{ height: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)' }}>
                  <span style={{ fontSize: 40, marginBottom: 12 }}>🗺️</span>
                  <p style={{ fontSize: 14 }}>الموقع على الخريطة غير متوفر</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'slideUp 0.4s ease' }}>
            <TiltCard>
              <div className="glass neon-border" style={{ borderRadius: 22, padding: 22 }}>
                <h3 style={{ color: 'white', fontWeight: 700, fontSize: 15, margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ background: 'rgba(124,77,255,0.2)', borderRadius: 10, padding: '4px 8px' }}>✍️</span> أضف تقييمك
                </h3>
                {!user ? (
                  <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 16 }}>يجب تسجيل الدخول لإضافة تقييم</p>
                    <Link to="/login" style={{ background: 'linear-gradient(135deg,#7C4DFF,#00E5FF)', color: 'white', fontSize: 13, padding: '11px 28px', borderRadius: 14, textDecoration: 'none', fontWeight: 700 }}>تسجيل الدخول</Link>
                  </div>
                ) : reviewSuccess ? (
                  <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <p style={{ fontSize: 40, marginBottom: 8 }}>🎉</p>
                    <p style={{ color: '#34d399', fontWeight: 700 }}>تم إرسال تقييمك بنجاح!</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 10 }}>تقييمك</p>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {[1,2,3,4,5].map(star => (
                          <button key={star} className="star-btn" onClick={() => setReviewRating(star)} onMouseEnter={() => setReviewHover(star)} onMouseLeave={() => setReviewHover(0)}>
                            <span style={{ fontSize: 32, color: star <= (reviewHover || reviewRating) ? '#fbbf24' : 'rgba(255,255,255,0.15)', display: 'block', transition: 'color 0.15s' }}>★</span>
                          </button>
                        ))}
                      </div>
                      {reviewRating > 0 && <p style={{ color: '#fbbf24', fontSize: 12, marginTop: 6 }}>{['','سيء','مقبول','جيد','جيد جداً','ممتاز'][reviewRating]}</p>}
                    </div>
                    <div>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 8 }}>تعليقك (اختياري)</p>
                      <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="شارك تجربتك مع هذا المكان..." rows={3}
                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '12px 16px', color: 'white', fontSize: 13, boxSizing: 'border-box', lineHeight: 1.7 }} />
                    </div>
                    {reviewError && <p style={{ color: '#f87171', fontSize: 12 }}>{reviewError}</p>}
                    <button onClick={submitReview} disabled={reviewLoading || reviewRating === 0}
                      style={{ background: reviewRating === 0 ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg,#7C4DFF,#00E5FF)', color: reviewRating === 0 ? 'rgba(255,255,255,0.3)' : 'white', border: 'none', borderRadius: 14, padding: '14px', fontSize: 14, fontWeight: 700, cursor: reviewRating === 0 ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease', width: '100%' }}>
                      {reviewLoading ? '⏳ جاري الإرسال...' : 'إرسال التقييم ✦'}
                    </button>
                  </div>
                )}
              </div>
            </TiltCard>

            {reviews.length === 0 ? (
              <div className="glass" style={{ borderRadius: 22, padding: '48px 0', textAlign: 'center' }}>
                <span style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>💬</span>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>لا توجد تقييمات بعد</p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 4 }}>كن أول من يقيّم هذا المكان!</p>
              </div>
            ) : reviews.map((review, i) => (
              <div key={review.id} className="glass" style={{ borderRadius: 18, padding: '16px 18px', animation: `slideUp 0.4s ${i*0.05}s ease both`, opacity: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#7C4DFF,#00E5FF)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14 }}>
                      {profiles[review.user_id || '']?.[0]?.toUpperCase() || '👤'}
                    </div>
                    <p style={{ color: 'white', fontWeight: 600, fontSize: 14, margin: 0 }}>{profiles[review.user_id || ''] || 'مجهول'}</p>
                  </div>
                  <div style={{ display: 'flex' }}>{renderStars(review.rating, 14)}</div>
                </div>
                {review.comment && <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 1.7, margin: '0 0 8px' }}>{review.comment}</p>}
                <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, margin: 0 }}>{new Date(review.created_at).toLocaleDateString('ar-IQ')}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}