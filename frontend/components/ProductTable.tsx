'use client'

import { useState, useMemo } from 'react'
import { Product } from '@/types/product'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpDown, ArrowUp, ArrowDown, Star, MessageSquare } from 'lucide-react'

interface ProductTableProps {
  products: Product[]
  onSort: (field: string, direction: 'asc' | 'desc') => void
}

type SortField = 'name' | 'price' | 'discounted_price' | 'rating' | 'reviews_count'
type SortDirection = 'asc' | 'desc'

export function ProductTable({ products, onSort }: ProductTableProps) {
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const handleSort = (field: SortField) => {
    let newDirection: SortDirection = 'asc'

    if (sortField === field && sortDirection === 'asc') {
      newDirection = 'desc'
    }

    setSortField(field)
    setSortDirection(newDirection)
    onSort(field, newDirection)
  }

  const formatPrice = (price: string) => {
    return `${parseFloat(price).toLocaleString()} ₽`
  }

  const calculateDiscount = (originalPrice: string, discountedPrice: string) => {
    const original = parseFloat(originalPrice)
    const discounted = parseFloat(discountedPrice)
    const discountPercent = ((original - discounted) / original) * 100
    return discountPercent
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    )
  }

  const sortedProducts = useMemo(() => {
    if (!sortField) return products

    return [...products].sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (sortField === 'price' || sortField === 'discounted_price') {
        aValue = parseFloat(aValue)
        bValue = parseFloat(bValue)
      }

      if (sortField === 'name') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }, [products, sortField, sortDirection])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Таблица товаров
          <Badge variant="secondary" className="ml-auto">
            {products.length} товаров
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-muted/50">
                <TableHead className="font-semibold">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('name')}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Название товара
                    {getSortIcon('name')}
                  </Button>
                </TableHead>
                <TableHead className="font-semibold">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('price')}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Цена
                    {getSortIcon('price')}
                  </Button>
                </TableHead>
                <TableHead className="font-semibold">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('discounted_price')}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Цена со скидкой
                    {getSortIcon('discounted_price')}
                  </Button>
                </TableHead>
                <TableHead className="font-semibold">Скидка</TableHead>
                <TableHead className="font-semibold">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('rating')}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Рейтинг
                    {getSortIcon('rating')}
                  </Button>
                </TableHead>
                <TableHead className="font-semibold">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('reviews_count')}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Отзывы
                    {getSortIcon('reviews_count')}
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProducts.map(product => {
                const discount = calculateDiscount(product.price, product.discounted_price)
                return (
                  <TableRow key={product.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <span className="text-muted-foreground line-through">
                        {formatPrice(product.price)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-green-600">
                        {formatPrice(product.discounted_price)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={discount > 20 ? 'default' : 'secondary'}>
                        -{discount.toFixed(0)}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{product.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.reviews_count.toLocaleString()}</Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
