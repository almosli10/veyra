import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useTranslation } from 'react-i18next'

interface Category { id: number; name: string; icon: string; slug: string }
interface Place {
  id: number; name: string; slug: string; description: string
  address: string; rating: number; reviews_count: number
  image: string; featured: boolean; categories?: { name: string }
}

function TiltCard({ children, className = '', style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null)
  function handleMove(e: React.MouseEvent) {
    const el = ref.current; if (!el) return
    const r = el.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width - 0.5) * 20
    const y = ((e.clientY - r.top) / r.height - 0.5) * -20
    el.style.transform = `perspective(800px) rotateX(${y}deg) rotateY(${x}deg) translateZ(20px) scale(1.03)`
    el.style.boxShadow = `${-x * 2}px ${y * 2}px 40px rgba(124,77,255,0.3), 0 20px 60px rgba(0,0,0,0.5)`
  }
  function handleLeave() {
    const el = ref.current; if (!el) return
    el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)'
    el.style.boxShadow = '0 10px 40px rgba(0,0,0,0.3)'
  }
  return (
    <div ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave}
      className={className}
      style={{ transition: 'transform 0.15s ease, box-shadow 0.15s ease', transformStyle: 'preserve-3d', ...style }}>
      {children}
    </div>
  )
}

export default function HomePage() {
  const { t, i18n } = useTranslation()
  const [search, setSearch] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [featured, setFeatured] = useState<Place[]>([])
  const [recent, setRecent] = useState<Place[]>([])
  const [searchResults, setSearchResults] = useState<Place[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => { fetchData() }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.trim().length >= 2) doSearch(search.trim())
      else setSearchResults([])
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  function handleHeroMouse(e: React.MouseEvent) {
    const r = heroRef.current?.getBoundingClientRect()
    if (!r) return
    setMousePos({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height })
  }

  async function fetchData() {
    setLoading(true)
    const { data: cats } = await supabase.from('categories').select('*')
    if (cats) setCategories(cats)
    const { data: feat } = await supabase.from('places').select('*, categories(name)').eq('featured', true).limit(3)
    if (feat) setFeatured(feat)
    const { data: rec } = await supabase.from('places').select('*, categories(name)').order('created_at', { ascending: false }).limit(4)
    if (rec) setRecent(rec)
    setLoading(false)
  }

  async function doSearch(q: string) {
    setSearchLoading(true)
    const { data } = await supabase.from('places').select('*, categories(name)')
      .or(`name.ilike.%${q}%,description.ilike.%${q}%,address.ilike.%${q}%`).limit(8)
    if (data) setSearchResults(data)
    setSearchLoading(false)
  }

  const isSearching = search.trim().length >= 2
  const px = mousePos.x, py = mousePos.y
  const isRTL = i18n.language !== 'en'

  return (
    <div style={{ background: '#080C1A', minHeight: '100vh' }}>
      <style>{`
        @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
        @keyframes floatY2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes slideUp { from{opacity:0;transform:translateY(50px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes rotate-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes scan { 0%{transform:translateY(-100%)} 100%{transform:translateY(100%)} }
        .shimmer-title { background:linear-gradient(90deg,#fff 0%,#7C4DFF 30%,#00E5FF 50%,#7C4DFF 70%,#fff 100%); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; animation:shimmer 4s linear infinite; }
        .glass-card { background:rgba(255,255,255,0.04); backdrop-filter:blur(24px); border:1px solid rgba(255,255,255,0.08); }
        .glass-strong { background:rgba(255,255,255,0.07); backdrop-filter:blur(40px); border:1px solid rgba(255,255,255,0.12); }
        .neon-border { border:1px solid rgba(124,77,255,0.4)!important; box-shadow:0 0 20px rgba(124,77,255,0.15),inset 0 0 20px rgba(124,77,255,0.05); }
        .btn-primary { background:linear-gradient(135deg,#7C4DFF,#00E5FF); border:none; cursor:pointer; color:white; transition:all 0.3s ease; position:relative; overflow:hidden; }
        .btn-primary::before { content:''; position:absolute; top:0; left:-100%; width:100%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent); transition:left 0.5s; }
        .btn-primary:hover::before { left:100%; }
        .btn-primary:hover { transform:translateY(-2px); box-shadow:0 10px 30px rgba(124,77,255,0.5); }
        .place-card-wrap { animation:slideUp 0.6s ease both; }
        .scan-line { position:absolute; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,#00E5FF,transparent); animation:scan 3s linear infinite; opacity:0.3; }
        input::placeholder { color:rgba(255,255,255,0.3); }
        input:focus { outline:none; }
      `}</style>

      {/* Hero */}
      <div ref={heroRef} onMouseMove={handleHeroMouse}
        style={{ position:'relative', minHeight:700, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse 80% 80% at ${px*100}% ${py*100}%, rgba(124,77,255,0.25) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at ${(1-px)*100}% ${(1-py)*100}%, rgba(0,229,255,0.15) 0%, transparent 60%), linear-gradient(180deg, #0B1020 0%, #0d0620 50%, #030812 100%)`, transition:'background 0.1s ease' }} />
        <div style={{ position:'absolute', inset:0, opacity:0.07, backgroundImage:`linear-gradient(rgba(124,77,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(124,77,255,1) 1px,transparent 1px)`, backgroundSize:'60px 60px' }} />
        <div className="scan-line" />
        {[...Array(30)].map((_, i) => (
          <div key={i} style={{ position:'absolute', width:Math.random()*3+1, height:Math.random()*3+1, borderRadius:'50%', background:'white', top:`${Math.random()*100}%`, left:`${Math.random()*100}%`, opacity:Math.random()*0.6+0.2 }} />
        ))}
        <div style={{ position:'absolute', top:'15%', right:'8%', width:350, height:350, borderRadius:'50%', border:'1px solid rgba(124,77,255,0.15)', animation:'rotate-slow 20s linear infinite' }}>
          <div style={{ position:'absolute', top:-4, left:'50%', width:8, height:8, borderRadius:'50%', background:'#7C4DFF', boxShadow:'0 0 20px #7C4DFF' }} />
        </div>

        <div style={{ position:'relative', zIndex:2, textAlign:'center', padding:'60px 16px', maxWidth:700, width:'100%' }}>
          <div style={{ animation:'fadeIn 0.8s ease both', marginBottom:24 }}>
            <span className="glass-strong neon-border" style={{ display:'inline-block', padding:'8px 20px', borderRadius:999, fontSize:12, color:'rgba(255,255,255,0.8)', fontWeight:500, letterSpacing:1 }}>
              {t('badge')}
            </span>
          </div>
          <div style={{ animation:'slideUp 0.8s 0.1s ease both', opacity:0 }}>
            <h1 style={{ fontSize:52, fontWeight:900, lineHeight:1.15, marginBottom:20, letterSpacing:-1 }}>
              <span style={{ color:'white', display:'block' }}>{t('heroTitle')}</span>
              <span className="shimmer-title">{t('heroSubtitle')}</span>
            </h1>
          </div>
          <div style={{ animation:'slideUp 0.8s 0.25s ease both', opacity:0 }}>
            <p style={{ color:'rgba(255,255,255,0.5)', fontSize:17, marginBottom:36, lineHeight:1.7, maxWidth:500, margin:'0 auto 36px' }}>{t('heroDesc')}</p>
          </div>
          <div style={{ animation:'slideUp 0.8s 0.4s ease both', opacity:0, maxWidth:560, margin:'0 auto' }}>
            <TiltCard style={{ borderRadius:20, display:'inline-block', width:'100%' }}>
              <div className="glass-strong neon-border" style={{ borderRadius:20, padding:'6px 6px 6px 16px', display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:18, flexShrink:0 }}>🔍</span>
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && search.trim().length >= 2 && doSearch(search.trim())}
                  placeholder={t('searchPlaceholder')}
                  style={{ flex:1, background:'none', border:'none', color:'white', fontSize:14, padding:'10px 0' }} />
                {search && (
                  <button onClick={() => { setSearch(''); setSearchResults([]) }}
                    style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', cursor:'pointer', fontSize:16, padding:'0 8px' }}>✕</button>
                )}
                <button onClick={() => search.trim().length >= 2 && doSearch(search.trim())}
                  className="btn-primary" style={{ borderRadius:14, padding:'12px 24px', fontSize:13, fontWeight:700 }}>
                  {t('search')}
                </button>
              </div>
            </TiltCard>
          </div>
          <div style={{ animation:'slideUp 0.8s 0.55s ease both', opacity:0, marginTop:20, display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
            {[t('tag1'), t('tag2'), t('tag3'), t('tag4')].map(tag => (
              <button key={tag} onClick={() => setSearch(tag)} className="glass-card"
                style={{ border:'1px solid rgba(255,255,255,0.1)', borderRadius:999, padding:'7px 16px', fontSize:11, color:'rgba(255,255,255,0.6)', cursor:'pointer', transition:'all 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor='#7C4DFF'; (e.currentTarget as HTMLButtonElement).style.color='#a78bfa' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor='rgba(255,255,255,0.1)'; (e.currentTarget as HTMLButtonElement).style.color='rgba(255,255,255,0.6)' }}>
                {tag}
              </button>
            ))}
          </div>
          <div style={{ animation:'fadeIn 1s 0.8s ease both', opacity:0, marginTop:56, display:'flex', gap:0, justifyContent:'center' }}>
            {[['7+', t('stat1')], ['8', t('stat2')], ['Akre', t('stat3')]].map(([n, l], i) => (
              <div key={String(l)} style={{ padding:'0 28px', borderRight: isRTL && i < 2 ? '1px solid rgba(255,255,255,0.1)' : !isRTL && i < 2 ? '1px solid rgba(255,255,255,0.1)' : 'none', textAlign:'center' }}>
                <p style={{ color:'#00E5FF', fontSize:30, fontWeight:900, margin:0, textShadow:'0 0 20px rgba(0,229,255,0.5)' }}>{n}</p>
                <p style={{ color:'rgba(255,255,255,0.4)', fontSize:11, margin:0, marginTop:4 }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1152, margin:'0 auto', padding:'60px 16px' }}>

        {/* Search Results */}
        {isSearching && (
          <section style={{ marginBottom:48 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
              <h2 style={{ fontSize:20, fontWeight:700, color:'white', margin:0, display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:4, height:28, background:'linear-gradient(180deg,#7C4DFF,#00E5FF)', borderRadius:999 }} />
                {searchLoading ? `⏳ ${t('searching')}` : `${t('searchResults')} "${search}"`}
              </h2>
              <button onClick={() => { setSearch(''); setSearchResults([]) }} style={{ fontSize:12, color:'rgba(255,255,255,0.4)', background:'none', border:'none', cursor:'pointer' }}>{t('clearSearch')}</button>
            </div>
            {searchLoading ? (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:16 }}>
                {[1,2,3,4].map(i => <div key={i} className="glass-card" style={{ borderRadius:20, height:200 }} />)}
              </div>
            ) : searchResults.length === 0 ? (
              <div className="glass-card" style={{ textAlign:'center', padding:'64px 0', borderRadius:24 }}>
                <p style={{ fontSize:40, marginBottom:12 }}>😕</p>
                <p style={{ color:'rgba(255,255,255,0.5)', fontWeight:500 }}>{t('noResults')} "{search}"</p>
                <p style={{ color:'rgba(255,255,255,0.3)', fontSize:13 }}>{t('tryDifferent')}</p>
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:16 }}>
                {searchResults.map((place, i) => (
                  <Link key={place.id} to={`/place/${place.slug}`} style={{ textDecoration:'none' }}>
                    <TiltCard className="place-card-wrap" style={{ borderRadius:20, animationDelay:`${i*0.07}s` }}>
                      <div className="glass-card" style={{ borderRadius:20, overflow:'hidden' }}>
                        <img src={place.image && place.image !== 'EMPTY' ? place.image : 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'} alt={place.name} style={{ width:'100%', height:140, objectFit:'cover' }} />
                        <div style={{ padding:14 }}>
                          <span style={{ fontSize:11, color:'#a78bfa', background:'rgba(124,77,255,0.15)', padding:'3px 10px', borderRadius:999 }}>{place.categories?.name}</span>
                          <p style={{ fontWeight:700, color:'white', fontSize:14, margin:'8px 0 4px' }}>{place.name}</p>
                          <p style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>⭐ {place.rating} · 📍 {place.address}</p>
                        </div>
                      </div>
                    </TiltCard>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {!isSearching && (
          <>
            {/* Categories */}
            <section style={{ marginBottom:56 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28 }}>
                <div style={{ width:4, height:28, background:'linear-gradient(180deg,#6366f1,#a855f7)', borderRadius:999 }} />
                <h2 style={{ fontSize:22, fontWeight:700, color:'white', margin:0 }}>{t('browseByCategory')}</h2>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(100px,1fr))', gap:12 }}>
                {categories.map((cat, i) => (
                  <Link key={cat.id} to={`/${cat.slug}`} style={{ textDecoration:'none' }}>
                    <TiltCard>
                      <div className="glass-card neon-border" style={{ borderRadius:20, padding:'20px 12px', textAlign:'center', animationDelay:`${i*0.05}s` }}
                        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background='rgba(124,77,255,0.15)'}
                        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background='rgba(255,255,255,0.04)'}>
                        <span style={{ fontSize:28, display:'block', marginBottom:8 }}>{cat.icon}</span>
                        <p style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.7)', margin:0 }}>{cat.name}</p>
                      </div>
                    </TiltCard>
                  </Link>
                ))}
              </div>
            </section>

            {/* Featured */}
            <section style={{ marginBottom:56 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28 }}>
                <div style={{ width:4, height:28, background:'linear-gradient(180deg,#f59e0b,#ef4444)', borderRadius:999 }} />
                <h2 style={{ fontSize:22, fontWeight:700, color:'white', margin:0 }}>{t('featuredPlaces')}</h2>
              </div>
              {loading ? (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:24 }}>
                  {[1,2,3].map(i => <div key={i} className="glass-card" style={{ borderRadius:24, height:280 }} />)}
                </div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:24 }}>
                  {featured.map((place, i) => (
                    <Link key={place.id} to={`/place/${place.slug}`} style={{ textDecoration:'none' }}>
                      <TiltCard className="place-card-wrap" style={{ borderRadius:24, animationDelay:`${i*0.1}s` }}>
                        <div className="glass-card" style={{ borderRadius:24, overflow:'hidden', border:'1px solid rgba(255,255,255,0.08)' }}>
                          <div style={{ position:'relative' }}>
                            <img src={place.image} alt={place.name} style={{ width:'100%', height:200, objectFit:'cover', display:'block' }} />
                            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(8,12,26,0.9) 0%,transparent 50%)' }} />
                            <span style={{ position:'absolute', top:12, right:12, background:'linear-gradient(135deg,#6366f1,#a855f7)', color:'white', fontSize:11, padding:'4px 12px', borderRadius:999, fontWeight:700 }}>{t('featured')}</span>
                            <div style={{ position:'absolute', bottom:12, right:12 }}>
                              <span className="glass-strong" style={{ fontSize:11, padding:'4px 12px', borderRadius:999, color:'rgba(255,255,255,0.9)', border:'1px solid rgba(255,255,255,0.15)' }}>{place.categories?.name}</span>
                            </div>
                            <div style={{ position:'absolute', bottom:12, left:12 }}>
                              <span style={{ color:'#fbbf24', fontSize:13, fontWeight:700 }}>⭐ {place.rating}</span>
                            </div>
                          </div>
                          <div style={{ padding:'16px 18px 18px' }}>
                            <p style={{ fontWeight:700, color:'white', fontSize:16, margin:'0 0 6px' }}>{place.name}</p>
                            <p style={{ fontSize:12, color:'rgba(255,255,255,0.4)', margin:0 }}>📍 {place.address}</p>
                          </div>
                        </div>
                      </TiltCard>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Recent */}
            <section style={{ marginBottom:56 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28 }}>
                <div style={{ width:4, height:28, background:'linear-gradient(180deg,#10b981,#00E5FF)', borderRadius:999 }} />
                <h2 style={{ fontSize:22, fontWeight:700, color:'white', margin:0 }}>{t('recentlyAdded')}</h2>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:16 }}>
                {recent.map((place, i) => (
                  <Link key={place.id} to={`/place/${place.slug}`} style={{ textDecoration:'none' }}>
                    <TiltCard className="place-card-wrap" style={{ borderRadius:20, animationDelay:`${i*0.08}s` }}>
                      <div className="glass-card" style={{ borderRadius:20, overflow:'hidden', border:'1px solid rgba(255,255,255,0.06)' }}>
                        <img src={place.image && place.image !== 'EMPTY' ? place.image : 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'} alt={place.name} style={{ width:'100%', height:150, objectFit:'cover' }} />
                        <div style={{ padding:14 }}>
                          <span style={{ fontSize:11, color:'#a78bfa', background:'rgba(124,77,255,0.15)', padding:'3px 10px', borderRadius:999 }}>{place.categories?.name}</span>
                          <p style={{ fontWeight:600, color:'white', fontSize:14, margin:'8px 0 4px' }}>{place.name}</p>
                          <p style={{ fontSize:11, color:'rgba(255,255,255,0.4)', margin:0 }}>⭐ {place.rating}</p>
                        </div>
                      </div>
                    </TiltCard>
                  </Link>
                ))}
              </div>
            </section>

            {/* Banner */}
            <section>
              <TiltCard style={{ borderRadius:32 }}>
                <div style={{ background:'linear-gradient(135deg,#0B1020 0%,#1a0533 50%,#031a2e 100%)', borderRadius:32, padding:'52px 44px', border:'1px solid rgba(124,77,255,0.3)', boxShadow:'0 0 60px rgba(124,77,255,0.1)', display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:32, position:'relative', overflow:'hidden' }}>
                  <div style={{ position:'absolute', inset:0, backgroundImage:`linear-gradient(rgba(124,77,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(124,77,255,0.05) 1px,transparent 1px)`, backgroundSize:'40px 40px' }} />
                  <div style={{ position:'absolute', top:-80, right:-80, width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle,rgba(124,77,255,0.2) 0%,transparent 70%)', animation:'floatY 8s ease-in-out infinite' }} />
                  <div style={{ position:'relative', zIndex:1 }}>
                    <p style={{ color:'#a78bfa', fontSize:12, fontWeight:600, letterSpacing:2, marginBottom:12 }}>EXPLORE · {t('tourism').toUpperCase()}</p>
                    <h2 style={{ fontSize:32, fontWeight:800, color:'white', margin:'0 0 14px' }}>{t('exploreTitle')}</h2>
                    <p style={{ color:'rgba(255,255,255,0.5)', fontSize:14, maxWidth:380, margin:'0 0 28px', lineHeight:1.7 }}>{t('exploreDesc')}</p>
                    <Link to="/tourism" className="btn-primary" style={{ display:'inline-block', borderRadius:16, padding:'14px 32px', fontSize:14, fontWeight:700, textDecoration:'none' }}>
                      {t('exploreBtn')}
                    </Link>
                  </div>
                  <div style={{ display:'flex', gap:14, position:'relative', zIndex:1, flexWrap:'wrap' }}>
                    {[['🏔️', t('mountains')], ['💧', t('waterfalls')], ['🏰', t('history')]].map(([icon, label], i) => (
                      <TiltCard key={String(label)}>
                        <div className="glass-strong" style={{ border:'1px solid rgba(124,77,255,0.2)', borderRadius:20, padding:'24px 18px', textAlign:'center', minWidth:96, animation:`floatY${i % 2 === 0 ? '' : '2'} ${6+i}s ease-in-out infinite` }}>
                          <span style={{ fontSize:30, display:'block', marginBottom:10 }}>{icon}</span>
                          <p style={{ fontSize:11, color:'rgba(255,255,255,0.6)', margin:0, fontWeight:500 }}>{label}</p>
                        </div>
                      </TiltCard>
                    ))}
                  </div>
                </div>
              </TiltCard>
            </section>
          </>
        )}
      </div>
    </div>
  )
}
