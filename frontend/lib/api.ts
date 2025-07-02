import { Product, ProductFilters } from '@/types/product'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://api.localhost/v3'

export class ProductsAPI {
  static async getProducts(filters: ProductFilters = {}): Promise<Product[]> {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })

    const url = `${API_BASE_URL}/products/${params.toString() ? `?${params.toString()}` : ''}`

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch products:', error)
      return []
    }
  }

  static async getProduct(id: number): Promise<Product> {
    const url = `${API_BASE_URL}/products/${id}/`

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch product:', error)
      throw error
    }
  }
}
