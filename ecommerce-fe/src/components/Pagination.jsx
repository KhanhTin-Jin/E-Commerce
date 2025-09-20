export default function Pagination({ page, totalPages, onPage, pageSize, onPageSize }) {
  return (
    <div className="mt-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button className="px-3 py-1 rounded-lg border border-base-line" disabled={page<=1} onClick={()=>onPage(1)}>«</button>
        <button className="px-3 py-1 rounded-lg border border-base-line" disabled={page<=1} onClick={()=>onPage(page-1)}>‹</button>
        <span className="text-sm text-base-mute">Page {page}/{totalPages}</span>
        <button className="px-3 py-1 rounded-lg border border-base-line" disabled={page>=totalPages} onClick={()=>onPage(page+1)}>›</button>
        <button className="px-3 py-1 rounded-lg border border-base-line" disabled={page>=totalPages} onClick={()=>onPage(totalPages)}>»</button>
      </div>
      <div className="flex items-center gap-2">
        <select className="bg-base-soft border border-base-line rounded-xl px-2 py-1" value={pageSize} onChange={e=>onPageSize(Number(e.target.value))}>
          {[5,8,10,20,50].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <span className="text-sm text-base-mute">/page</span>
      </div>
    </div>
  )
}
