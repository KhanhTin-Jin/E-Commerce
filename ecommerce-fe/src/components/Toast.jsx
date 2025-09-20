import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'


export default function Toast({ message, type = 'success', open, onClose }) {
useEffect(() => {
if (!open) return
const t = setTimeout(onClose, 2200)
return () => clearTimeout(t)
}, [open, onClose])


const color = type === 'error' ? 'border-red-500 text-red-300' : 'border-emerald-500 text-emerald-300'


return (
<div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
<AnimatePresence>
{open && (
<motion.div
initial={{ y: -12, opacity: 0 }}
animate={{ y: 0, opacity: 1 }}
exit={{ y: -12, opacity: 0 }}
className={`bg-base-card border ${color} rounded-xl px-4 py-2 shadow-soft`}
>
{message}
</motion.div>
)}
</AnimatePresence>
</div>
)
}