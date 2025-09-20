import { useEffect } from 'react'

export default function SparkleCursor() {
  useEffect(() => {
    let last = 0
    const MAX = 80

    function spawn(e) {
      const now = performance.now()
      if (now - last < 16) return // throttle ~60fps
      last = now

      const s = document.createElement('span')
      s.className = 'sparkle'
      const size = 6 + Math.random() * 10
      s.style.left = e.clientX + 'px'
      s.style.top = e.clientY + 'px'
      s.style.width = size + 'px'
      s.style.height = size + 'px'
      s.style.transform = `translate(-50%, -50%) rotate(${Math.random()*360}deg)`
      document.body.appendChild(s)

      // giữ số lượng hạt vừa phải
      const all = document.querySelectorAll('.sparkle')
      if (all.length > MAX) {
        for (let i = 0; i < all.length - MAX; i++) all[i].remove()
      }
      setTimeout(() => s.remove(), 700)
    }

    window.addEventListener('mousemove', spawn)
    return () => window.removeEventListener('mousemove', spawn)
  }, [])

  return null
}
