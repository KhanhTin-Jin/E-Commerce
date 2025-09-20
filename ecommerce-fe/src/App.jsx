import { useEffect, useMemo, useState } from 'react'
import { api } from './lib/api'
import { Card, Button } from './components/Kit'
import ProductForm from './components/ProductForm'
import ProductTable from './components/ProductTable'
import Modal from './components/Modal'
import Toast from './components/Toast'
import Pagination from './components/Pagination'
import { makeT } from './i18n'
import SparkleCursor from './components/SparkleCursor'

export default function App() {
  // theme & lang
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'vi')
  const t = makeT(lang)
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark')
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])
  useEffect(() => { localStorage.setItem('lang', lang) }, [lang])

  // data
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [toast, setToast] = useState({ open: false, msg: '', type: 'success' })
  const [openCreate, setOpenCreate] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirm, setConfirm] = useState(null)

  // filters
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sort, setSort] = useState('default')

  // paging
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(8)

  async function load() {
    setLoading(true)
    try {
      const data = await api.listProducts()
      setItems(data)
    } catch {
      setToast({ open: true, msg: 'Lỗi tải dữ liệu', type: 'error' })
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    let list = items
    const q = query.trim().toLowerCase()
    if (q) list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
    const min = parseFloat(minPrice); const max = parseFloat(maxPrice)
    if (!isNaN(min)) list = list.filter(p => p.price >= min)
    if (!isNaN(max)) list = list.filter(p => p.price <= max)
    if (sort === 'price-asc') list = [...list].sort((a,b)=>a.price-b.price)
    if (sort === 'price-desc') list = [...list].sort((a,b)=>b.price-a.price)
    return list
  }, [items, query, minPrice, maxPrice, sort])

  // reset page khi điều kiện lọc đổi
  useEffect(() => { setPage(1) }, [query, minPrice, maxPrice, sort, items])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  async function createProduct(payload) {
    try {
      await api.createProduct(payload)
      setOpenCreate(false)
      setToast({ open: true, msg: t('createdOk'), type: 'success' })
      load()
    } catch {
      setToast({ open: true, msg: t('createdErr'), type: 'error' })
    }
  }

  async function updateProduct(payload) {
    try {
      await api.updateProduct(editing.id, payload)
      setEditing(null)
      setToast({ open: true, msg: t('updatedOk'), type: 'success' })
      load()
    } catch {
      setToast({ open: true, msg: t('updatedErr'), type: 'error' })
    }
  }

  async function deleteProductConfirm() {
    try {
      await api.deleteProduct(confirm.id)
      setConfirm(null)
      setToast({ open: true, msg: t('deletedOk'), type: 'success' })
      load()
    } catch {
      setToast({ open: true, msg: t('deletedErr'), type: 'error' })
    }
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 backdrop-blur bg-base-bg/70 border-b border-base-line">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="text-lg font-semibold tracking-tight">{t('title')}</div>

          {/* Controls: theme + language */}
          <div className="flex items-center gap-2">
            <select
              className="bg-base-soft border border-base-line rounded-xl px-2 py-1"
              value={lang}
              onChange={e=>setLang(e.target.value)}
              aria-label={t('language')}
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
            <Button variant="ghost" onClick={()=>setTheme(theme==='dark'?'light':'dark')}>
              {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-5">
        {/* Search + quick actions */}
        <Card>
          <div className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <input
                className="flex-1 md:w-[360px] bg-base-soft border border-base-line rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
                placeholder={t('search')}
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setOpenCreate(true)}>{t('add')}</Button>
              <Button variant="ghost" onClick={load}>{t('refresh')}</Button>
            </div>
          </div>
        </Card>

        {/* Filters (phiên bản gọn – chuẩn responsive) */}
        <Card><div className="p-4 card-hover">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="text-sm text-base-mute">{t('filters')}</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="flex-1 min-w-[160px]">
                <label className="block text-xs text-base-mute mb-1">{t('minPrice')}</label>
                <input
                  className="w-full bg-base-soft border border-base-line rounded-xl px-3 py-2"
                  type="number" min="0" value={minPrice}
                  onChange={e=>setMinPrice(e.target.value)}
                />
              </div>

              <div className="flex-1 min-w-[160px]">
                <label className="block text-xs text-base-mute mb-1">{t('maxPrice')}</label>
                <input
                  className="w-full bg-base-soft border border-base-line rounded-xl px-3 py-2"
                  type="number" min="0" value={maxPrice}
                  onChange={e=>setMaxPrice(e.target.value)}
                />
              </div>

              <div className="flex-1 min-w-[180px]">
                <label className="block text-xs text-base-mute mb-1">{t('sort')}</label>
                <select
                  className="w-full bg-base-soft border border-base-line rounded-xl px-3 py-2"
                  value={sort} onChange={e=>setSort(e.target.value)}
                >
                  <option value="default">{t('sortDefault')}</option>
                  <option value="price-asc">{t('sortPriceAsc')}</option>
                  <option value="price-desc">{t('sortPriceDesc')}</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => { setMinPrice(''); setMaxPrice(''); setSort('default') }}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
          </div>
        </Card>

        {/* Table */}
        {loading ? (
          <Card>
            <div className="p-6 animate-pulse space-y-4">
              <div className="h-6 bg-base-soft rounded-xl" />
              <div className="h-6 bg-base-soft rounded-xl" />
              <div className="h-6 bg-base-soft rounded-xl" />
            </div>
          </Card>
        ) : (
          <>
            <ProductTable
              t={t}
              items={pageItems}
              onEdit={setEditing}
              onDelete={setConfirm}
            />
            <Pagination
              page={page}
              totalPages={totalPages}
              onPage={(p)=>setPage(Math.max(1, Math.min(totalPages, p)))}
              pageSize={pageSize}
              onPageSize={(n)=>{ setPageSize(n); setPage(1) }}
            />
          </>
        )}
      </main>

      {/* Create */}
      <Modal open={openCreate} onClose={() => setOpenCreate(false)} title={t('createTitle')}>
        <ProductForm t={t} onSubmit={createProduct} />
      </Modal>

      {/* Edit */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={t('editTitle')}
        footer={(
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditing(null)}>{t('cancel')}</Button>
          </div>
        )}
      >
        {editing && <ProductForm t={t} initial={editing} onSubmit={updateProduct} />}
      </Modal>

      {/* Confirm delete */}
      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={t('confirmDelete')}
        footer={(
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirm(null)}>{t('later')}</Button>
            <Button variant="danger" onClick={deleteProductConfirm}>{t('delete')}</Button>
          </div>
        )}
      >
        {confirm && (
          <div className="text-base-mute">
            {lang === 'vi'
              ? <>Bạn chắc chắn muốn xoá <span className="text-base-text">{confirm.name}</span>?</>
              : <>Are you sure to delete <span className="text-base-text">{confirm.name}</span>?</>}
          </div>
        )}
      </Modal>

      <Toast
        open={toast.open}
        message={toast.msg}
        type={toast.type}
        onClose={() => setToast(t => ({ ...t, open: false }))}
      />

      {/* Hiệu ứng lấp lánh theo chuột */}
      <SparkleCursor />
    </div>
  )
}
