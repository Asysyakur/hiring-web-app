import React from 'react'

type Variant = 'primary' | 'secondary' | 'outline'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string
  variant?: Variant
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary text-white px-4 py-2 rounded-lg  font-semibold hover:bg-primaryDark transition',
  secondary: 'bg-secondary text-secondaryText px-4 py-2 rounded-lg  font-semibold hover:bg-secondaryDark transition',
  outline: 'bg-transparent border border-primary text-primary px-4 py-2 rounded-lg font-semibold hover:bg-primary hover:text-white transition',
}

export const Button: React.FC<ButtonProps> = ({ label, variant = 'primary', className = '', ...props }) => {
  return (
    <button
      {...props}
      className={`${variantClasses[variant]} ${className}`.trim()}
    >
      {label}
    </button>
  )
}
export default Button