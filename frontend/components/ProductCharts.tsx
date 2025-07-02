'use client'

import { useMemo } from 'react'
import { Product } from '@/types/product'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts'
import { BarChart3, LineChart as LineChartIcon } from 'lucide-react'

interface ProductChartsProps {
  products: Product[]
}

export function ProductCharts({ products }: ProductChartsProps) {
  const priceDistribution = useMemo(() => {
    const ranges = [
      { min: 0, max: 5000, label: '0-5К ₽' },
      { min: 5000, max: 15000, label: '5-15К ₽' },
      { min: 15000, max: 30000, label: '15-30К ₽' },
      { min: 30000, max: 50000, label: '30-50К ₽' },
      { min: 50000, max: 100000, label: '50-100К ₽' },
      { min: 100000, max: Infinity, label: '100К+ ₽' }
    ]

    return ranges.map(range => ({
      range: range.label,
      count: products.filter(product => {
        const price = parseFloat(product.discounted_price)
        return price >= range.min && price < range.max
      }).length
    }))
  }, [products])

  const discountRatingData = useMemo(() => {
    const ratingGroups: { [key: string]: { discounts: number[]; count: number } } = {}

    products.forEach(product => {
      const originalPrice = parseFloat(product.price)
      const discountedPrice = parseFloat(product.discounted_price)
      const discount = ((originalPrice - discountedPrice) / originalPrice) * 100

      const roundedRating = Math.round(product.rating * 10) / 10
      const ratingKey = roundedRating.toString()

      if (!ratingGroups[ratingKey]) {
        ratingGroups[ratingKey] = { discounts: [], count: 0 }
      }

      ratingGroups[ratingKey].discounts.push(discount)
      ratingGroups[ratingKey].count++
    })

    const lineData = Object.entries(ratingGroups)
      .map(([rating, data]) => ({
        rating: parseFloat(rating),
        discount: Number(
          (data.discounts.reduce((sum, d) => sum + d, 0) / data.discounts.length).toFixed(1)
        ),
        count: data.count
      }))
      .sort((a, b) => a.rating - b.rating)

    return lineData
  }, [products])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey === 'count' ? 'Количество' : 'Скидка'}: ${entry.value}${entry.dataKey === 'discount' ? '%' : ''}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const LineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">Рейтинг: {label} ★</p>
          <p className="text-sm text-muted-foreground">Средняя скидка: {data.discount}%</p>
          <p className="text-sm text-muted-foreground">Товаров: {data.count}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Price Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Распределение по ценам
            <Badge variant="secondary" className="ml-auto">
              Гистограмма
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priceDistribution}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="range"
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                label={{
                  value: 'Ценовой диапазон',
                  position: 'insideBottom',
                  offset: -3,
                  style: {
                    textAnchor: 'middle',
                    fill: 'hsl(var(--muted-foreground))',
                    fontSize: 15,
                    fontWeight: 500
                  }
                }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                label={{
                  value: 'Количество товаров',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 3,
                  style: {
                    textAnchor: 'middle',
                    fill: 'hsl(var(--muted-foreground))',
                    fontSize: 15,
                    fontWeight: 500
                  }
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="count"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                className="hover:opacity-80 transition-opacity"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Discount vs Rating Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChartIcon className="h-5 w-5 text-primary" />
            Скидка vs Рейтинг
            <Badge variant="secondary" className="ml-auto">
              Линейный график
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={discountRatingData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="rating"
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                domain={['dataMin - 0.1', 'dataMax + 0.1']}
                label={{
                  value: 'Рейтинг',
                  position: 'insideBottom',
                  offset: -3,
                  style: {
                    textAnchor: 'middle',
                    fill: 'hsl(var(--muted-foreground))',
                    fontSize: 15,
                    fontWeight: 500
                  }
                }}
              />
              <YAxis
                dataKey="discount"
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                label={{
                  value: 'Скидка (%)',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 3,
                  style: {
                    textAnchor: 'middle',
                    fill: 'hsl(var(--muted-foreground))',
                    fontSize: 15,
                    fontWeight: 500
                  }
                }}
              />
              <Tooltip content={<LineTooltip />} />
              <Line
                type="monotone"
                dataKey="discount"
                stroke="hsl(var(--chart-2))"
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'hsl(var(--chart-2))', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
