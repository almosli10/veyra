import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()

  const categories = [
    [t('restaurants'), '🍽️', 'restaurants'],
    [t('cafes'), '☕', 'cafes'],
    [t('hotels'), '🏨', 'hotels'],
    [t('tourism'), '🏔️', 'tourism'],
    [t('markets'), '🛒', 'markets'],
  ]

  return (
    <footer style={{ background:'linear-gradient(180deg,#080C1A 0%,#0B1020 100%)', borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:56, paddingBottom:28, position:'relative', overflow:'hidden' }}>
      <style>{`
        @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        .footer-link { color:rgba(255,255,255,0.4); text-decoration:none; font-size:13px; transition:color 0.2s ease; display:block; margin-bottom:10px; }
        .footer-link:hover { color:#a78bfa; }
        .social-btn { width:36px; height:36px; border-radius:10px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); display:flex; align-items:center; justify-content:center; font-size:16px; cursor:pointer; transition:all 0.2s ease; text-decoration:none; }
        .social-btn:hover { background:rgba(124,77,255,0.2); border-color:rgba(124,77,255,0.4); transform:translateY(-3px); }
      `}</style>
      <div style={{ position:'absolute', bottom:-60, right:-60, width:250, height:250, borderRadius:'50%', background:'radial-gradient(circle,rgba(124,77,255,0.08) 0%,transparent 70%)', animation:'floatY 10s ease-in-out infinite' }} />
      <div style={{ maxWidth:1152, margin:'0 auto', padding:'0 16px', position:'relative', zIndex:1 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:40, marginBottom:48 }}>
          <div>
            <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none', marginBottom:16 }}>
              <div style={{ width:38, height:38, background:'linear-gradient(135deg,#7C4DFF,#00E5FF)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, boxShadow:'0 0 20px rgba(124,77,255,0.3)' }}>📍</div>
              <div>
                <span style={{ color:'white', fontWeight:800, fontSize:18 }}>Veyra</span>
                <span style={{ color:'rgba(255,255,255,0.3)', fontSize:11, marginRight:6 }}>Akre</span>
              </div>
            </Link>
            <p style={{ color:'rgba(255,255,255,0.35)', fontSize:13, lineHeight:1.8, marginBottom:20 }}>{t('footerDesc')}</p>
            <div style={{ display:'flex', gap:8 }}>
              {['📘','📸','🐦','💬'].map((icon,i) => <a key={i} href="#" className="social-btn">{icon}</a>)}
            </div>
          </div>
          <div>
            <p style={{ color:'white', fontSize:14, fontWeight:700, marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ width:3, height:16, background:'linear-gradient(180deg,#7C4DFF,#00E5FF)', borderRadius:999, display:'inline-block' }} />{t('categories')}
            </p>
            {categories.map(([name, icon, slug]) => (
              <Link key={slug} to={`/${slug}`} className="footer-link">
                <span style={{ marginLeft:6 }}>{icon}</span>{name}
              </Link>
            ))}
          </div>
          <div>
            <p style={{ color:'white', fontSize:14, fontWeight:700, marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ width:3, height:16, background:'linear-gradient(180deg,#f59e0b,#ef4444)', borderRadius:999, display:'inline-block' }} />{t('links')}
            </p>
            <Link to="/about" className="footer-link">{t('aboutUs')}</Link>
            <Link to="/contact" className="footer-link">{t('contactUs')}</Link>
            <Link to="/add-place" className="footer-link">{t('addPlace')}</Link>
            <Link to="/blog" className="footer-link">{t('blog')}</Link>
          </div>
          <div>
            <p style={{ color:'white', fontSize:14, fontWeight:700, marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ width:3, height:16, background:'linear-gradient(180deg,#10b981,#00E5FF)', borderRadius:999, display:'inline-block' }} />{t('support')}
            </p>
            <a href="#" className="footer-link">{t('privacy')}</a>
            <a href="#" className="footer-link">{t('terms')}</a>
            <Link to="/contact" className="footer-link">{t('help')}</Link>
            <Link to="/add-place" style={{ display:'inline-block', marginTop:16, background:'linear-gradient(135deg,#7C4DFF,#00E5FF)', color:'white', fontSize:12, fontWeight:700, padding:'9px 18px', borderRadius:12, textDecoration:'none' }}>
              + {t('addPlace')}
            </Link>
          </div>
        </div>
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.05)', paddingTop:24, display:'flex', flexWrap:'wrap', justifyContent:'space-between', alignItems:'center', gap:12 }}>
          <p style={{ color:'rgba(255,255,255,0.2)', fontSize:12, margin:0 }}>{t('rights')}</p>
          <p style={{ color:'rgba(255,255,255,0.2)', fontSize:12, margin:0 }}>{t('madeWith')}</p>
        </div>
      </div>
    </footer>
  )
}