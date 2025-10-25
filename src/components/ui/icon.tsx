import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

type IconName = keyof typeof LucideIcons;

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number | string;
  className?: string;
}

export const Icon = ({
  name,
  size = 24,
  className = '',
  ...props
}: IconProps) => {
  const LucideIcon = LucideIcons[name];
  
  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <LucideIcon 
      className={cn('inline-flex', className)} 
      width={size} 
      height={size}
      {...props}
    />
  );
};

// Re-export all Lucide icons for direct import if needed
export * from 'lucide-react';
