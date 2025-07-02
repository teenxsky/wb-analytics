'use client'

import { useState, useEffect } from 'react'
import { ProductFilters as IProductFilters } from '@/types/product'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Filter, RotateCcw, TrendingUp, Star, MessageSquare } from 'lucide-react'

interface ProductFiltersProps {
  onFiltersChange: (filters: IProductFilters) => void
  priceRange: { min: number; max: number }
}

export function ProductFilters({ onFiltersChange, priceRange }: ProductFiltersProps) {
  const [filters, setFilters] = useState<IProductFilters>({
    min_price: priceRange.min,
    max_price: priceRange.max,
    min_rating: 0,
    min_reviews: 0
  })

  const [localPriceRange, setLocalPriceRange] = useState([priceRange.min, priceRange.max])

  useEffect(() => {
    setLocalPriceRange([priceRange.min, priceRange.max])
    setFilters(prev => ({
      ...prev,
      min_price: priceRange.min,
      max_price: priceRange.max
    }))
  }, [priceRange])

  const handlePriceRangeChange = (values: number[]) => {
    setLocalPriceRange(values)
    const newFilters = {
      ...filters,
      min_price: values[0],
      max_price: values[1]
    }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleMinRatingChange = (value: string) => {
    const numValue = parseFloat(value) || 0
    const newFilters = {
      ...filters,
      min_rating: numValue
    }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleMinReviewsChange = (value: string) => {
    const numValue = parseInt(value) || 0
    const newFilters = {
      ...filters,
      min_reviews: numValue
    }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const resetFilters = () => {
    const resetFilters = {
      min_price: priceRange.min,
      max_price: priceRange.max,
      min_rating: 0,
      min_reviews: 0
    }
    setFilters(resetFilters)
    setLocalPriceRange([priceRange.min, priceRange.max])
    onFiltersChange(resetFilters)
  }

  const hasActiveFilters =
    filters.min_price !== priceRange.min ||
    filters.max_price !== priceRange.max ||
    (filters.min_rating && filters.min_rating > 0) ||
    (filters.min_reviews && filters.min_reviews > 0)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Фильтры
            {!!hasActiveFilters && (
              <Badge variant="default" className="ml-2 align-middle">
                Активны
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button
          variant="outline"
          size="sm"
          onClick={resetFilters}
          className="flex items-center gap-1 mb-6"
        >
          <RotateCcw className="h-4 w-4" />
          Сбросить
        </Button>
        {/* Price Range */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-base font-medium">
            <TrendingUp className="h-4 w-4 text-green-600" />
            Диапазон цен
          </Label>
          <div className="flex items-center px-3">
            <Slider
              value={localPriceRange}
              onValueChange={handlePriceRangeChange}
              min={priceRange.min}
              max={priceRange.max}
              step={100}
            />
          </div>
          {(localPriceRange[0] !== priceRange.min || localPriceRange[1] !== priceRange.max) && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              {localPriceRange[0] !== priceRange.min && (
                <span>{localPriceRange[0].toLocaleString()} ₽</span>
              )}
              {localPriceRange[1] !== priceRange.max && (
                <span>{localPriceRange[1].toLocaleString()} ₽</span>
              )}
            </div>
          )}
        </div>

        {/* Minimum Rating */}
        <div className="space-y-3">
          <Label htmlFor="min-rating" className="flex items-center gap-2 text-base font-medium">
            <Star className="h-4 w-4 text-yellow-500" />
            Минимальный рейтинг
          </Label>
          <Input
            id="min-rating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={filters.min_rating || ''}
            onChange={e => handleMinRatingChange(e.target.value)}
            placeholder="например, 4.0"
            className="w-full"
          />
          {(filters.min_rating ?? 0) > 0 && (
            <div className="text-xs text-muted-foreground">
              Товары с рейтингом от {filters.min_rating} звезд
            </div>
          )}
        </div>

        {/* Minimum Reviews */}
        <div className="space-y-3">
          <Label htmlFor="min-reviews" className="flex items-center gap-2 text-base font-medium">
            <MessageSquare className="h-4 w-4 text-blue-500" />
            Минимум отзывов
          </Label>
          <Input
            id="min-reviews"
            type="number"
            min="0"
            value={filters.min_reviews || ''}
            onChange={e => handleMinReviewsChange(e.target.value)}
            placeholder="например, 100"
            className="w-full"
          />
          {(filters.min_reviews ?? 0) > 0 && (
            <div className="text-xs text-muted-foreground">
              Товары с количеством отзывов от {filters.min_reviews}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
