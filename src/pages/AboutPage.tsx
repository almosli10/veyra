import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AboutPage() {
    const [placesCount, setPlacesCount] = useState(0)
  const [categoriesCount, setCategoriesCount] = useState(0)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    const { count: places } = await supabase
      .from('places')
      .select('*', { count: 'exact', head: true })

    const { count: categories } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
    console.log('Places Count:', places)
    console.log('Categories Count:', categories)

    setPlacesCount(places || 0)
    setCategoriesCount(categories || 0)
  }
  return (
    <div style={{ background: '#080C1A', minHeight: '100vh' }}>
      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        .glass { background:rgba(255,255,255,0.04); backdrop-filter:blur(24px); border:1px solid rgba(255,255,255,0.08); }
        .neon-border { border:1px solid rgba(124,77,255,0.3) !important; }
        .stat-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .stat-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(124,77,255,0.2); }
      `}</style>

      {/* Hero */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '80px 16px 60px', textAlign: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#0B1020 0%,#1a0533 60%,#030812 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(124,77,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(124,77,255,0.05) 1px,transparent 1px)`, backgroundSize: '50px 50px' }} />
        <div style={{ position: 'absolute', top: -80, left: '20%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,77,255,0.2) 0%,transparent 70%)', animation: 'floatY 8s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: -60, right: '15%', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,229,255,0.15) 0%,transparent 70%)', animation: 'floatY 10s ease-in-out infinite reverse' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto', animation: 'slideUp 0.7s ease' }}>
          <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg,#7C4DFF,#00E5FF)', borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 20px', boxShadow: '0 0 40px rgba(124,77,255,0.4)' }}>📍</div>
          <h1 style={{ fontSize: 42, fontWeight: 900, margin: '0 0 16px', background: 'linear-gradient(90deg,#fff,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>من نحن</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 17, lineHeight: 1.8 }}>
            Veyra هي منصة اكتشاف الأماكن المحلية في مدينة أقرة الجميلة — كردستان العراق
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 16px 60px' }}>

        {/* القصة */}
        <div className="glass neon-border" style={{ borderRadius: 24, padding: '32px', marginBottom: 24, animation: 'slideUp 0.6s 0.1s ease both', opacity: 0 }}>
          <h2 style={{ color: 'white', fontSize: 20, fontWeight: 800, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ background: 'rgba(124,77,255,0.2)', borderRadius: 10, padding: '6px 10px' }}>🚀</span>
            قصتنا
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 2, margin: 0 }}>
            وُلدت فكرة Veyra من حب عميق لمدينة أقرة العريقة وإيمان بأن هذه المدينة الجميلة تستحق منصة رقمية تعكس تنوعها وجمالها. نسعى لتوفير دليل شامل يساعد السكان والزوار على اكتشاف أفضل المطاعم والكافيهات والفنادق والأماكن السياحية في أقرة.
          </p>
        </div>

        {/* المهمة */}
        <div className="glass neon-border" style={{ borderRadius: 24, padding: '32px', marginBottom: 24, animation: 'slideUp 0.6s 0.2s ease both', opacity: 0 }}>
          <h2 style={{ color: 'white', fontSize: 20, fontWeight: 800, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ background: 'rgba(0,229,255,0.15)', borderRadius: 10, padding: '6px 10px' }}>🎯</span>
            مهمتنا
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 2, margin: 0 }}>
            تمكين أصحاب الأعمال المحلية في أقرة من الوصول إلى جمهور أوسع، وتسهيل اكتشاف الأماكن المميزة للسكان والسياح على حد سواء. نؤمن بأن كل مكان في أقرة له قصة تستحق أن تُروى.
          </p>
        </div>

        {/* الإحصائيات */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 16, marginBottom: 24, animation: 'slideUp 0.6s 0.3s ease both', opacity: 0 }}>
{[
  [`${placesCount}+`, 'مكان مميز', '📍', '#7C4DFF'],
  [String(categoriesCount), 'فئات', '🗂️', '#00E5FF'],
  ['أقرة', 'مدينتنا', '🏙️', '#a78bfa'],
  ['16/6/2026', 'تاريخ التأسيس', '📅', '#34d399']
].map(([num, label, icon, color]) => (
            <div key={label} className="glass stat-card" style={{ borderRadius: 20, padding: '24px 16px', textAlign: 'center', border: `1px solid ${color}30` }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
              <p style={{ color, fontSize: 26, fontWeight: 900, margin: '0 0 4px' }}>{num}</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* القيم */}
        <div className="glass neon-border" style={{ borderRadius: 24, padding: '32px', marginBottom: 32, animation: 'slideUp 0.6s 0.4s ease both', opacity: 0 }}>
          <h2 style={{ color: 'white', fontSize: 20, fontWeight: 800, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ background: 'rgba(251,191,36,0.15)', borderRadius: 10, padding: '6px 10px' }}>✨</span>
            قيمنا
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
            {[['🤝', 'المجتمع أولاً', 'نخدم سكان أقرة وزوارها بشكل متساوٍ'], ['🔍', 'الشفافية', 'معلومات دقيقة وموثوقة عن كل مكان'], ['💡', 'الابتكار', 'تجربة مستخدم عصرية وسهلة الاستخدام'], ['❤️', 'الشغف', 'نحب أقرة ونعمل لتطويرها رقمياً']].map(([icon, title, desc]) => (
              <div key={title} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: '18px' }}>
                <span style={{ fontSize: 24, display: 'block', marginBottom: 8 }}>{icon}</span>
                <p style={{ color: 'white', fontWeight: 700, fontSize: 14, margin: '0 0 6px' }}>{title}</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, lineHeight: 1.6, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', animation: 'slideUp 0.6s 0.5s ease both', opacity: 0 }}>
          <Link to="/add-place" style={{ display: 'inline-block', background: 'linear-gradient(135deg,#7C4DFF,#00E5FF)', color: 'white', fontSize: 15, fontWeight: 700, padding: '14px 36px', borderRadius: 16, textDecoration: 'none', boxShadow: '0 8px 24px rgba(124,77,255,0.3)', transition: 'all 0.3s' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-3px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
            أضف مكانك الآن ✦
          </Link>
        </div>
      </div>
    </div>
  )
}
