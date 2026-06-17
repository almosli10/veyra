export interface Category {
  id: number
  name: string
  name_ku: string
  name_en: string
  icon: string
  slug: string
  count?: number
}

export interface Place {
  id: number
  name: string
  name_ku: string
  slug: string
  category: string
  category_slug: string
  description: string
  address: string
  phone?: string
  whatsapp?: string
  website?: string
  latitude?: number
  longitude?: number
  opening_hours?: string
  featured: boolean
  rating: number
  reviews_count: number
  image: string
  images?: string[]
  created_at: string
}

export interface Review {
  id: number
  user_id: string
  place_id: number
  rating: number
  comment: string
  user_name: string
  created_at: string
}