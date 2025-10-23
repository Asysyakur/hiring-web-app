import React from 'react'

type Variant = 'primary' | 'secondary'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  variant?: Variant
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary text-white px-4 py-2 rounded-xl font-medium hover:bg-primaryDark transition',
  secondary: 'bg-secondary text-secondaryText px-4 py-2 rounded-xl font-medium hover:bg-secondaryDark transition',
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