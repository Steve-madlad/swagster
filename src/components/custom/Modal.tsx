import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { ModalProps } from '@/models/types';

export default function Modal({
  headerIcon: HeaderIcon,
  headerContent,
  title,
  description,
  triggerText,
  triggerStyles,
  triggerElement,
  containerStyles,
  children,
  open,
  onClose,
  onOpenChange,
}: ModalProps) {
  const handleChange = (value: boolean) => {
    onOpenChange?.(value);
    if (!value) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleChange}>
      {!triggerElement
        ? triggerText && (
            <DialogTrigger>
              <Button className={triggerStyles}>{triggerText}</Button>
            </DialogTrigger>
          )
        : triggerElement}

      <DialogContent
        showCloseButton={false}
        className={cn(containerStyles, 'col max-w-11/12! gap-0 p-0')}
      >
        {(title || description || headerContent) && (
          <DialogHeader className="h-fit border-b-2 border-gray-200 px-7 py-3">
            {headerContent || (
              <div className="align-center gap-4">
                {HeaderIcon && (
                  <div className="bg-primary/15 text-primary flex-center h-full! rounded-lg p-2.5">
                    <HeaderIcon />
                  </div>
                )}
                <div>
                  {title && (
                    <DialogTitle className="text-primary text-xl font-semibold">
                      {title}
                    </DialogTitle>
                  )}
                  {description && <DialogDescription>{description}</DialogDescription>}
                </div>
              </div>
            )}
          </DialogHeader>
        )}

        <div className="h-full grow">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
