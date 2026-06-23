import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

interface Place {
  id: number; name: string; slug: string; image: string
  address: string; rating: number
  categories?: { name: string; icon: string }
}

interface MyPlace {
  id: number; name: string; slug: string; image: string
  address: string; rating: number; status: string
  categories?: { name: string; icon: string }
}

interface PlaceImage {
  id: number; image_url: string
}

function TiltCard({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null)
  function onMove(e: React.MouseEvent) {
    const el = ref.current; if (!el) return
    const r = el.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width - 0.5) * 14
    const y = ((e.clientY - r.top) / r.height - 0.5) * -14
    el.style.transform = `perspective(800px) rotateX(${y}deg) rotateY(${x}deg) translateZ(10px)`
  }
  function onLeave() {
    const el = ref.current; if (!el) return
    el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)'
  }
  return <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={{ transition: 'transform 0.15s ease', transformStyle: 'preserve-3d', ...style }}>{children}</div>
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [favorites, setFavorites] = useState<Place[]>([])
  const [myPlaces, setMyPlaces] = useState<MyPlace[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'favorites' | 'myplaces' | 'info'>('favorites')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [editingPlace, setEditingPlace] = useState<MyPlace | null>(null)
  const [editForm, setEditForm] = useState({ name: '', address: '', description: '', phone: '', opening_hours: '' })
  const [editLoading, setEditLoading] = useState(false)
  const [placeImages, setPlaceImages] = useState<PlaceImage[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)
  const [deletingImageId, setDeletingImageId] = useState<number | null>(null)

  useEffect(() => { checkUser() }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { navigate('/login'); return }
    setUser(user)
    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (profileData) setProfile(profileData)
    fetchFavorites(user.id)
    fetchMyPlaces(user.id)
  }

  async function fetchFavorites(userId: string) {
    setLoading(true)
    const { data } = await supabase.from('favorites').select('place_id, places(id, name, slug, image, address, rating, categories(name, icon))').eq('user_id', userId).order('created_at', { ascending: false })
    if (data) setFavorites(data.map((f: any) => f.places).filter(Boolean))
    setLoading(false)
  }

  async function fetchMyPlaces(userId: string) {
    const { data } = await supabase.from('places').select('id, name, slug, image, address, rating, categories(name, icon)').eq('owner_id', userId).order('created_at', { ascending: false })
    if (data) setMyPlaces(data.map((p: any) => ({ ...p, status: 'approved' })) as any)
  }

  async function fetchPlaceImages(placeId: number) {
    const { data } = await supabase.from('place_images').select('id, image_url').eq('place_id', placeId).order('created_at', { ascending: true })
    if (data) setPlaceImages(data)
  }

  async function removeFavorite(placeId: number) {
    await supabase.from('favorites').delete().eq('user_id', user.id).eq('place_id', placeId)
    setFavorites(prev => prev.filter(p => p.id !== placeId))
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setUploadingAvatar(true)
    const fileName = `avatar_${user.id}_${Date.now()}.${file.name.split('.').pop()}`
    const { data, error } = await supabase.storage.from('places').upload(fileName, file)
    if (!error && data) {
      const { data: urlData } = supabase.storage.from('places').getPublicUrl(fileName)
      await supabase.from('profiles').update({ avatar_url: urlData.publicUrl }).eq('id', user.id)
      setProfile((prev: any) => ({ ...prev, avatar_url: urlData.publicUrl }))
    }
    setUploadingAvatar(false)
  }

  function openEdit(place: MyPlace) {
    setEditingPlace(place)
    setEditForm({ name: place.name, address: place.address, description: '', phone: '', opening_hours: '' })
    fetchPlaceImages(place.id)
  }

  async function saveEdit() {
    if (!editingPlace) return
    setEditLoading(true)
    const newSlug = editForm.name.replace(/\s+/g, '-').toLowerCase() + '-' + editingPlace.id
    await supabase.from('places').update({
      name: editForm.name,
      slug: newSlug,
      address: editForm.address,
      phone: editForm.phone,
      opening_hours: editForm.opening_hours,
    }).eq('id', editingPlace.id)
    setEditingPlace(null)
    fetchMyPlaces(user.id)
    setEditLoading(false)
    alert('✅ تم تحديث المكان بنجاح!')
  }

  async function handleAddImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file || !editingPlace) return
    setUploadingImage(true)
    const fileName = `place_${editingPlace.id}_${Date.now()}.${file.name.split('.').pop()}`
    const { data, error } = await supabase.storage.from('places').upload(fileName, file)
    if (!error && data) {
      const { data: urlData } = supabase.storage.from('places').getPublicUrl(fileName)
      const { data: imgData } = await supabase.from('place_images').insert({ place_id: editingPlace.id, image_url: urlData.publicUrl }).select().single()
      if (imgData) setPlaceImages(prev => [...prev, imgData])
      // اذا ما عنده صورة رئيسية، نحدثها
      if (!editingPlace.image || editingPlace.image === 'EMPTY') {
        await supabase.from('places').update({ image: urlData.publicUrl }).eq('id', editingPlace.id)
      }
    }
    setUploadingImage(false)
    e.target.value = ''
  }

  async function handleDeleteImage(img: PlaceImage) {
    if (!editingPlace) return
    setDeletingImageId(img.id)
    // استخراج اسم الملف من الـ URL
    const fileName = img.image_url.split('/').pop()
    if (fileName) await supabase.storage.from('places').remove([fileName])
    await supabase.from('place_images').delete().eq('id', img.id)
    setPlaceImages(prev => prev.filter(i => i.id !== img.id))
    // اذا كانت الصورة الرئيسية للمكان، نحدثها بأول صورة متبقية
    const remaining = placeImages.filter(i => i.id !== img.id)
    if (editingPlace.image === img.image_url) {
      const newMain = remaining[0]?.image_url || 'EMPTY'
      await supabase.from('places').update({ image: newMain }).eq('id', editingPlace.id)
    }
    setDeletingImageId(null)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (loading) return (
    <div style={{ background: '#080C1A', minHeight: '100vh', padding: '40px 16px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 28, height: 160, marginBottom: 24 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[1,2,3,4].map(i => <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 20, height: 200 }} />)}
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ background: '#080C1A', minHeight: '100vh' }}>
      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes rotate-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .glass { background:rgba(255,255,255,0.04); backdrop-filter:blur(24px); border:1px solid rgba(255,255,255,0.08); }
        .glass-strong { background:rgba(255,255,255,0.07); backdrop-filter:blur(40px); border:1px solid rgba(255,255,255,0.12); }
        .neon-border { border:1px solid rgba(124,77,255,0.3) !important; }
        .tab-btn { transition:all 0.25s ease; cursor:pointer; border:none; }
        .fav-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .fav-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(124,77,255,0.2); }
        .info-row { transition:background 0.2s; border-radius:14px; padding:14px; }
        .info-row:hover { background:rgba(124,77,255,0.08); }
        .logout-btn { transition:all 0.2s ease; cursor:pointer; border:none; width:100%; }
        .logout-btn:hover { background:rgba(239,68,68,0.15) !important; }
        .avatar-upload:hover .avatar-overlay { opacity: 1 !important; }
        .form-input { width:100%; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:10px 14px; color:white; font-size:13px; outline:none; box-sizing:border-box; }
        .form-input:focus { border-color:rgba(124,77,255,0.5); }
        .img-thumb { position:relative; border-radius:10px; overflow:hidden; }
        .img-thumb:hover .img-delete { opacity:1 !important; }
      `}</style>

      {/* Modal تعديل المكان */}
      {editingPlace && (
        <div onClick={() => setEditingPlace(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#0F1629', border: '1px solid rgba(124,77,255,0.3)', borderRadius: 24, padding: 28, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ color: 'white', fontWeight: 700, fontSize: 16, margin: '0 0 20px' }}>✏️ تعديل المكان</h3>

            {/* بيانات المكان */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, display: 'block', marginBottom: 6 }}>اسم المكان</label>
                <input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} className="form-input" />
              </div>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, display: 'block', marginBottom: 6 }}>العنوان</label>
                <input value={editForm.address} onChange={e => setEditForm(p => ({ ...p, address: e.target.value }))} className="form-input" />
              </div>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, display: 'block', marginBottom: 6 }}>رقم الهاتف</label>
                <input value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} className="form-input" />
              </div>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, display: 'block', marginBottom: 6 }}>ساعات العمل</label>
                <input value={editForm.opening_hours} onChange={e => setEditForm(p => ({ ...p, opening_hours: e.target.value }))} className="form-input" />
              </div>
            </div>

            {/* قسم الصور */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 700, margin: 0 }}>🖼️ الصور ({placeImages.length})</p>
                <label style={{ background: 'rgba(124,77,255,0.2)', border: '1px solid rgba(124,77,255,0.4)', color: '#a78bfa', borderRadius: 10, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: uploadingImage ? 'not-allowed' : 'pointer', opacity: uploadingImage ? 0.6 : 1 }}>
                  {uploadingImage ? '⏳ جاري الرفع...' : '+ إضافة صورة'}
                  <input type="file" accept="image/*" onChange={handleAddImage} style={{ display: 'none' }} disabled={uploadingImage} />
                </label>
              </div>

              {placeImages.length === 0 ? (
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 14, padding: '24px', textAlign: 'center' }}>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, margin: 0 }}>لا توجد صور، أضف صورة للمكان</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {placeImages.map(img => (
                    <div key={img.id} className="img-thumb" style={{ aspectRatio: '1', background: 'rgba(255,255,255,0.05)' }}>
                      <img src={img.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      <button
                        className="img-delete"
                        onClick={() => handleDeleteImage(img)}
                        disabled={deletingImageId === img.id}
                        style={{ position: 'absolute', inset: 0, background: 'rgba(239,68,68,0.75)', border: 'none', color: 'white', fontSize: 20, cursor: 'pointer', opacity: 0, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {deletingImageId === img.id ? '⏳' : '🗑️'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* أزرار الحفظ والإلغاء */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={saveEdit} disabled={editLoading}
                style={{ flex: 1, background: 'linear-gradient(135deg,#7C4DFF,#00E5FF)', color: 'white', border: 'none', borderRadius: 12, padding: '12px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                {editLoading ? '⏳ جاري الحفظ...' : '💾 حفظ التعديلات'}
              </button>
              <button onClick={() => setEditingPlace(null)}
                style={{ flex: 1, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px', fontSize: 13, cursor: 'pointer' }}>
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '52px 16px 40px' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0B1020 0%, #1a0533 60%, #030812 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(124,77,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(124,77,255,0.05) 1px,transparent 1px)`, backgroundSize: '50px 50px' }} />
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,77,255,0.2) 0%, transparent 70%)', animation: 'floatY 8s ease-in-out infinite' }} />

        <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ position: 'relative', flexShrink: 0 }} className="avatar-upload">
                <div style={{ position: 'absolute', inset: -6, borderRadius: '50%', border: '1px solid rgba(124,77,255,0.4)', animation: 'rotate-slow 10s linear infinite' }}>
                  <div style={{ position: 'absolute', top: -3, left: '50%', width: 6, height: 6, borderRadius: '50%', background: '#7C4DFF', boxShadow: '0 0 10px #7C4DFF' }} />
                </div>
                <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', boxShadow: '0 0 30px rgba(124,77,255,0.5)', position: 'relative' }}>
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #7C4DFF, #00E5FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 28, fontWeight: 900 }}>
                      {user?.user_metadata?.full_name?.[0]?.toUpperCase() || '👤'}
                    </div>
                  )}
                  <label className="avatar-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: 0, transition: 'opacity 0.2s', fontSize: 20 }}>
                    {uploadingAvatar ? '⏳' : '📷'}
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} disabled={uploadingAvatar} />
                  </label>
                </div>
              </div>

              <div style={{ animation: 'slideUp 0.6s ease' }}>
                <h1 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 6px', background: 'linear-gradient(90deg,#fff,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {user?.user_metadata?.full_name || 'المستخدم'}
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '0 0 6px' }}>{user?.email}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#f87171', fontSize: 14 }}>❤️</span>
                    <span style={{ color: '#00E5FF', fontWeight: 700, fontSize: 14 }}>{favorites.length}</span>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>محفوظ</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#a78bfa', fontSize: 14 }}>📍</span>
                    <span style={{ color: '#00E5FF', fontWeight: 700, fontSize: 14 }}>{myPlaces.length}</span>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>مكان منشور</span>
                  </div>
                </div>
              </div>
            </div>

            <button onClick={handleLogout} className="logout-btn glass"
              style={{ borderRadius: 14, padding: '10px 20px', fontSize: 13, color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', width: 'auto', maxWidth: 120 }}>
              خروج 🚪
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '28px 16px 60px' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 18, padding: 4, marginBottom: 28, animation: 'slideUp 0.5s 0.1s ease both', opacity: 0 }}>
          {[
            { key: 'favorites', label: `المفضلة (${favorites.length})`, icon: '❤️' },
            { key: 'myplaces', label: `أماكني (${myPlaces.length})`, icon: '📍' },
            { key: 'info', label: 'الحساب', icon: '👤' }
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)} className="tab-btn"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px 8px', borderRadius: 14, fontSize: 13, fontWeight: 600, background: activeTab === tab.key ? 'linear-gradient(135deg,#7C4DFF,#00E5FF)' : 'transparent', color: activeTab === tab.key ? 'white' : 'rgba(255,255,255,0.45)', boxShadow: activeTab === tab.key ? '0 4px 20px rgba(124,77,255,0.4)' : 'none' }}>
              <span>{tab.icon}</span><span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div style={{ animation: 'slideUp 0.4s ease' }}>
            {favorites.length === 0 ? (
              <div className="glass" style={{ borderRadius: 24, padding: '64px 0', textAlign: 'center' }}>
                <p style={{ fontSize: 48, marginBottom: 16 }}>🤍</p>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: 16, marginBottom: 8 }}>لا توجد أماكن محفوظة بعد</p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginBottom: 24 }}>اضغط ❤️ على أي مكان لحفظه هنا</p>
                <Link to="/" style={{ background: 'linear-gradient(135deg,#7C4DFF,#00E5FF)', color: 'white', fontSize: 13, padding: '12px 28px', borderRadius: 14, textDecoration: 'none', fontWeight: 700 }}>استكشف الأماكن ✦</Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
                {favorites.map((place, i) => (
                  <div key={place.id} className="fav-card glass" style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', animation: `slideUp 0.4s ${i*0.06}s ease both`, opacity: 0 }}>
                    <div style={{ position: 'relative' }}>
                      <Link to={`/place/${place.slug}`}>
                        <img src={place.image && place.image !== 'EMPTY' ? place.image : 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'} alt={place.name}
                          style={{ width: '100%', height: 150, objectFit: 'cover', display: 'block' }} />
                      </Link>
                      <button onClick={() => removeFavorite(place.id)}
                        style={{ position: 'absolute', top: 10, left: 10, width: 32, height: 32, borderRadius: '50%', background: 'rgba(239,68,68,0.8)', backdropFilter: 'blur(10px)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                        ❤️
                      </button>
                    </div>
                    <div style={{ padding: '12px 14px 14px' }}>
                      {place.categories && <span style={{ fontSize: 11, color: '#a78bfa', background: 'rgba(124,77,255,0.15)', padding: '3px 10px', borderRadius: 999 }}>{place.categories.icon} {place.categories.name}</span>}
                      <Link to={`/place/${place.slug}`} style={{ textDecoration: 'none' }}>
                        <p style={{ color: 'white', fontWeight: 600, fontSize: 14, margin: '8px 0 6px' }}>{place.name}</p>
                      </Link>
                      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: '0 0 4px' }}>📍 {place.address}</p>
                      <p style={{ color: '#fbbf24', fontSize: 12, fontWeight: 700, margin: 0 }}>⭐ {place.rating}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Places Tab */}
        {activeTab === 'myplaces' && (
          <div style={{ animation: 'slideUp 0.4s ease' }}>
            {myPlaces.length === 0 ? (
              <div className="glass" style={{ borderRadius: 24, padding: '64px 0', textAlign: 'center' }}>
                <p style={{ fontSize: 48, marginBottom: 16 }}>📍</p>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: 16, marginBottom: 8 }}>لم تضف أي مكان بعد</p>
                <Link to="/add-place" style={{ background: 'linear-gradient(135deg,#7C4DFF,#00E5FF)', color: 'white', fontSize: 13, padding: '12px 28px', borderRadius: 14, textDecoration: 'none', fontWeight: 700 }}>أضف مكانك ✦</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {myPlaces.map((place, i) => (
                  <div key={place.id} className="glass" style={{ borderRadius: 18, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, animation: `slideUp 0.4s ${i*0.05}s ease both`, opacity: 0 }}>
                    {place.image && place.image !== 'EMPTY' ? (
                      <img src={place.image} alt={place.name} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 12, flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 56, height: 56, background: 'rgba(124,77,255,0.2)', borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>📍</div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: 'white', fontWeight: 700, fontSize: 14, margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{place.name}</p>
                      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: '0 0 4px' }}>📍 {place.address}</p>
                      <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, fontWeight: 700, background: place.status === 'pending' ? 'rgba(251,191,36,0.15)' : place.status === 'approved' ? 'rgba(52,211,153,0.15)' : 'rgba(239,68,68,0.15)', color: place.status === 'pending' ? '#fbbf24' : place.status === 'approved' ? '#34d399' : '#f87171' }}>
                        {place.status === 'pending' ? '⏳ قيد المراجعة' : place.status === 'approved' ? '✅ منشور' : '❌ مرفوض'}
                      </span>
                    </div>
                    <button onClick={() => openEdit(place)}
                      style={{ background: 'rgba(124,77,255,0.15)', border: '1px solid rgba(124,77,255,0.3)', color: '#a78bfa', borderRadius: 10, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
                      ✏️ تعديل
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Info Tab */}
        {activeTab === 'info' && (
          <div style={{ animation: 'slideUp 0.4s ease' }}>
            <TiltCard>
              <div className="glass neon-border" style={{ borderRadius: 24, padding: 24 }}>
                <h3 style={{ color: 'white', fontWeight: 700, fontSize: 16, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ background: 'rgba(124,77,255,0.2)', borderRadius: 10, padding: '4px 8px' }}>👤</span>
                  معلومات الحساب
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div className="info-row" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ width: 40, height: 40, background: 'rgba(96,165,250,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>👤</span>
                    <div><p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: '0 0 2px' }}>الاسم</p><p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, margin: 0, fontWeight: 600 }}>{user?.user_metadata?.full_name || '—'}</p></div>
                  </div>
                  <div className="info-row" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ width: 40, height: 40, background: 'rgba(167,139,250,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>📧</span>
                    <div><p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: '0 0 2px' }}>البريد الإلكتروني</p><p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, margin: 0 }}>{user?.email}</p></div>
                  </div>
                  <div className="info-row" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ width: 40, height: 40, background: 'rgba(52,211,153,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>📅</span>
                    <div><p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: '0 0 2px' }}>تاريخ الانضمام</p><p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, margin: 0 }}>{new Date(user?.created_at).toLocaleDateString('ar-IQ')}</p></div>
                  </div>
                  <div className="info-row" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ width: 40, height: 40, background: 'rgba(239,68,68,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>❤️</span>
                    <div><p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: '0 0 2px' }}>الأماكن المحفوظة</p><p style={{ color: '#00E5FF', fontSize: 18, fontWeight: 900, margin: 0 }}>{favorites.length}</p></div>
                  </div>
                  <div className="info-row" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ width: 40, height: 40, background: 'rgba(124,77,255,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>📍</span>
                    <div><p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: '0 0 2px' }}>الأماكن المنشورة</p><p style={{ color: '#00E5FF', fontSize: 18, fontWeight: 900, margin: 0 }}>{myPlaces.length}</p></div>
                  </div>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 20, paddingTop: 20 }}>
                  <button onClick={handleLogout} className="logout-btn"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 14, padding: '13px', fontSize: 14, color: '#f87171', fontWeight: 700 }}>
                    تسجيل الخروج 🚪
                  </button>
                </div>
              </div>
            </TiltCard>
          </div>
        )}
      </div>
    </div>
  )
}