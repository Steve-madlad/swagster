import {
  SelectContent,
  SelectGroup,
  Select as SelectInput,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SelectProps {
  placeholder: string;
  id?: string;
  options?: { label: string; value: string }[];
  value: string;
  onChange: (value: string | null) => void;
}
export function Select({ placeholder, id, options, value, onChange }: SelectProps) {
  return (
    <SelectInput value={value} onValueChange={onChange}>
      <SelectTrigger aria-placeholder="bro" id={id} className="w-full bg-white! py-3! text-xs rounded-md! capitalize">
        {!value ? placeholder : <SelectValue />}
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options?.map((option) => (
            <SelectItem className={'capitalize text-xs'} key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </SelectInput>
  );
}
