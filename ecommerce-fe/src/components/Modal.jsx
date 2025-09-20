import { motion, AnimatePresence } from 'framer-motion'


export default function Modal({ open, onClose, title, children, footer }) {
return (
<AnimatePresence>
{open && (
<motion.div className="fixed inset-0 z-50 flex items-center justify-center"
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
>
<div className="absolute inset-0 bg-black/60" onClick={onClose} />
<motion.div
initial={{ y: 24, opacity: 0 }}
animate={{ y: 0, opacity: 1 }}
exit={{ y: 24, opacity: 0 }}
transition={{ type: 'spring', stiffness: 260, damping: 22 }}
className="relative bg-base-card border border-base-line rounded-2xl w-[min(640px,92vw)] p-5"
>
<div className="text-lg font-medium mb-3">{title}</div>
<div className="mb-4">{children}</div>
{footer}
</motion.div>
</motion.div>
)}
</AnimatePresence>
)
}