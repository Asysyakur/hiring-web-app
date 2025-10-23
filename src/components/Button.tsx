import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
}

export const Button: React.FC<ButtonProps> = ({ label, ...props }) => {
  return (
    <button
      {...props}
      className="bg-red-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-red-700 transition"
    >
      {label}
    </button>
  )
}
