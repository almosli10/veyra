import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useTranslation } from 'react-i18next'

export default function AboutPage() {
  const [placesCount, setPlacesCount] = useState(0)
  const [categoriesCount, setCategoriesCount] = useState(0)
  const { i18n } = useTranslation()

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

    setPlacesCount(places || 0)
    setCategoriesCount(categories || 0)
  }

  const values = {
    ar: [
      ['🤝', 'المجتمع أولاً', 'نخدم سكان عقرة وزوارها بشكل متساوٍ'],
      ['🔍', 'الشفافية', 'معلومات دقيقة وموثوقة عن كل مكان'],
      ['💡', 'الابتكار', 'تجربة مستخدم عصرية وسهلة الاستخدام'],
      ['❤️', 'الشغف', 'نحب عقرة ونعمل لتطويرها رقمياً'],
    ],
    en: [
      ['🤝', 'Community First', 'We serve Akre residents and visitors equally'],
      ['🔍', 'Transparency', 'Accurate and reliable info about every place'],
      ['💡', 'Innovation', 'Modern and easy-to-use user experience'],
      ['❤️', 'Passion', 'We love Akre and work to develop it digitally'],
    ],
    ku: [
      ['🤝', 'کۆمەڵگا یەکەم', 'شارنشینان و میوانەکانی ئاکری بە یەکسانی خزمەت دەکەین'],
      ['🔍', 'ڕوونی', 'زانیاری تەواو و پشتبەستنی لەسەر هەر شوێنێک'],
      ['💡', 'داهێنان', 'ئەزموونی بەکارهێنەری نوێ و ئاسان'],
      ['❤️', 'خواستن', 'ئاکریمان خۆش دەوێت و کار دەکەین بۆ پەرەپێدانی دیجیتاڵی'],
    ],
  }

  const lang = (i18n.language as 'ar' | 'en' | 'ku') in values ? (i18n.language as 'ar' | 'en' | 'ku') : 'ar'
  const currentValues = values[lang]

  const stats = {
    ar: [
      [`${placesCount}+`, 'مكان مميز', '📍', '#7C4DFF'],
      [String(categoriesCount), 'فئات', '🗂️', '#00E5FF'],
      ['عقرة', 'مدينتنا', '🏙️', '#a78bfa'],
      ['16/6/2026', 'تاريخ التأسيس', '📅', '#34d399'],
    ],
    en: [
      [`${placesCount}+`, 'Featured Places', '📍', '#7C4DFF'],
      [String(categoriesCount), 'Categories', '🗂️', '#00E5FF'],
      ['Akre', 'Our City', '🏙️', '#a78bfa'],
      ['16/6/2026', 'Founded', '📅', '#34d399'],
    ],
    ku: [
      [`${placesCount}+`, 'شوێنی تایبەت', '📍', '#7C4DFF'],
      [String(categoriesCount), 'جۆرەکان', '🗂️', '#00E5FF'],
      ['ئاکری', 'شارەکەمان', '🏙️', '#a78bfa'],
      ['16/6/2026', 'بەرواری دامەزراندن', '📅', '#34d399'],
    ],
  }

  const currentStats = stats[lang]

  const content = {
    ar: {
      title: 'من نحن',
      desc: 'Veyra هي منصة اكتشاف الأماكن المحلية في مدينة عقرة الجميلة — كردستان العراق',
      storyTitle: 'قصتنا',
      story: 'وُلدت فكرة Veyra من حب عميق لمدينة عقرة العريقة وإيمان بأن هذه المدينة الجميلة تستحق منصة رقمية تعكس تنوعها وجمالها. نسعى لتوفير دليل شامل يساعد السكان والزوار على اكتشاف أفضل المطاعم والكافيهات والفنادق والأماكن السياحية في عقرة.',
      missionTitle: 'مهمتنا',
      mission: 'تمكين أصحاب الأعمال المحلية في عقرة من الوصول إلى جمهور أوسع، وتسهيل اكتشاف الأماكن المميزة للسكان والسياح على حد سواء. نؤمن بأن كل مكان في عقرة له قصة تستحق أن تُروى.',
      valuesTitle: 'قيمنا',
      cta: 'أضف مكانك الآن ✦',
    },
    en: {
      title: 'About Us',
      desc: 'Veyra is a local place discovery platform in the beautiful city of Akre — Kurdistan, Iraq',
      storyTitle: 'Our Story',
      story: 'The idea of Veyra was born from a deep love for the ancient city of Akre and a belief that this beautiful city deserves a digital platform that reflects its diversity and beauty. We aim to provide a comprehensive guide to help residents and visitors discover the best restaurants, cafes, hotels, and tourist spots in Akre.',
      missionTitle: 'Our Mission',
      mission: 'Empowering local businesses in Akre to reach a wider audience, and making it easy for residents and tourists alike to discover amazing places. We believe every place in Akre has a story worth telling.',
      valuesTitle: 'Our Values',
      cta: 'Add Your Place Now ✦',
    },
    ku: {
      title: 'دەربارەمان',
      desc: 'Veyra پلاتفۆرمی دۆزینەوەی شوێنە خۆجێیەکانە لە شاری جوانی ئاکری — کوردستانی عێراق',
      storyTitle: 'چیرۆکەکەمان',
      story: 'بیرۆکەی Veyra لە خۆشەویستییەکی قووڵ بۆ شاری کۆنی ئاکری و باوەڕ بە ئەوەی کە ئەم شاری جوانە شایستەی پلاتفۆرمێکی دیجیتاڵی دەکات کە جۆراوجۆری و جمالی دەرببڕێت.',
      missionTitle: 'ئەرکەکەمان',
      mission: 'هەڵبژاردنی خاوەن کاروباری خۆجێی لە ئاکری بۆ گەیشتن بە دەنگێکی فراوانتر، و ئاسانکردنی دۆزینەوەی شوێنە تایبەتەکان بۆ شارنشینان و گەردیارەکان بە یەکسانی.',
      valuesTitle: 'بەهاکانمان',
      cta: 'شوێنەکەت ئێستا زیاد بکە ✦',
    },
  }

  const c = content[lang]

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

      <div style={{ position: 'relative', overflow: 'hidden', padding: '80px 16px 60px', textAlign: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#0B1020 0%,#1a0533 60%,#030812 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(124,77,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(124,77,255,0.05) 1px,transparent 1px)`, backgroundSize: '50px 50px' }} />
        <div style={{ position: 'absolute', top: -80, left: '20%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,77,255,0.2) 0%,transparent 70%)', animation: 'floatY 8s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: -60, right: '15%', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,229,255,0.15) 0%,transparent 70%)', animation: 'floatY 10s ease-in-out infinite reverse' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto', animation: 'slideUp 0.7s ease' }}>
          <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg,#7C4DFF,#00E5FF)', borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 20px', boxShadow: '0 0 40px rgba(124,77,255,0.4)' }}>📍</div>
          <h1 style={{ fontSize: 42, fontWeight: 900, margin: '0 0 16px', background: 'linear-gradient(90deg,#fff,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{c.title}</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 17, lineHeight: 1.8 }}>{c.desc}</p>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 16px 60px' }}>

        <div className="glass neon-border" style={{ borderRadius: 24, padding: '32px', marginBottom: 24, animation: 'slideUp 0.6s 0.1s ease both', opacity: 0 }}>
          <h2 style={{ color: 'white', fontSize: 20, fontWeight: 800, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ background: 'rgba(124,77,255,0.2)', borderRadius: 10, padding: '6px 10px' }}>🚀</span>
            {c.storyTitle}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 2, margin: 0 }}>{c.story}</p>
        </div>

        <div className="glass neon-border" style={{ borderRadius: 24, padding: '32px', marginBottom: 24, animation: 'slideUp 0.6s 0.2s ease both', opacity: 0 }}>
          <h2 style={{ color: 'white', fontSize: 20, fontWeight: 800, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ background: 'rgba(0,229,255,0.15)', borderRadius: 10, padding: '6px 10px' }}>🎯</span>
            {c.missionTitle}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 2, margin: 0 }}>{c.mission}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 16, marginBottom: 24, animation: 'slideUp 0.6s 0.3s ease both', opacity: 0 }}>
          {currentStats.map(([num, label, icon, color]) => (
            <div key={label} className="glass stat-card" style={{ borderRadius: 20, padding: '24px 16px', textAlign: 'center', border: `1px solid ${color}30` }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
              <p style={{ color: color as string, fontSize: 26, fontWeight: 900, margin: '0 0 4px' }}>{num}</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0 }}>{label}</p>
            </div>
          ))}
        </div>

        <div className="glass neon-border" style={{ borderRadius: 24, padding: '32px', marginBottom: 32, animation: 'slideUp 0.6s 0.4s ease both', opacity: 0 }}>
          <h2 style={{ color: 'white', fontSize: 20, fontWeight: 800, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ background: 'rgba(251,191,36,0.15)', borderRadius: 10, padding: '6px 10px' }}>✨</span>
            {c.valuesTitle}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
            {currentValues.map(([icon, title, desc]) => (
              <div key={title} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: '18px' }}>
                <span style={{ fontSize: 24, display: 'block', marginBottom: 8 }}>{icon}</span>
                <p style={{ color: 'white', fontWeight: 700, fontSize: 14, margin: '0 0 6px' }}>{title}</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, lineHeight: 1.6, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', animation: 'slideUp 0.6s 0.5s ease both', opacity: 0 }}>
          <Link to="/add-place" style={{ display: 'inline-block', background: 'linear-gradient(135deg,#7C4DFF,#00E5FF)', color: 'white', fontSize: 15, fontWeight: 700, padding: '14px 36px', borderRadius: 16, textDecoration: 'none', boxShadow: '0 8px 24px rgba(124,77,255,0.3)', transition: 'all 0.3s' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-3px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
            {c.cta}
          </Link>
        </div>
      </div>
    </div>
  )
}