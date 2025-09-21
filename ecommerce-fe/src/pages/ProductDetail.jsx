import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { Card, Button } from '../components/Kit'
import { makeT } from '../i18n'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const lang = localStorage.getItem('lang') || 'vi'
  const t = makeT(lang)

  useEffect(() => {
    setLoading(true)
    api.getProduct(id)
      .then(setItem)
      .catch(() => setError('notFound'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Card>
          <div className="p-6 animate-pulse space-y-4">
            <div className="h-6 bg-base-soft rounded-xl" />
            <div className="h-72 md:h-[420px] bg-base-soft rounded-2xl" />
          </div>
        </Card>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <div className="p-6 space-y-4">
            <div className="text-base-mute">{t('notFound')}</div>
            <Button variant="ghost" onClick={() => navigate(-1)}>← {t('back')}</Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)}>← {t('back')}</Button>
      </div>

      <Card>
        <div className="p-5 grid md:grid-cols-[420px_1fr] gap-6">
          <div className="group">
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-[360px] md:h-[520px] object-cover rounded-2xl border border-base-line transition-transform duration-300 group-hover:scale-[1.02]"
              />
            ) : (
              <div className="w-full h-[360px] md:h-[520px] rounded-2xl bg-base-soft grid place-items-center border border-base-line text-5xl">🛍️</div>
            )}
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl font-semibold">{item.name}</h1>
            {/* <div className="text-sm text-base-mute break-all">{item.id}</div> */}
            <div className="text-2xl font-semibold">
              {Intl.NumberFormat('vi-VN').format(item.price)}₫
            </div>
            <p className="text-base leading-relaxed">{item.description}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
