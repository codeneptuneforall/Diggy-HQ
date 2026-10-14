import React from 'react';
import { cx } from '../../utils/format';

export function Page({ children, className, wide }: {children: React.ReactNode;className?: string;wide?: boolean;}) {
  return <div className={cx('mx-auto w-full px-4 py-6 sm:px-6 lg:px-8', wide ? 'max-w-[1600px]' : 'max-w-[1400px]', className)}>{children}</div>;
}