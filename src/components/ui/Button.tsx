import React from "react";
import { cx } from "../../utils/format";
import { BoxIcon } from "lucide-react";
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'subtle';
type Size = 'sm' | 'md' | 'lg';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: BoxIcon;
  iconRight?: BoxIcon;
}
const variants: Record<Variant, string> = {
  primary: 'bg-berry-600 text-white hover:bg-berry-700 disabled:bg-berry-200',
  secondary: 'bg-white text-ink ring-1 ring-inset ring-line-strong hover:bg-cream disabled:text-ink-3',
  ghost: 'text-ink-2 hover:bg-cream-2 hover:text-ink disabled:text-ink-3',
  danger: 'bg-bad-600 text-white hover:bg-bad-700 disabled:bg-bad-100',
  subtle: 'bg-berry-50 text-berry-700 hover:bg-berry-100'
};
const sizes: Record<Size, string> = {
  sm: 'h-8 px-2.5 text-[13px] gap-1.5',
  md: 'h-9 px-3.5 text-sm gap-2',
  lg: 'h-11 px-4 text-[15px] gap-2'
};
export function Button({
  variant = 'secondary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return <button type={type} className={cx('inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-lg font-medium transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100', variants[variant], sizes[size], className)} {...rest}>
      {Icon && <Icon className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} aria-hidden />}
      {children}
      {IconRight && <IconRight className="h-4 w-4" aria-hidden />}
    </button>;
}