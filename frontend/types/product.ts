export interface Product {
  id: number
  name: string
  price: string
  discounted_price: string
  rating: number
  reviews_count: number
  created_at: string
}

export interface ProductFilters {
  min_price?: number
  max_price?: number
  min_rating?: number
  min_reviews?: number
  ordering?: string
}

export interface PriceDistribution {
  range: string
  count: number
}

export interface DiscountRatingData {
  rating: number
  discount: number
}
