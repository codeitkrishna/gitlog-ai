"use client"

import React from "react"

interface ButtonProps {
  children: React.ReactNode
  variant?: "primary" | "secondary"
  disabled?: boolean
  loading?: boolean
  loadingContent?: React.ReactNode
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  className?: string
}

export default function Button({
  children,
  variant = "primary",
  disabled = false,
  loading = false,
  loadingContent,
  onClick,
  className = "",
}: ButtonProps) {

  const base =
    "px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center"

  const styles = {
    primary:
      "bg-[#238636] text-white hover:bg-green-600 dark:bg-[#238636] dark:hover:bg-green-600",
    secondary:
      "bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-white",
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${styles[variant]} ${
        disabled || loading ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      {loading ? loadingContent ?? "Loading..." : children}
    </button>
  )
}
