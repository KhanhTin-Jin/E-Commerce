import { useState, useEffect } from 'react'
import { Input, TextArea } from './Kit'

export default function ProductForm({ t, initial, onSubmit }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [image, setImage] = useState('')

  useEffect(() => {
    if (initial) {
      setName(initial.name || '')
      setDescription(initial.description || '')
      setPrice(initial.price != null ? String(initial.price) : '')
      setImage(initial.image || '')
    }
  }, [initial])

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      image: image.trim() || null,
    })
  }

  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-base-mute">{t('name')}</label>
          <Input value={name} onChange={e=>setName(e.target.value)} placeholder="Chuột không dây" required maxLength={100}/>
        </div>
        <div>
          <label className="text-sm text-base-mute">{t('price')}</label>
          <Input type="number" min="0.01" step="0.01" value={price} onChange={e=>setPrice(e.target.value)} required />
        </div>
      </div>
      <div>
        <label className="text-sm text-base-mute">{t('image')}</label>
        <Input value={image} onChange={e=>setImage(e.target.value)} placeholder="https://..." />
      </div>
      <div>
        <label className="text-sm text-base-mute">{t('description')}</label>
        <TextArea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Mô tả ngắn" required maxLength={500}/>
      </div>
      <button className="mt-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl px-4 py-2">{t('save')}</button>
    </form>
  )
}
