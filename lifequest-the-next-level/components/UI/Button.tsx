import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = "font-display font-semibold rounded-2xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-brand-primary text-white border-2 border-brand-primary hover:bg-indigo-600",
    secondary: "bg-brand-secondary text-white border-2 border-brand-secondary hover:bg-pink-600",
    accent: "bg-brand-accent text-white border-2 border-brand-accent hover:bg-amber-500",
    outline: "bg-white text-gray-700 border-2 border-gray-200 hover:border-brand-primary hover:text-brand-primary"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-xl"
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
