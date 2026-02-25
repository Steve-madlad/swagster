import { cn } from '@/lib/utils';
import { Button, buttonVariants } from './ui/button';
import type { VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

export default function PrimaryButton({
  className,
  children,
  loading,
  loadingText,
  ...props
}: React.ComponentProps<typeof Button> &
  VariantProps<typeof buttonVariants> & { loading?: boolean; loadingText?: string }) {
  return (
    <Button
      {...props}
      disabled={loading}
      className={cn(
        className,
        'bg-primary hover:text-primary text-sm w-full hover:bg-transparent hover:border-primary flex gap-4 border-2 border-transparent py-5! transition-all! duration-100',
      )}
    >
      {loading ? (
        loadingText ? (
          loadingText
        ) : (
          <>
            Processing <Loader2 className="animate-spin" />
          </>
        )
      ) : (
        children
      )}
    </Button>
  );
}
