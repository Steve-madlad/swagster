import { Select } from '@components/form/Select';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, SendHorizontal } from 'lucide-react';
import { useMemo, type Dispatch, type SetStateAction } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export interface FieldProps {
  name: string;
  type: 'string' | 'number';
  required: boolean;
  enum?: string[];
  description: string;
}

const generateZodSchema = (config: FieldProps[]) => {
  const schemaShape: Record<string, z.ZodTypeAny> = {};

  config.forEach((field) => {
    const key = field.name;
    let validator: z.ZodTypeAny;

    // 1️⃣ Base Type
    if (field.type === 'number') {
      validator = z.coerce.number().pipe(z.number({ message: `${key} must be a number` }));
    } else {
      validator = z.string();
    }

    // 2️⃣ Enum (override string validator if enum exists)
    if (field.type === 'string' && field.enum?.length) {
      validator = z.enum(field.enum, {
        message: `Please select a valid ${key}`,
      });
    }

    // 3️⃣ Email inference (only apply if NOT enum)
    if (field.type === 'string' && !field.enum && key.toLowerCase().includes('email')) {
      validator = z.email({
        message: 'Please enter a valid email address',
      });
    }

    // 4️⃣ Required vs Optional
    if (field.required) {
      if (field.type === 'string' && !field.enum) {
        console.log({ field });
        console.log({ validator });

        validator = (validator as z.ZodString).min(1, {
          message: `${key} is required`,
        });
      }
    } else {
      validator = validator.optional();
    }

    schemaShape[key] = validator;
  });

  return z.object(schemaShape);
};

interface FormBuilderProps {
  formConfig: FieldProps[];
  onSubmit: (data: Record<string, any>) => void;
  isLoading: Dispatch<SetStateAction<boolean>>;
}

export default function FormBuilder({ formConfig, onSubmit, isLoading }: FormBuilderProps) {
  const schema = useMemo(() => generateZodSchema(formConfig), [formConfig]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: formConfig.reduce(
      (acc, field) => {
        acc[field.name] = '';
        return acc;
      },
      {} as Record<string, any>,
    ),
  });

  console.log(formConfig);
  console.log(watch());
  isLoading(isSubmitting);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 col grow">
      {formConfig.map((field) => {
        const hasError = !!errors[field.name];
        const fieldOptions = field?.enum;
        const options = field.enum
          ? fieldOptions?.map((option) => ({
              label: option,
              value: option,
            }))
          : undefined;

        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="text-base! capitalize text-black/60 mb-1">
              {field.name} <b className="text-destructive">{field.required ? '*' : ''}</b>
            </Label>

            {field.enum ? (
              <Controller
                name={field.name}
                control={control}
                render={({ field: controlField }) => (
                  <Select
                    {...controlField}
                    id={field.name}
                    placeholder={`Select ${field.name}`}
                    options={options}
                  />
                )}
              />
            ) : (
              <Input
                type={field.type === 'number' ? 'number' : 'text'}
                placeholder={field.description}
                id={field.name}
                step={field.type === 'number' ? '0.01' : undefined}
                {...register(field.name as never)}
                className={`${hasError ? 'border-red-500 focus-visible:ring-red-500' : ''} text-sm! pl-4`}
              />
            )}

            {hasError && (
              <p className="text-base font-medium  text-red-500">
                {errors[field.name]?.message?.toString()}
              </p>
            )}
          </div>
        );
      })}

      <Button
        type="submit"
        size={'icon-xl'}
        className="w-full align-center gap-3 bg-primary! text-lg! py-6! mt-auto border-3! border-transparent hover:border-primary! hover:bg-white! hover:text-primary!"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing
          </>
        ) : (
          'Send Request'
        )}
        {!isSubmitting && <SendHorizontal />}
      </Button>
    </form>
  );
}
