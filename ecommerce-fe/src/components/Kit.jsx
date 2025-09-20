export function Card({ children, className = '' }) {
return (
<div className={`bg-base-card border border-base-line rounded-2xl shadow-soft ${className}`}>
{children}
</div>
);
}


export function Button({ children, className = '', variant = 'primary', ...props }) {
const variants = {
primary: 'bg-brand-500 hover:bg-brand-600 text-white',
ghost: 'bg-base-soft hover:bg-base-card text-base-text border border-base-line',
danger: 'bg-transparent border border-red-500 text-red-400 hover:bg-red-500/10',
};
return (
<button
className={`px-4 py-2 rounded-xl transition-all duration-200 active:scale-[.98] ${variants[variant]} ${className}`}
{...props}
>
{children}
</button>
);
}


export function Input({ className = '', ...props }) {
return (
<input
className={`w-full bg-base-soft border border-base-line rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 ${className}`}
{...props}
/>
);
}


export function TextArea({ className = '', ...props }) {
return (
<textarea
className={`w-full bg-base-soft border border-base-line rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 ${className}`}
{...props}
/>
);
}