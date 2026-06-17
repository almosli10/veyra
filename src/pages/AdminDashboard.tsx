import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const ADMIN_PASSWORD = 'veyra@admin2025'

interface PlaceRequest {
  id: number
  name: string
  name_ku: string
  description: string
  address: string
  phone: string
  opening_hours: string
  image: string
  status: string
  created_at: string
  latitude: number
  longitude: number
  whatsapp: string
  category_id: number
  owner_id: string
}

interface Place {
  id: number
  name: string
  slug: string
  address: string
  image: string
  rating: number
  reviews_count: number
  featured: boolean
  created_at: string
  categories?: { name: string; icon: string }
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [authenticated, setAuthenticated] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [requests, setRequests] = useState<PlaceRequest[]>([])
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected' | 'places'>('pending')
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('veyra_admin_auth')
    if (saved === 'true') setAuthenticated(true)
  }, [])

  useEffect(() => {
    if (authenticated) {
      checkAdmin()
      if (tab === 'places') fetchPlaces()
      else fetchRequests()
    }
  }, [tab, authenticated])

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (passwordInput === ADMIN_PASSWORD) {
      setAuthenticated(true)
      localStorage.setItem('veyra_admin_auth', 'true')
      setPasswordError('')
    } else {
      setPasswordError('كلمة المرور غير صحيحة')
    }
  }

  function handleLogout() {
    localStorage.removeItem('veyra_admin_auth')
    setAuthenticated(false)
    setPasswordInput('')
  }

  async function checkAdmin() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { navigate('/login'); return }
  }

  async function fetchRequests() {
    setLoading(true)
    const { data } = await supabase
      .from('place_requests')
      .select('*')
      .eq('status', tab)
      .order('created_at', { ascending: false })
    if (data) setRequests(data)
    setLoading(false)
  }

  async function fetchPlaces() {
    setLoading(true)
    const { data } = await supabase
      .from('places')
      .select('*, categories(name, icon)')
      .order('created_at', { ascending: false })
    if (data) setPlaces(data)
    setLoading(false)
  }

 async function handleApprove(req: PlaceRequest) {
  try {
    const slug = req.name.replace(/\s+/g, '-').toLowerCase() + '-' + req.id

    const { error: insertError } = await supabase
      .from('places')
      .insert({
        name: req.name,
        name_ku: req.name_ku,
        slug,
        category_id: req.category_id,
        description: req.description,
        address: req.address,
        phone: req.phone,
        whatsapp: req.whatsapp,
        opening_hours: req.opening_hours,
        image: req.image,
        latitude: req.latitude,
        longitude: req.longitude,
        featured: false,
       rating: 0,
reviews_count: 0,
})

    if (insertError) {
      console.error('Insert Error:', insertError)
      alert(`فشل نشر المكان: ${insertError.message}`)
      return
    }

    const { error: updateError } = await supabase
      .from('place_requests')
      .update({ status: 'approved' })
      .eq('id', req.id)

    if (updateError) {
      console.error('Update Error:', updateError)
      alert(`تم نشر المكان لكن فشل تحديث الطلب: ${updateError.message}`)
      return
    }

    alert('تم قبول ونشر المكان بنجاح ✅')
    fetchRequests()

  } catch (err) {
    console.error(err)
    alert('حدث خطأ غير متوقع')
  }
}

