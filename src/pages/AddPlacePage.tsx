import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface Category { id: number; name: string; icon: string }

// مكون للنقر على الخريطة
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export default function AddPlacePage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [imagePreview, setImagePreview] = useState('')
  const [markerPos, setMarkerPos] = useState<[number, number] | null>(null)
  const [showMapLinkInput, setShowMapLinkInput] = useState(false) // ✅ جديد: إظهار/إخفاء حقل الرابط
  const [mapLink, setMapLink] = useState('') // ✅ جديد: تخزين رابط الموقع
  const [form, setForm] = useState({
    name: '', name_ku: '', category_id: '', description: '',
    address: '', phone: '', whatsapp: '', website: '',
    opening_hours: '', image: '', latitude: '', longitude: '',
  })

  // إحداثيات أقرة كنقطة بداية
  const AKRE_CENTER: [number, number] = [36.7477, 43.8927]

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

  function handleLocationSelect(lat: number, lng: number) {
    const roundedLat = Math.round(lat * 10000) / 10000
    const roundedLng = Math.round(lng * 10000) / 10000
    setMarkerPos([lat, lng])
    setForm(prev => ({ ...prev, latitude: String(roundedLat), longitude: String(roundedLng) }))
    setShowMapLinkInput(false) // إخفاء حقل الرابط عند تحديد موقع يدوياً
    setMapLink('')
  }

  // ✅ ✅ ✅ دالة جديدة: استخراج الإحداثيات من رابط Google Maps
  function extractCoordinatesFromLink(link: string) {
    try {
      // محاولة استخراج الإحداثيات من رابط Google Maps
      // مثال: https://www.google.com/maps/place/36.7477,43.8927
      // أو: https://www.google.com/maps/@36.7477,43.8927,15z
      
      let lat: number | null = null
      let lng: number | null = null

      // نمط 1: /place/36.7477,43.8927
      const placeMatch = link.match(/\/place\/([0-9.]+),([0-9.]+)/)
      if (placeMatch) {
        lat = parseFloat(placeMatch[1])
        lng = parseFloat(placeMatch[2])
      }

      // نمط 2: /@36.7477,43.8927
      const atMatch = link.match(/@([0-9.]+),([0-9.]+)/)
      if (atMatch && !lat) {
        lat = parseFloat(atMatch[1])
        lng = parseFloat(atMatch[2])
      }

      // نمط 3: ?q=36.7477,43.8927
      const qMatch = link.match(/[?&]q=([0-9.]+),([0-9.]+)/)
      if (qMatch && !lat) {
        lat = parseFloat(qMatch[1])
        lng = parseFloat(qMatch[2])
      }

      // نمط 4: إحداثيات مباشرة مفصولة بفاصلة
      const coordMatch = link.match(/([0-9.]+)\s*,\s*([0-9.]+)/)
      if (coordMatch && !lat) {
        lat = parseFloat(coordMatch[1])
        lng = parseFloat(coordMatch[2])
      }

      if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        // التحقق من أن الإحداثيات ضمن نطاق معقول
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          handleLocationSelect(lat, lng)
          setShowMapLinkInput(false)
          setMapLink('')
          alert('✅ تم استخراج الموقع من الرابط بنجاح!')
          return true
        }
      }
      
      alert('❌ لم نتمكن من استخراج الإحداثيات من هذا الرابط. تأكد من صحة الرابط.')
      return false
    } catch (error) {
      alert('❌ حدث خطأ في قراءة الرابط. حاول مرة أخرى.')
      return false
    }
  }

  // ✅ ✅ ✅ دالة لفتح مربع إدخال الرابط
  function handleMapLinkClick() {
    setShowMapLinkInput(!showMapLinkInput)
    setMapLink('')
  }

  // ✅ ✅ ✅ دالة معالجة الرابط
  function handleMapLinkSubmit() {
    if (mapLink.trim()) {
      extractCoordinatesFromLink(mapLink)
    } else {
      alert('⚠️ الرجاء إدخال رابط الموقع')
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    const fileName = `${Date.now()}.${file.name.split('.').pop()}`
    const { data, error } = await supabase.storage.from('places').upload(fileName, file)
    if (!error && data) {
      const { data: urlData } = supabase.storage.from('places').getPublicUrl(fileName)
      setForm(prev => ({ ...prev, image: urlData.publicUrl }))
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
      <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(24px)', border: '1px solid rgba(124,77,255,0.3)', borderRadius: 28, padding: '48px 40px', textAlign: 'center', maxWidth: 420, width: '100%' }}>
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
        .form-input { width:100%; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:14px; padding:12px 16px; color:white; font-size:13px; outline:none; transition:all 0.2s ease; box-sizing:border-box; }
        .form-input:focus { border-color:rgba(124,77,255,0.5); box-shadow:0 0 0 3px rgba(124,77,255,0.15); }
        .form-input::placeholder { color:rgba(255,255,255,0.25); }
        .form-label { color:rgba(255,255,255,0.6); font-size:12px; font-weight:600; display:block; margin-bottom:8px; letter-spacing:0.5px; }
        select.form-input option { background:#1a0533; color:white; }
        textarea.form-input { resize:none; }
        .leaflet-container { border-radius: 0; cursor: crosshair !important; }
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

            {/* الموقع وساعات العمل */}
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
              <div style={{ border: '2px dashed rgba(124,77,255,0.3)', borderRadius: 18, padding: '28px 20px', textAlign: 'center', background: 'rgba(124,77,255,0.05)' }}>
                {imagePreview ? (
                  <div>
                    <img src={imagePreview} alt="preview" style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 14, marginBottom: 12 }} />
                    <button type="button" onClick={() => { setImagePreview(''); setForm(prev => ({ ...prev, image: '' })) }}
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

            {/* ✅ ✅ ✅ الخريطة مع زر "رابط الموقع" */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <label className="form-label" style={{ marginBottom: 0 }}>📍 حدد موقع مكانك على الخريطة</label>
                
                {/* ✅ زر جديد: رابط الموقع */}
                <button
                  type="button"
                  onClick={handleMapLinkClick}
                  style={{
                    background: showMapLinkInput 
                      ? 'rgba(239,68,68,0.2)' 
                      : 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 12,
                    padding: '8px 16px',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.2s ease'
                  }}
                >
                  {showMapLinkInput ? '✕ إلغاء' : '🔗 رابط الموقع'}
                </button>
              </div>

              {/* ✅ حقل إدخال الرابط (يظهر عند الضغط على الزر) */}
              {showMapLinkInput && (
                <div style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,107,107,0.3)',
                  borderRadius: 14,
                  padding: '16px',
                  marginBottom: 14
                }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <input
                      type="text"
                      value={mapLink}
                      onChange={(e) => setMapLink(e.target.value)}
                      placeholder="الصق رابط Google Maps هنا..."
                      className="form-input"
                      style={{ flex: 1 }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleMapLinkSubmit()
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleMapLinkSubmit}
                      style={{
                        background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 12,
                        padding: '10px 20px',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      استخراج 📍
                    </button>
                  </div>
                  <div style={{
                    marginTop: 8,
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.3)',
                    lineHeight: 1.6,
                    direction: 'ltr'
                  }}>
                    💡 أدخل رابط Google Maps مثل:
                    <br />
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>
                      https://www.google.com/maps/place/36.7477,43.8927
                    </span>
                    <br />
                    أو انسخ الرابط من متصفحك عند فتح الموقع على الخريطة
                  </div>
                </div>
              )}

              <div style={{ 
                borderRadius: 18, 
                overflow: 'hidden', 
                border: '2px solid rgba(124,77,255,0.3)', 
                height: 320,
                position: 'relative'
              }}>
                <MapContainer
                  center={markerPos || AKRE_CENTER}
                  zoom={14}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapClickHandler onLocationSelect={handleLocationSelect} />
                  {markerPos && <Marker position={markerPos} />}
                </MapContainer>
              </div>

              {/* عرض الإحداثيات */}
              {markerPos ? (
                <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                  <div style={{ flex: 1, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 12, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>خط العرض</span>
                    <span style={{ color: '#34d399', fontSize: 13, fontWeight: 700 }}>{form.latitude}</span>
                  </div>
                  <div style={{ flex: 1, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 12, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>خط الطول</span>
                    <span style={{ color: '#34d399', fontSize: 13, fontWeight: 700 }}>{form.longitude}</span>
                  </div>
                  <button type="button" onClick={() => { setMarkerPos(null); setForm(prev => ({ ...prev, latitude: '', longitude: '' })) }}
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', borderRadius: 12, padding: '10px 14px', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    ✕ مسح
                  </button>
                </div>
              ) : (
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 10, textAlign: 'center' }}>
                  لم يتم تحديد الموقع بعد — اضغط على الخريطة أو استخدم زر "رابط الموقع"
                </p>
              )}
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