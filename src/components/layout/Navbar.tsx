import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useTranslation } from 'react-i18next'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [scrolled, setScrolled] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { t, i18n } = useTranslation()

  const langs = [
    { code: 'ar', label: 'العربية', flag: 'AR' },
    { code: 'ku', label: 'کوردی', flag: 'KR' },
    { code: 'en', label: 'English', flag: 'EN' },
  ]

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 20) }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function changeLang(code: string) {
    i18n.changeLanguage(code)
    document.dir = code === 'en' ? 'ltr' : 'rtl'
    setLangOpen(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  const isActive = (path: string) => location.pathname === path
  const currentLang = langs.find(l => l.code === i18n.language) || langs[0]

  return (
    <>
      <style>{`
        .nav-link { color:rgba(255,255,255,0.55); text-decoration:none; font-size:13px; font-weight:500; padding:6px 12px; border-radius:10px; transition:all 0.2s ease; position:relative; }
        .nav-link:hover { color:white; background:rgba(255,255,255,0.06); }
        .nav-link.active { color:white; background:rgba(124,77,255,0.2); }
        .nav-link.active::after { content:''; position:absolute; bottom:-2px; left:50%; transform:translateX(-50%); width:20px; height:2px; background:linear-gradient(90deg,#7C4DFF,#00E5FF); border-radius:999px; }
        .add-btn { background:linear-gradient(135deg,#7C4DFF,#00E5FF); color:white; font-size:13px; font-weight:700; padding:8px 18px; border-radius:12px; text-decoration:none; transition:all 0.3s ease; border:none; cursor:pointer; position:relative; overflow:hidden; }
        .add-btn::before { content:''; position:absolute; top:0; left:-100%; width:100%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent); transition:left 0.5s; }
        .add-btn:hover::before { left:100%; }
        .add-btn:hover { box-shadow:0 8px 24px rgba(124,77,255,0.45); transform:translateY(-1px); }
        .mobile-link { color:rgba(255,255,255,0.65); text-decoration:none; font-size:14px; padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.05); transition:color 0.2s; display:flex; align-items:center; gap:12px; }
        .mobile-link:hover { color:white; }
        .hamburger { background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); color:white; border-radius:10px; padding:8px 10px; cursor:pointer; font-size:16px; transition:all 0.2s; }
        .hamburger:hover { background:rgba(124,77,255,0.2); }
        .lang-btn { background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); color:white; border-radius:10px; padding:7px 12px; cursor:pointer; font-size:12px; font-weight:600; transition:all 0.2s; display:flex; align-items:center; gap:6px; position:relative; }
        .lang-btn:hover { background:rgba(124,77,255,0.2); border-color:rgba(124,77,255,0.4); }
        .lang-dropdown { position:absolute; top:calc(100% + 8px); background:rgba(8,12,26,0.98); backdrop-filter:blur(40px); border:1px solid rgba(255,255,255,0.1); border-radius:14px; padding:6px; min-width:140px; z-index:200; box-shadow:0 20px 40px rgba(0,0,0,0.5); }
        .lang-option { display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:10px; cursor:pointer; color:rgba(255,255,255,0.7); font-size:13px; font-weight:500; transition:all 0.15s; border:none; background:none; width:100%; }
        .lang-option:hover { background:rgba(124,77,255,0.2); color:white; }
        .lang-option.active { background:rgba(124,77,255,0.25); color:#a78bfa; font-weight:700; }
        @media (min-width: 768px) { .desktop-nav { display:flex !important; } .hamburger { display:none !important; } .desktop-only { display:flex !important; } }
      `}</style>

      <nav style={{ position:'sticky', top:0, zIndex:100, background: scrolled ? 'rgba(8,12,26,0.95)' : 'rgba(8,12,26,0.75)', backdropFilter:'blur(24px)', borderBottom:'1px solid rgba(255,255,255,0.06)', transition:'all 0.3s ease', boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.4)' : 'none' }}>
        <div style={{ maxWidth:1152, margin:'0 auto', padding:'0 16px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between' }}>

          <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
            <div style={{ width:36, height:36, background:'linear-gradient(135deg,#7C4DFF,#00E5FF)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, boxShadow:'0 0 20px rgba(124,77,255,0.4)' }}>📍</div>
            <div>
              <span style={{ color:'white', fontWeight:800, fontSize:18, letterSpacing:-0.5 }}>Veyra</span>
              <span style={{ color:'rgba(255,255,255,0.3)', fontSize:11, marginRight:6 }}> Akre</span>
            </div>
          </Link>

          <div className="desktop-nav" style={{ display:'none', alignItems:'center', gap:4 }}>
            <Link to="/" className={`nav-link${isActive('/') ? ' active' : ''}`}>{t('home')}</Link>
            <Link to="/tourism" className={`nav-link${isActive('/tourism') ? ' active' : ''}`}>{t('tourism')}</Link>
            <Link to="/restaurants" className={`nav-link${isActive('/restaurants') ? ' active' : ''}`}>{t('restaurants')}</Link>
            <Link to="/hotels" className={`nav-link${isActive('/hotels') ? ' active' : ''}`}>{t('hotels')}</Link>
            <Link to="/cafes" className={`nav-link${isActive('/cafes') ? ' active' : ''}`}>{t('cafes')}</Link>
            <Link to="/markets" className={`nav-link${isActive('/markets') ? ' active' : ''}`}>{t('markets')}</Link>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {/* Language Switcher */}
            <div style={{ position:'relative' }}>
              <button className="lang-btn" onClick={() => setLangOpen(!langOpen)}>
                <span style={{ fontSize:11, fontWeight:700, color:'#00E5FF' }}>{currentLang.flag}</span>
                <span>{currentLang.label}</span>
                <span style={{ fontSize:10, opacity:0.6 }}>{langOpen ? '▲' : '▼'}</span>
              </button>
              {langOpen && (
                <div className="lang-dropdown" style={{ right: i18n.language === 'en' ? 'auto' : 0, left: i18n.language === 'en' ? 0 : 'auto' }}>
                  {langs.map(l => (
                    <button key={l.code} className={`lang-option${i18n.language === l.code ? ' active' : ''}`} onClick={() => changeLang(l.code)}>
                      <span style={{ fontSize:11, fontWeight:700, color:'#00E5FF', minWidth:24 }}>{l.flag}</span>
                      <span>{l.label}</span>
                      {i18n.language === l.code && <span style={{ marginRight:'auto', color:'#7C4DFF' }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {user ? (
              <>
                <Link to="/profile" className="desktop-only" style={{ display:'none', alignItems:'center', gap:8, textDecoration:'none', padding:'6px 12px', borderRadius:12, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', transition:'all 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background='rgba(124,77,255,0.15)'; (e.currentTarget as HTMLAnchorElement).style.borderColor='rgba(124,77,255,0.3)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background='rgba(255,255,255,0.05)'; (e.currentTarget as HTMLAnchorElement).style.borderColor='rgba(255,255,255,0.08)' }}>
                  <div style={{ width:28, height:28, background:'linear-gradient(135deg,#7C4DFF,#00E5FF)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:12, fontWeight:800 }}>
                    {user.user_metadata?.full_name?.[0]?.toUpperCase() || '👤'}
                  </div>
                  <span style={{ color:'rgba(255,255,255,0.7)', fontSize:13, maxWidth:100, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {user.user_metadata?.full_name || user.email}
                  </span>
                </Link>
                <Link to="/add-place" className="add-btn desktop-only" style={{ display:'none' }}>{t('addPlace')}</Link>
                <button onClick={handleLogout} className="desktop-only" style={{ display:'none', background:'none', border:'1px solid rgba(239,68,68,0.3)', color:'#f87171', fontSize:12, padding:'7px 14px', borderRadius:10, cursor:'pointer', transition:'all 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.background='rgba(239,68,68,0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.background='none')}>
                  {t('logout')}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="desktop-only" style={{ display:'none', color:'rgba(255,255,255,0.55)', fontSize:13, textDecoration:'none', padding:'7px 14px', borderRadius:10, transition:'all 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color='white')}
                  onMouseLeave={e => (e.currentTarget.style.color='rgba(255,255,255,0.55)')}>
                  {t('login')}
                </Link>
                <Link to="/register" className="add-btn">{t('register')}</Link>
              </>
            )}
            <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? '✕' : '☰'}</button>
          </div>
        </div>

        {menuOpen && (
          <div style={{ background:'rgba(8,12,26,0.98)', backdropFilter:'blur(40px)', borderTop:'1px solid rgba(255,255,255,0.06)', padding:'16px 20px 24px', display:'flex', flexDirection:'column', gap:0 }}>
            {[['/', t('home'), '🏠'], ['/tourism', t('tourism'), '🏔️'], ['/restaurants', t('restaurants'), '🍽️'], ['/hotels', t('hotels'), '🏨'], ['/cafes', t('cafes'), '☕'], ['/markets', t('markets'), '🛒']].map(([path, label, icon]) => (
              <Link key={path} to={path} className="mobile-link" onClick={() => setMenuOpen(false)}>
                <span style={{ fontSize:16 }}>{icon}</span>{label}
              </Link>
            ))}
            <div style={{ display:'flex', gap:8, padding:'12px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
              {langs.map(l => (
                <button key={l.code} onClick={() => { changeLang(l.code); setMenuOpen(false) }}
                  style={{ flex:1, background: i18n.language === l.code ? 'rgba(124,77,255,0.3)' : 'rgba(255,255,255,0.05)', border: i18n.language === l.code ? '1px solid rgba(124,77,255,0.5)' : '1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'8px 4px', fontSize:11, color: i18n.language === l.code ? '#a78bfa' : 'rgba(255,255,255,0.5)', cursor:'pointer', fontWeight:600 }}>
                  {l.flag} {l.label}
                </button>
              ))}
            </div>
            {user ? (
              <>
                <Link to="/profile" className="mobile-link" onClick={() => setMenuOpen(false)}><span style={{ fontSize:16 }}>👤</span>{t('myAccount')}</Link>
                <Link to="/add-place" className="mobile-link" onClick={() => setMenuOpen(false)}><span style={{ fontSize:16 }}>➕</span>{t('addPlace')}</Link>
                <button onClick={() => { handleLogout(); setMenuOpen(false) }} style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', color:'#f87171', borderRadius:12, padding:'10px 16px', marginTop:8, cursor:'pointer', fontSize:13, fontWeight:600, textAlign:'right' }}>
                  {t('logout')} 🚪
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="mobile-link" onClick={() => setMenuOpen(false)}><span style={{ fontSize:16 }}>🔑</span>{t('login')}</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} style={{ background:'linear-gradient(135deg,#7C4DFF,#00E5FF)', color:'white', borderRadius:12, padding:'12px 16px', marginTop:8, textDecoration:'none', fontSize:13, fontWeight:700, textAlign:'center', display:'block' }}>
                  {t('register')} ✦
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </>
  )
}