async function handleReject(id: number) {
  try {
    const { error } = await supabase
      .from('place_requests')
      .update({ status: 'rejected' })
      .eq('id', id)

    if (error) {
      console.error('Reject Error:', error)
      alert(`فشل رفض الطلب: ${error.message}`)
      return
    }

    alert('تم رفض الطلب ❌')
    fetchRequests()

  } catch (err) {
    console.error(err)
    alert('حدث خطأ غير متوقع')
  }
}

  async function handleDeletePlace(id: number) {
    await supabase.from('reviews').delete().eq('place_id', id)
    await supabase.from('favorites').delete().eq('place_id', id)
    await supabase.from('places').delete().eq('id', id)
    setDeleteConfirm(null)
    fetchPlaces()
  }

  async function toggleFeatured(id: number, current: boolean) {
    await supabase.from('places').update({ featured: !current }).eq('id', id)
    fetchPlaces()
  }

  // شاشة كلمة المرور
  if (!authenticated) {
    return (
      <div style={{ background: '#080C1A', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <style>{`
          .form-input { width:100%; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:14px; padding:14px 16px; color:white; font-size:14px; outline:none; transition:all 0.2s; box-sizing:border-box; }
          .form-input:focus { border-color:rgba(124,77,255,0.5); box-shadow:0 0 0 3px rgba(124,77,255,0.15); }
          .form-input::placeholder { color:rgba(255,255,255,0.25); }
          @keyframes slideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        `}</style>
        <div style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(24px)', border: '1px solid rgba(124,77,255,0.3)', borderRadius: 28, padding: '48px 40px', maxWidth: 420, width: '100%', textAlign: 'center', animation: 'slideUp 0.6s ease', boxShadow: '0 0 60px rgba(124,77,255,0.15)' }}>
          <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg,#7C4DFF,#00E5FF)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 20px', boxShadow: '0 0 30px rgba(124,77,255,0.4)' }}>🔐</div>
          <h1 style={{ color: 'white', fontSize: 22, fontWeight: 900, margin: '0 0 8px' }}>لوحة الإدارة</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 28 }}>أدخل كلمة المرور للمتابعة</p>

          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input
              type="password"
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
              placeholder="كلمة المرور"
              className="form-input"
              required
            />
            {passwordError && (
              <p style={{ color: '#f87171', fontSize: 12, margin: 0, background: 'rgba(239,68,68,0.1)', padding: '8px 12px', borderRadius: 10 }}>❌ {passwordError}</p>
            )}
            <button type="submit" style={{ background: 'linear-gradient(135deg,#7C4DFF,#00E5FF)', color: 'white', border: 'none', borderRadius: 14, padding: '14px', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 20px rgba(124,77,255,0.3)' }}>
              دخول ✦
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#080C1A', minHeight: '100vh', padding: '32px 16px' }}>
      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .glass { background:rgba(255,255,255,0.04); backdrop-filter:blur(24px); border:1px solid rgba(255,255,255,0.08); }
        .tab-btn { transition:all 0.2s ease; cursor:pointer; border:none; }
        .card-item { transition: all 0.2s ease; }
        .card-item:hover { background: rgba(255,255,255,0.06) !important; }
      `}</style>

      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ color: 'white', fontSize: 24, fontWeight: 900, margin: '0 0 6px', background: 'linear-gradient(90deg,#fff,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              لوحة الإدارة
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: 0 }}>إدارة Veyra — أقرة</p>
          </div>
          <button onClick={handleLogout} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: 12, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            خروج 🚪
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {[
            { key: 'pending', label: '⏳ قيد الانتظار' },
            { key: 'approved', label: '✅ مقبولة' },
            { key: 'rejected', label: '❌ مرفوضة' },
            { key: 'places', label: '📍 كل الأماكن' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)} className="tab-btn"
              style={{
                padding: '9px 18px', borderRadius: 12, fontSize: 13, fontWeight: 600,
                background: tab === t.key ? 'linear-gradient(135deg,#7C4DFF,#00E5FF)' : 'rgba(255,255,255,0.05)',
                color: tab === t.key ? 'white' : 'rgba(255,255,255,0.5)',
                border: tab === t.key ? 'none' : '1px solid rgba(255,255,255,0.08)',
                boxShadow: tab === t.key ? '0 4px 16px rgba(124,77,255,0.3)' : 'none',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Requests Tabs */}
        {tab !== 'places' && (
          loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1,2,3].map(i => <div key={i} className="glass" style={{ borderRadius: 20, height: 140 }} />)}
            </div>
          ) : requests.length === 0 ? (
            <div className="glass" style={{ borderRadius: 24, padding: '60px 0', textAlign: 'center' }}>
              <p style={{ fontSize: 40, marginBottom: 12 }}>📭</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15 }}>لا توجد طلبات</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {requests.map((req, i) => (
                <div key={req.id} className="glass card-item" style={{ borderRadius: 22, padding: '20px', animation: `slideUp 0.4s ${i*0.05}s ease both`, opacity: 0 }}>
                  <div style={{ display: 'flex', gap: 16 }}>
                    {req.image && req.image !== 'EMPTY' && (
                      <img src={req.image} alt={req.name} style={{ width: 88, height: 88, objectFit: 'cover', borderRadius: 14, flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div>
                          <h3 style={{ color: 'white', fontWeight: 700, fontSize: 16, margin: '0 0 4px' }}>{req.name}</h3>
                          {req.name_ku && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0 }}>{req.name_ku}</p>}
                        </div>
                        <span style={{
                          fontSize: 11, padding: '4px 12px', borderRadius: 999, fontWeight: 700,
                          background: req.status === 'pending' ? 'rgba(251,191,36,0.15)' : req.status === 'approved' ? 'rgba(52,211,153,0.15)' : 'rgba(239,68,68,0.15)',
                          color: req.status === 'pending' ? '#fbbf24' : req.status === 'approved' ? '#34d399' : '#f87171',
                        }}>
                          {req.status === 'pending' ? '⏳ انتظار' : req.status === 'approved' ? '✅ مقبول' : '❌ مرفوض'}
                        </span>
                      </div>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: '0 0 8px', lineHeight: 1.6 }}>{req.description}</p>
                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>📍 {req.address}</span>
                        {req.phone && <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>📞 {req.phone}</span>}
                        {req.opening_hours && <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>🕐 {req.opening_hours}</span>}
                      </div>
                    </div>
                  </div>

                  {tab === 'pending' && (
                    <div style={{ display: 'flex', gap: 10, marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <button onClick={() => handleApprove(req)}
                        style={{ flex: 1, background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', border: 'none', borderRadius: 12, padding: '11px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                        ✅ قبول ونشر
                      </button>
                      <button onClick={() => handleReject(req.id)}
                        style={{ flex: 1, background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '11px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                        ❌ رفض
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {/* Places Tab */}
        {tab === 'places' && (
          loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1,2,3,4].map(i => <div key={i} className="glass" style={{ borderRadius: 20, height: 80 }} />)}
            </div>
          ) : places.length === 0 ? (
            <div className="glass" style={{ borderRadius: 24, padding: '60px 0', textAlign: 'center' }}>
              <p style={{ fontSize: 40, marginBottom: 12 }}>📭</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15 }}>لا توجد أماكن بعد</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '0 0 8px' }}>
                إجمالي: <span style={{ color: '#00E5FF', fontWeight: 700 }}>{places.length}</span> مكان
              </p>
              {places.map((place, i) => (
                <div key={place.id} className="glass card-item" style={{ borderRadius: 18, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, animation: `slideUp 0.4s ${i*0.04}s ease both`, opacity: 0 }}>
                  {place.image && place.image !== 'EMPTY' ? (
                    <img src={place.image} alt={place.name} style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 12, flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 52, height: 52, background: 'rgba(124,77,255,0.2)', borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                      {place.categories?.icon || '📍'}
                    </div>
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <p style={{ color: 'white', fontWeight: 700, fontSize: 14, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{place.name}</p>
                      {place.featured && <span style={{ background: 'rgba(124,77,255,0.2)', color: '#a78bfa', fontSize: 10, padding: '2px 8px', borderRadius: 999, flexShrink: 0 }}>✦ مميز</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>📍 {place.address}</span>
                      <span style={{ color: '#fbbf24', fontSize: 11 }}>⭐ {place.rating}</span>
                      <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>{place.reviews_count} تقييم</span>
                      {place.categories && <span style={{ color: '#a78bfa', fontSize: 11 }}>{place.categories.icon} {place.categories.name}</span>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    {/* زر تمييز */}
                    <button onClick={() => toggleFeatured(place.id, place.featured)}
                      title={place.featured ? 'إلغاء التمييز' : 'تمييز المكان'}
                      style={{ background: place.featured ? 'rgba(124,77,255,0.3)' : 'rgba(255,255,255,0.06)', border: place.featured ? '1px solid rgba(124,77,255,0.5)' : '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '7px 12px', fontSize: 14, cursor: 'pointer', color: place.featured ? '#a78bfa' : 'rgba(255,255,255,0.4)', transition: 'all 0.2s' }}>
                      ⭐
                    </button>

                    {/* زر حذف */}
                    {deleteConfirm === place.id ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => handleDeletePlace(place.id)}
                          style={{ background: 'rgba(239,68,68,0.9)', color: 'white', border: 'none', borderRadius: 10, padding: '7px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                          تأكيد
                        </button>
                        <button onClick={() => setDeleteConfirm(null)}
                          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '7px 12px', fontSize: 12, cursor: 'pointer' }}>
                          إلغاء
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(place.id)}
                        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', borderRadius: 10, padding: '7px 12px', fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.25)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}>
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

      </div>
    </div>
  )
}
