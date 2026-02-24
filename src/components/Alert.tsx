import {
  AlertAction,
  Alert as AlertCard,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { AlertCircleIcon, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface AlertCardProps {
  variant?: 'default' | 'destructive' | 'success';
  icon?: LucideIcon;
  className?: string;
  alertAction?: () => void;
  alertActionText?: string;
  title: String;
  children: ReactNode;
}
export function Alert({
  variant,
  icon: Icon,
  title,
  className,
  alertAction,
  alertActionText,
  children,
}: AlertCardProps) {
  return (
    <AlertCard variant={variant} className={cn(className, 'h-fit')}>
      {Icon ? <Icon className="size-4   " /> : <AlertCircleIcon className="size-5" />}
      <AlertTitle className="text-base">{title}</AlertTitle>
      <AlertDescription className="text-xs">{children}</AlertDescription>
      {alertAction && (
        <AlertAction>
          <Button onClick={() => alertAction()}>{alertActionText}</Button>
        </AlertAction>
      )}
    </AlertCard>
  );
}
