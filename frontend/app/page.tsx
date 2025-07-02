'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Product, ProductFilters } from '@/types/product'
import { ProductsAPI } from '@/lib/api'
import { ProductTable } from '@/components/ProductTable'
import { ProductFilters as ProductFiltersComponent } from '@/components/ProductFilters'
import { ProductCharts } from '@/components/ProductCharts'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { BarChart3, TrendingUp, Star, Package, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<ProductFilters>({})

  const priceRange = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 100000 }

    const prices = products.map(p => parseFloat(p.discounted_price))
    return {
      min: Math.floor(Math.min(...prices) / 100) * 100,
      max: Math.ceil(Math.max(...prices) / 100) * 100
    }
  }, [products])

  const stats = useMemo(() => {
    const avgRating =
      filteredProducts.length > 0
        ? filteredProducts.reduce((sum, p) => sum + p.rating, 0) / filteredProducts.length
        : 0

    const totalReviews = filteredProducts.reduce((sum, p) => sum + p.reviews_count, 0)

    const avgDiscount =
      filteredProducts.length > 0
        ? filteredProducts.reduce((sum, p) => {
            const original = parseFloat(p.price)
            const discounted = parseFloat(p.discounted_price)
            return sum + ((original - discounted) / original) * 100
          }, 0) / filteredProducts.length
        : 0

    return {
      totalProducts: filteredProducts.length,
      avgRating: avgRating.toFixed(1),
      totalReviews,
      avgDiscount: avgDiscount.toFixed(1)
    }
  }, [filteredProducts])

  useEffect(() => {
    loadProducts()
  }, [])

  const applyFilters = useCallback(() => {
    let filtered = [...products]

    if (filters.min_price !== undefined) {
      filtered = filtered.filter(p => parseFloat(p.discounted_price) >= filters.min_price!)
    }
    if (filters.max_price !== undefined) {
      filtered = filtered.filter(p => parseFloat(p.discounted_price) <= filters.max_price!)
    }
    if (filters.min_rating !== undefined && filters.min_rating > 0) {
      filtered = filtered.filter(p => p.rating >= filters.min_rating!)
    }
    if (filters.min_reviews !== undefined && filters.min_reviews > 0) {
      filtered = filtered.filter(p => p.reviews_count >= filters.min_reviews!)
    }

    setFilteredProducts(filtered)
  }, [products, filters])

  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await ProductsAPI.getProducts()
      setProducts(data)
    } catch (err) {
      setError('Не удалось загрузить товары. Попробуйте еще раз.')
      console.error('Error loading products:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    const orderingValue = direction === 'desc' ? `-${field}` : field
    setFilters(prev => ({ ...prev, ordering: orderingValue }))
  }

  const handleFiltersChange = (newFilters: ProductFilters) => {
    setFilters(newFilters)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <Skeleton className="h-12 w-96 mx-auto" />
            <Skeleton className="h-6 w-64 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-8 w-full mb-2" />
                  <Skeleton className="h-12 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <Skeleton className="h-96 w-full" />
            </div>
            <div className="lg:col-span-3">
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <Alert className="max-w-md mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              {error}
              <Button variant="outline" size="sm" onClick={loadProducts} className="ml-3">
                <RefreshCw className="h-4 w-4 mr-1" />
                Повторить
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-900 to-indigo-600 bg-clip-text text-transparent">
            WB Analytics
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Аналитическая панель товаров Wildberries с данными о ценах, рейтингах и отзывах
            покупателей
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Всего товаров</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.totalProducts}</p>
                </div>
                <Package className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Средний рейтинг</p>
                  <p className="text-3xl font-bold text-green-600">{stats.avgRating}</p>
                </div>
                <Star className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Всего отзывов</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {stats.totalReviews.toLocaleString()}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Средняя скидка</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.avgDiscount}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts - Moved to top */}
        <ProductCharts products={filteredProducts} />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <ProductFiltersComponent
              onFiltersChange={handleFiltersChange}
              priceRange={priceRange}
            />
          </div>

          {/* Products Table */}
          <div className="lg:col-span-3">
            <ProductTable products={filteredProducts} onSort={handleSort} />
          </div>
        </div>
      </div>
    </div>
  )
}
