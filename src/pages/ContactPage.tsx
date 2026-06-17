import { Link } from 'react-router-dom'

const WHATSAPP = '+9647518697820'
const TELEGRAM = 'almosli10'

export default function ContactPage() {
  return (
    <div style={{ background: '#080C1A', minHeight: '100vh' }}>
      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        .glass { background:rgba(255,255,255,0.04); backdrop-filter:blur(24px); border:1px solid rgba(255,255,255,0.08); }
        .neon-border { border:1px solid rgba(124,77,255,0.3) !important; }
        .contact-card { transition:transform 0.3s ease, box-shadow 0.3s ease; }
        .contact-card:hover { transform:translateY(-6px); box-shadow:0 20px 40px rgba(0,0,0,0.3); }
        .cta-btn { transition:all 0.3s ease; text-decoration:none; display:flex; align-items:center; justify-content:center; gap:12px; border-radius:18px; padding:18px 24px; font-size:16px; font-weight:700; cursor:pointer; }
        .cta-btn:hover { transform:translateY(-3px); }
      `}</style>

      {/* Hero */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '80px 16px 60px', textAlign: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#0B1020 0%,#1a0533 60%,#030812 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(124,77,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(124,77,255,0.05) 1px,transparent 1px)`, backgroundSize: '50px 50px' }} />
        <div style={{ position: 'absolute', top: -60, right: '20%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,77,255,0.2) 0%,transparent 70%)', animation: 'floatY 8s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: -40, left: '15%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,229,255,0.1) 0%,transparent 70%)', animation: 'floatY 10s ease-in-out infinite reverse' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 560, margin: '0 auto', animation: 'slideUp 0.7s ease' }}>
          <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg,#7C4DFF,#00E5FF)', borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 20px', boxShadow: '0 0 40px rgba(124,77,255,0.4)' }}>📬</div>
          <h1 style={{ fontSize: 42, fontWeight: 900, margin: '0 0 16px', background: 'linear-gradient(90deg,#fff,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>اتصل بنا</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, lineHeight: 1.7 }}>
            نحن هنا للمساعدة — تواصل معنا عبر أي من القنوات التالية وسنرد عليك في أقرب وقت
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 16px 60px' }}>

        {/* معلومات التواصل */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16, marginBottom: 40, animation: 'slideUp 0.6s 0.1s ease both', opacity: 0 }}>
          {[
            ['📧', 'البريد الإلكتروني', 'tabbymike80@gmail.com', '#7C4DFF', `mailto:tabbymike80@gmail.com`],
            ['📍', 'الموقع', 'أقرة، كردستان العراق', '#00E5FF', null],
            ['🕐', 'أوقات الدعم', 'الأحد - الخميس، ٩ص - ٥م', '#fbbf24', null],
            ['💻', 'تليجرام', `@${TELEGRAM}`, '#229ED9', `https://t.me/${TELEGRAM}`],
          ].map(([icon, label, value, color, href]) => (
            <div key={String(label)} className="glass contact-card" style={{ borderRadius: 20, padding: '20px', border: `1px solid ${color}20` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, background: `${color}20`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{icon}</div>
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: '0 0 4px', fontWeight: 600, letterSpacing: 0.5 }}>{label}</p>
                  {href ? (
                    <a href={String(href)} target="_blank" rel="noreferrer" style={{ color: String(color), fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>{value}</a>
                  ) : (
                    <p style={{ color: 'white', fontSize: 13, fontWeight: 600, margin: 0 }}>{value}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* أزرار التواصل الرئيسية */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 40, animation: 'slideUp 0.6s 0.2s ease both', opacity: 0 }}>

          {/* واتساب */}
          <a href={`https://wa.me/${WHATSAPP}?text=مرحباً، أريد التواصل معكم عبر Veyra`}
            target="_blank" rel="noreferrer" className="cta-btn"
            style={{ background: 'linear-gradient(135deg,#25D366,#128C7E)', color: 'white', boxShadow: '0 8px 24px rgba(37,211,102,0.3)' }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 16px 40px rgba(37,211,102,0.5)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 8px 24px rgba(37,211,102,0.3)')}>
            <span style={{ fontSize: 28 }}>💬</span>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>واتساب</p>
              <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>+964 751 869 7820</p>
            </div>
          </a>

          {/* تليجرام */}
          <a href={`https://t.me/${TELEGRAM}`}
            target="_blank" rel="noreferrer" className="cta-btn"
            style={{ background: 'linear-gradient(135deg,#229ED9,#1a7ab5)', color: 'white', boxShadow: '0 8px 24px rgba(34,158,217,0.3)' }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 16px 40px rgba(34,158,217,0.5)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 8px 24px rgba(34,158,217,0.3)')}>
            <span style={{ fontSize: 28 }}>✈️</span>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>تليجرام</p>
              <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>@{TELEGRAM}</p>
            </div>
          </a>
        </div>

        {/* الأسئلة الشائعة */}
        <div style={{ animation: 'slideUp 0.6s 0.3s ease both', opacity: 0 }}>
          <h2 style={{ color: 'white', fontSize: 20, fontWeight: 800, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ background: 'rgba(124,77,255,0.2)', borderRadius: 10, padding: '6px 10px' }}>❓</span>
            الأسئلة الشائعة
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              ['كيف أضيف مكاني على Veyra؟', 'اضغط على "أضف مكانك" في القائمة العلوية، وأكمل البيانات المطلوبة. سيتم مراجعة طلبك خلال 24 ساعة.'],
              ['هل الخدمة مجانية؟', 'نعم! إضافة مكانك وعرضه على Veyra مجاني تماماً.'],
              ['كم يستغرق مراجعة الطلب؟', 'عادةً خلال 24-48 ساعة من تقديم الطلب.'],
              ['كيف أعدّل معلومات مكاني؟', 'تواصل معنا عبر واتساب أو تليجرام مع ذكر اسم المكان.'],
            ].map(([q, a]) => (
              <div key={String(q)} className="glass" style={{ borderRadius: 18, padding: '18px 20px' }}>
                <p style={{ color: 'white', fontWeight: 700, fontSize: 14, margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#7C4DFF' }}>✦</span> {q}
                </p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.7, margin: 0 }}>{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: 40, animation: 'slideUp 0.6s 0.4s ease both', opacity: 0 }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 16 }}>تبي تضيف مكانك؟</p>
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
