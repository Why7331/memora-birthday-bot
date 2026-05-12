import { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type LiquidButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;

export function LiquidButton({ children, className = '', ...props }: LiquidButtonProps) {
  return (
    <button className={`liquid-button ${className}`.trim()} {...props}>
      <span>{children}</span>
    </button>
  );
}
