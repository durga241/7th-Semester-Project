import { Icon, IconName } from '@/components/ui/icon';

// Common icon sizes
export const iconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

type IconSize = keyof typeof iconSizes;

// Common icon props
type CommonIconProps = {
  size?: IconSize | number;
  className?: string;
};

// Predefined icons with consistent styling
export const Icons = {
  // Status
  success: (props: CommonIconProps) => (
    <Icon 
      name="CheckCircle2" 
      className={cn('text-green-500', props.className)}
      size={typeof props.size === 'string' ? iconSizes[props.size] : props.size}
    />
  ),
  error: (props: CommonIconProps) => (
    <Icon 
      name="AlertCircle" 
      className={cn('text-destructive', props.className)}
      size={typeof props.size === 'string' ? iconSizes[props.size] : props.size}
    />
  ),
  warning: (props: CommonIconProps) => (
    <Icon 
      name="AlertTriangle" 
      className={cn('text-amber-500', props.className)}
      size={typeof props.size === 'string' ? iconSizes[props.size] : props.size}
    />
  ),
  info: (props: CommonIconProps) => (
    <Icon 
      name="Info" 
      className={cn('text-blue-500', props.className)}
      size={typeof props.size === 'string' ? iconSizes[props.size] : props.size}
    />
  ),
  
  // Common actions
  search: (props: CommonIconProps) => (
    <Icon 
      name="Search" 
      className={cn('text-muted-foreground', props.className)}
      size={typeof props.size === 'string' ? iconSizes[props.size] : props.size}
    />
  ),
  cart: (props: CommonIconProps) => (
    <Icon 
      name="ShoppingCart" 
      className={cn(props.className)}
      size={typeof props.size === 'string' ? iconSizes[props.size] : props.size}
    />
  ),
  user: (props: CommonIconProps) => (
    <Icon 
      name="User" 
      className={cn(props.className)}
      size={typeof props.size === 'string' ? iconSizes[props.size] : props.size}
    />
  ),
  
  // Navigation
  chevron: (props: CommonIconProps & { direction?: 'up' | 'down' | 'left' | 'right' }) => {
    const { direction = 'right', ...rest } = props;
    const iconName = `Chevron${direction.charAt(0).toUpperCase() + direction.slice(1)}` as const;
    
    return (
      <Icon 
        name={iconName as IconName}
        className={cn('transition-transform', props.className)}
        size={typeof props.size === 'string' ? iconSizes[props.size] : props.size}
        {...rest}
      />
    );
  },
};

// Helper function to get icon by name
export const getIcon = (name: string, props: CommonIconProps = {}) => {
  const IconComponent = Icons[name as keyof typeof Icons];
  return IconComponent ? IconComponent(props) : null;
};

// Re-export the Icon component for custom icons
export { Icon };
export type { IconName } from '@/components/ui/icon';
