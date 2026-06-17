import { createContext, useContext, useState, useEffect } from 'react'

export type Lang = 'ar' | 'ku' | 'en'

interface LangContextType {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
}

const translations: Record<Lang, Record<string, string>> = {
  ar: {
    home: 'الرئيسية',
    tourism: 'سياحة',
    restaurants: 'مطاعم',
    hotels: 'فنادق',
    cafes: 'كافيهات',
    markets: 'أسواق',
    addPlace: '+ أضف مكانك',
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    logout: 'خروج',
    profile: 'حسابي',
    heroTitle: 'اكتشف أجمل الأماكن',
    heroSubtitle: 'في مدينة أقرة',
    heroDesc: 'مطاعم، كافيهات، فنادق، أماكن سياحية — كل ما تحتاجه في مكان واحد',
    searchPlaceholder: 'ابحث عن مطعم، كافيه، فندق...',
    search: 'بحث',
    categories: 'تصفح حسب الفئة',
    featured: 'أبرز الأماكن',
    recent: 'أضيف مؤخراً',
    exploreTitle: 'استكشف أقرة العريقة',
    exploreDesc: 'مدينة تاريخية محاطة بالجبال والطبيعة — اكتشف قلعتها، شلالاتها، وأسواقها العتيقة',
    exploreBtn: 'استكشف الآن ✦',
    badge: '✨ اكتشف أقرة — كردستان العراق',
    mountains: 'جبال شاهقة',
    waterfalls: 'شلالات طبيعية',
    history: 'تاريخ عريق',
    searchResults: 'نتائج البحث عن',
    noResults: 'لا توجد نتائج',
    clearSearch: 'مسح البحث',
    places: 'مكان',
    searching: 'جاري البحث...',
  },
  ku: {
    home: 'سەرەکی',
    tourism: 'گەشتوگوزار',
    restaurants: 'چێشتخانەکان',
    hotels: 'هوتێلەکان',
    cafes: 'کافێکان',
    markets: 'بازارەکان',
    addPlace: '+ شوێنەکەت زیادبکە',
    login: 'چوونەژوورەوە',
    register: 'هەژمار دروستبکە',
    logout: 'دەرچوون',
    profile: 'هەژمارەکەم',
    heroTitle: 'جوانترین شوێنەکان بدۆزەرەوە',
    heroSubtitle: 'لە شاری عەقرە',
    heroDesc: 'چێشتخانە، کافێ، هوتێل، شوێنی گەشتوگوزار — هەموو ئەوەی پێویستتە لە یەک شوێن',
    searchPlaceholder: 'بگەڕێ بۆ چێشتخانە، کافێ، هوتێل...',
    search: 'گەڕان',
    categories: 'بەپێی جۆر بگەڕێ',
    featured: 'باشترین شوێنەکان',
    recent: 'تازە زیادکراو',
    exploreTitle: 'عەقرەی کۆنەپەرست بگەڕێ',
    exploreDesc: 'شاری مێژوویی دوورگیراوی چیا و سروشت — قەڵاکەی، ئاڕیژاوەکانی، و بازاری کۆنەکانی بدۆزەرەوە',
    exploreBtn: 'ئێستا بگەڕێ ✦',
    badge: '✨ عەقرە بدۆزەرەوە — کوردستانی عێراق',
    mountains: 'چیای بەرز',
    waterfalls: 'ئاڕیژاوەی سروشتی',
    history: 'مێژووی کۆن',
    searchResults: 'ئەنجامی گەڕان بۆ',
    noResults: 'هیچ ئەنجامێک نەدۆزرایەوە',
    clearSearch: 'گەڕانەکە پاک بکەرەوە',
    places: 'شوێن',
    searching: 'دەگەڕێت...',
  },
  en: {
    home: 'Home',
    tourism: 'Tourism',
    restaurants: 'Restaurants',
    hotels: 'Hotels',
    cafes: 'Cafes',
    markets: 'Markets',
    addPlace: '+ Add Your Place',
    login: 'Login',
    register: 'Sign Up',
    logout: 'Logout',
    profile: 'My Account',
    heroTitle: 'Discover the Most Beautiful Places',
    heroSubtitle: 'in Akre City',
    heroDesc: 'Restaurants, Cafes, Hotels, Tourist Spots — Everything you need in one place',
    searchPlaceholder: 'Search for a restaurant, cafe, hotel...',
    search: 'Search',
    categories: 'Browse by Category',
    featured: 'Featured Places',
    recent: 'Recently Added',
    exploreTitle: 'Explore Ancient Akre',
    exploreDesc: 'A historic city surrounded by mountains and nature — Discover its castle, waterfalls, and ancient markets',
    exploreBtn: 'Explore Now ✦',
    badge: '✨ Discover Akre — Kurdistan, Iraq',
    mountains: 'Towering Mountains',
    waterfalls: 'Natural Waterfalls',
    history: 'Ancient History',
    searchResults: 'Search results for',
    noResults: 'No results found',
    clearSearch: 'Clear Search',
    places: 'places',
    searching: 'Searching...',
  },
}

const LangContext = createContext<LangContextType>({
  lang: 'ar',
  setLang: () => {},
  t: (key) => key,
})

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem('veyra_lang') as Lang) || 'ar'
  })

  function setLang(l: Lang) {
    setLangState(l)
    localStorage.setItem('veyra_lang', l)
    document.dir = l === 'en' ? 'ltr' : 'rtl'
  }

  useEffect(() => {
    document.dir = lang === 'en' ? 'ltr' : 'rtl'
  }, [])

  function t(key: string): string {
    return translations[lang][key] || translations['ar'][key] || key
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
