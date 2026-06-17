

const posts = [
  { id: 1, title: 'أجمل 5 أماكن سياحية في عقرة', excerpt: 'اكتشف أروع المناطق السياحية في مدينة عقرة العريقة، من قلعتها التاريخية إلى شلالاتها الخلابة', date: '٥ يونيو ٢٠٢٥', category: 'سياحة', icon: '🏔️', color: '#7C4DFF', readTime: '٣ دقائق' },
  { id: 2, title: 'أفضل المطاعم الكردية في عقرة', excerpt: 'دليلك الشامل لأشهى المطاعم التي تقدم الأكلات الكردية التقليدية الأصيلة في قلب المدينة', date: '١٢ يونيو ٢٠٢٥', category: 'مطاعم', icon: '🍽️', color: '#f59e0b', readTime: '٤ دقائق' },
  { id: 3, title: 'دليل الفنادق في عقرة لعام ٢٠٢٥', excerpt: 'مراجعة شاملة لأفضل خيارات الإقامة في عقرة، من الفنادق الفاخرة إلى الخيارات الاقتصادية', date: '٢٠ يونيو ٢٠٢٥', category: 'فنادق', icon: '🏨', color: '#00E5FF', readTime: '٥ دقائق' },
  { id: 4, title: 'شلال بارزان — جوهرة عقرة المخفية', excerpt: 'رحلة إلى شلال بارزان الساحر القريب من عقرة، وكل ما تحتاج معرفته قبل زيارتك لهذا المكان الرائع', date: '٢٨ يونيو ٢٠٢٥', category: 'سياحة', icon: '💧', color: '#34d399', readTime: '٣ دقائق' },
  { id: 5, title: 'أسواق عقرة التراثية — رحلة عبر الزمن', excerpt: 'تجول معنا في أزقة الأسواق القديمة في عقرة واكتشف الحرف اليدوية والتراث الكردي الأصيل', date: '٥ يوليو ٢٠٢٥', category: 'أسواق', icon: '🛒', color: '#a78bfa', readTime: '٤ دقائق' },
  { id: 6, title: 'قلعة عقرة — تاريخ منحوت في الصخر', excerpt: 'استكشف قلعة عقرة التاريخية التي تشرف على المدينة وتحكي آلاف السنين من التاريخ الكردي العريق', date: '١٢ يوليو ٢٠٢٥', category: 'سياحة', icon: '🏰', color: '#ef4444', readTime: '٦ دقائق' },
]

export default function BlogPage() {
  return (
    <div style={{ background: '#080C1A', minHeight: '100vh' }}>
      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        .glass { background:rgba(255,255,255,0.04); backdrop-filter:blur(24px); border:1px solid rgba(255,255,255,0.08); }
        .blog-card { transition: transform 0.3s ease, box-shadow 0.3s ease; cursor: pointer; }
        .blog-card:hover { transform: translateY(-8px); box-shadow: 0 24px 48px rgba(124,77,255,0.2); }
      `}</style>

      {/* Hero */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '80px 16px 60px', textAlign: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#0B1020 0%,#1a0533 60%,#030812 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(124,77,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(124,77,255,0.05) 1px,transparent 1px)`, backgroundSize: '50px 50px' }} />
        <div style={{ position: 'absolute', top: -60, left: '15%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,77,255,0.2) 0%,transparent 70%)', animation: 'floatY 8s ease-in-out infinite' }} />

        <div style={{ position: 'relative', zIndex: 1, animation: 'slideUp 0.7s ease' }}>
          <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg,#7C4DFF,#00E5FF)', borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 20px', boxShadow: '0 0 40px rgba(124,77,255,0.4)' }}>📝</div>
          <h1 style={{ fontSize: 42, fontWeight: 900, margin: '0 0 16px', background: 'linear-gradient(90deg,#fff,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>المدونة</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16 }}>مقالات وأدلة سياحية عن أقرة وكردستان العراق</p>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 16px 60px' }}>

        {/* Featured Post */}
        <div className="blog-card glass" style={{ borderRadius: 28, overflow: 'hidden', marginBottom: 32, border: '1px solid rgba(124,77,255,0.2)', animation: 'slideUp 0.6s 0.1s ease both', opacity: 0 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 300px', background: 'linear-gradient(135deg,#1a0533,#0B1020)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 220, fontSize: 80 }}>
              🏔️
            </div>
            <div style={{ flex: '2 1 300px', padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ background: 'rgba(124,77,255,0.2)', color: '#a78bfa', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 999 }}>مقال مميز ✦</span>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>سياحة · ٣ دقائق</span>
              </div>
              <h2 style={{ color: 'white', fontSize: 22, fontWeight: 800, margin: '0 0 12px', lineHeight: 1.4 }}>أجمل 5 أماكن سياحية في أقرة</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.8, margin: '0 0 20px' }}>
                اكتشف أروع المناطق السياحية في مدينة أقرة العريقة، من قلعتها التاريخية إلى شلالاتها الخلابة وأسواقها القديمة المليئة بالتراث الكردي الأصيل.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>٥ يونيو ٢٠٢٥</span>
                <span style={{ background: 'linear-gradient(135deg,#7C4DFF,#00E5FF)', color: 'white', fontSize: 12, fontWeight: 700, padding: '8px 18px', borderRadius: 12 }}>قراءة المقال ←</span>
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
          {posts.slice(1).map((post, i) => (
            <div key={post.id} className="blog-card glass" style={{ borderRadius: 22, overflow: 'hidden', animation: `slideUp 0.5s ${0.2 + i * 0.07}s ease both`, opacity: 0, border: `1px solid ${post.color}15` }}>
              <div style={{ height: 130, background: `linear-gradient(135deg, ${post.color}20, #0B1020)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, position: 'relative' }}>
                {post.icon}
                <span style={{ position: 'absolute', top: 12, right: 12, background: `${post.color}25`, color: post.color, fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 999 }}>{post.category}</span>
              </div>
              <div style={{ padding: '18px' }}>
                <h3 style={{ color: 'white', fontSize: 15, fontWeight: 700, margin: '0 0 8px', lineHeight: 1.5 }}>{post.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, lineHeight: 1.7, margin: '0 0 14px' }}>{post.excerpt}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>{post.date} · {post.readTime}</span>
                  <span style={{ color: post.color, fontSize: 12, fontWeight: 600 }}>اقرأ ←</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
