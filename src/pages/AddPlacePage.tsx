import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

interface Category { id: number; name: string; icon: string }

export default function AddPlacePage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [imagePreview, setImagePreview] = useState('')
  const [form, setForm] = useState({
    name: '', name_ku: '', category_id: '', description: '',
    address: '', phone: '', whatsapp: '', website: '',
    opening_hours: '', image: '', latitude: '', longitude: '',
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/login')
      else setUser(session.user)
    })
    supabase.from('categories').select('*').then(({ data }) => { if (data) setCategories(data) })
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    const fileName = `${Date.now()}.${file.name.split('.').pop()}`
    const { data, error } = await supabase.storage.from('places').upload(fileName, file)
    if (!error && data) {
      const { data: urlData } = supabase.storage.from('places').getPublicUrl(fileName)
      setForm({ ...form, image: urlData.publicUrl })
      setImagePreview(urlData.publicUrl)
    }
    setUploading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    const { error } = await supabase.from('place_requests').insert({
      owner_id: user.id, name: form.name, name_ku: form.name_ku,
      category_id: parseInt(form.category_id), description: form.description,
      address: form.address, phone: form.phone, whatsapp: form.whatsapp,
      website: form.website, opening_hours: form.opening_hours, image: form.image,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      status: 'pending',
    })
    if (!error) setSuccess(true)
    setLoading(false)
  }

  if (success) return (
    <div style={{ background: '#080C1A', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(24px)', border: '1px solid rgba(124,77,255,0.3)', borderRadius: 28, padding: '48px 40px', textAlign: 'center', maxWidth: 420, width: '100%', boxShadow: '0 0 60px rgba(124,77,255,0.15)' }}>
        <p style={{ fontSize: 56, marginBottom: 16 }}>🎉</p>
        <h2 style={{ color: 'white', fontSize: 22, fontWeight: 800, marginBottom: 10 }}>تم إرسال طلبك بنجاح!</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>سيتم مراجعة طلبك من قبل الإدارة ونشره قريباً</p>
        <button onClick={() => navigate('/')} style={{ background: 'linear-gradient(135deg,#7C4DFF,#00E5FF)', color: 'white', border: 'none', borderRadius: 14, padding: '13px 32px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          العودة للرئيسية ✦
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ background: '#080C1A', minHeight: '100vh', padding: '40px 16px 60px' }}>
      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        .glass { background:rgba(255,255,255,0.04); backdrop-filter:blur(24px); border:1px solid rgba(255,255,255,0.08); }
        .neon-border { border:1px solid rgba(124,77,255,0.3) !important; }
        .form-input {
          width:100%; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1);
          border-radius:14px; padding:12px 16px; color:white; font-size:13px;
          outline:none; transition:all 0.2s ease; box-sizing:border-box;
        }
        .form-input:focus { border-color:rgba(124,77,255,0.5); box-shadow:0 0 0 3px rgba(124,77,255,0.15); }
        .form-input::placeholder { color:rgba(255,255,255,0.25); }
        .form-label { color:rgba(255,255,255,0.6); font-size:12px; font-weight:600; display:block; margin-bottom:8px; letter-spacing:0.5px; }
        select.form-input option { background:#1a0533; color:white; }
        textarea.form-input { resize:none; }
      `}</style>

      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36, animation: 'slideUp 0.6s ease' }}>
          <div style={{ width: 60, height: 60, background: 'linear-gradient(135deg,#7C4DFF,#00E5FF)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 16px', boxShadow: '0 0 30px rgba(124,77,255,0.4)' }}>➕</div>
          <h1 style={{ color: 'white', fontSize: 28, fontWeight: 900, margin: '0 0 8px', background: 'linear-gradient(90deg,#fff,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>أضف مكانك</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>أضف مطعمك، فندقك، أو أي مكان آخر في أقرة</p>
        </div>

        <div className="glass neon-border" style={{ borderRadius: 28, padding: '36px 32px', animation: 'slideUp 0.6s 0.1s ease both', opacity: 0 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* الاسم */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="form-label">اسم المكان *</label>
                <input name="name" value={form.name} onChange={handleChange} required placeholder="مطعم الزهور" className="form-input" />
              </div>
              <div>
                <label className="form-label">الاسم بالكردية</label>
                <input name="name_ku" value={form.name_ku} onChange={handleChange} placeholder="چێشتخانەی گوڵەکان" className="form-input" />
              </div>
            </div>

            {/* الفئة */}
            <div>
              <label className="form-label">الفئة *</label>
              <select name="category_id" value={form.category_id} onChange={handleChange} required className="form-input">
                <option value="">اختر الفئة</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>

            {/* الوصف */}
            <div>
              <label className="form-label">الوصف *</label>
              <textarea name="description" value={form.description} onChange={handleChange} required rows={3} placeholder="اكتب وصفاً مختصراً عن مكانك..." className="form-input" />
            </div>

            {/* العنوان */}
            <div>
              <label className="form-label">العنوان *</label>
              <input name="address" value={form.address} onChange={handleChange} required placeholder="شارع الرئيسي، أقرة" className="form-input" />
            </div>

            {/* الهاتف */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="form-label">رقم الهاتف</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="+9647501234567" className="form-input" />
              </div>
              <div>
                <label className="form-label">واتساب</label>
                <input name="whatsapp" value={form.whatsapp} onChange={handleChange} placeholder="+9647501234567" className="form-input" />
              </div>
            </div>

            {/* الموقع الإلكتروني وساعات العمل */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="form-label">الموقع الإلكتروني</label>
                <input name="website" value={form.website} onChange={handleChange} placeholder="https://example.com" className="form-input" />
              </div>
              <div>
                <label className="form-label">ساعات العمل</label>
                <input name="opening_hours" value={form.opening_hours} onChange={handleChange} placeholder="٩ صباحاً - ١٠ مساءً" className="form-input" />
              </div>
            </div>

            {/* رفع الصورة */}
            <div>
              <label className="form-label">صورة المكان</label>
              <div style={{ border: '2px dashed rgba(124,77,255,0.3)', borderRadius: 18, padding: '28px 20px', textAlign: 'center', transition: 'border-color 0.2s', background: 'rgba(124,77,255,0.05)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(124,77,255,0.6)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(124,77,255,0.3)')}>
                {imagePreview ? (
                  <div>
                    <img src={imagePreview} alt="preview" style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 14, marginBottom: 12 }} />
                    <button type="button" onClick={() => { setImagePreview(''); setForm({ ...form, image: '' }) }}
                      style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: 10, padding: '6px 16px', fontSize: 12, cursor: 'pointer' }}>
                      حذف الصورة
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>📷</div>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 16 }}>اضغط لرفع صورة من جهازك أو هاتفك</p>
                    <label style={{ background: 'linear-gradient(135deg,#7C4DFF,#00E5FF)', color: 'white', fontSize: 13, fontWeight: 700, padding: '10px 24px', borderRadius: 12, cursor: 'pointer', display: 'inline-block' }}>
                      {uploading ? '⏳ جارٍ الرفع...' : 'اختر صورة'}
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploading} />
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* الإحداثيات */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="form-label">خط العرض (Latitude)</label>
                <input name="latitude" value={form.latitude} onChange={handleChange} placeholder="36.7477" className="form-input" />
              </div>
              <div>
                <label className="form-label">خط الطول (Longitude)</label>
                <input name="longitude" value={form.longitude} onChange={handleChange} placeholder="43.8927" className="form-input" />
              </div>
            </div>

            {/* تلميح الإحداثيات */}
            <div style={{ background: 'rgba(0,229,255,0.07)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: 14, padding: '14px 16px', fontSize: 13, color: 'rgba(0,229,255,0.8)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
              <span>للحصول على إحداثيات مكانك — افتح Google Maps، ابحث عن موقعك، انقر عليه بزر الأيمن وستظهر الإحداثيات</span>
            </div>

            <button type="submit" disabled={loading || uploading}
              style={{
                background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg,#7C4DFF,#00E5FF)',
                color: loading ? 'rgba(255,255,255,0.4)' : 'white',
                border: 'none', borderRadius: 16, padding: '15px', fontSize: 15,
                fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease', width: '100%',
                boxShadow: loading ? 'none' : '0 8px 24px rgba(124,77,255,0.3)',
              }}>
              {loading ? '⏳ جارٍ الإرسال...' : 'إرسال الطلب للمراجعة 📤'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
