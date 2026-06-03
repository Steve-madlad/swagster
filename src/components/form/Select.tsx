import {
  SelectContent,
  SelectGroup,
  Select as SelectInput,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface SelectProps {
  placeholder: string;
  className?: string;
  id?: string;
  options?: { label: string; value: string }[];
  value: string;
  onChange: (value: string | null) => void;
}
export function Select({ className, placeholder, id, options, value, onChange }: SelectProps) {
  return (
    <SelectInput value={value} onValueChange={onChange}>
      <SelectTrigger
        aria-placeholder="bro"
        id={id}
        className={cn(className, 'w-full rounded-md! bg-white! py-3! text-xs capitalize')}
      >
        {!value ? placeholder : <SelectValue />}
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options?.map((option) => (
            <SelectItem className={'text-xs capitalize'} key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </SelectInput>
  );
}
