import { Button, Card } from './Kit'
import { Link } from 'react-router-dom'

export default function ProductTable({ t, items, onEdit, onDelete }) {
  return (
    <Card>
      <div className="p-4">
        <div className="text-sm text-base-mute">{t('list')}</div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-base-mute">
              <th className="px-4 py-2">{t('product')}</th>
              <th className="px-4 py-2">{t('description')}</th>
              <th className="px-4 py-2">{t('price')}</th>
              <th className="px-4 py-2">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map(p => (
              <tr key={p.id} className="border-t border-base-line">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="h-10 w-10 rounded-xl object-cover border border-base-line"/>
                    ) : (
                      <div className="h-10 w-10 rounded-xl bg-base-soft grid place-items-center border border-base-line">🛍️</div>
                    )}
                    <div className="font-medium">{p.name}</div>
                  </div>
                </td>
                <td className="px-4 py-3 max-w-[420px]">
                  <div className="text-sm text-base-mute line-clamp-2">{p.description}</div>
                </td>
                <td className="px-4 py-3">{Intl.NumberFormat('vi-VN').format(p.price)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 flex-wrap">
                    <Link
                      to={`/products/${p.id}`}
                      className="px-4 py-2 rounded-xl transition-all duration-200 active:scale-[.98] bg-base-soft hover:bg-base-card text-base-text border border-base-line"
                    >
                      {t('detail')}
                    </Link>
                    <Button variant="ghost" onClick={() => onEdit(p)}>{t('edit')}</Button>
                    <Button variant="danger" onClick={() => onDelete(p)}>{t('delete')}</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
