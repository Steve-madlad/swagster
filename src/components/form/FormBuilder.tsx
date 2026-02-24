import { cn } from '@/lib/utils';
import { Select } from '@components/form/Select';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, SendHorizontal } from 'lucide-react';
import { useEffect, useMemo, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import {
  Controller,
  useForm,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from 'react-hook-form';
import * as z from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert } from '../Alert';

export interface FieldProps {
  name: string;
  type: 'string' | 'number';
  required: boolean;
  enum?: string[];
  description: string;
  source?: string;
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
      const enumValidator = z.enum(field.enum, {
        message: `Please select a valid ${key}`,
      });

      if (field.required) {
        validator = enumValidator;
      } else {
        validator = z.preprocess((val) => (val === '' ? undefined : val), enumValidator.optional());
      }
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
  isLoading?: Dispatch<SetStateAction<boolean>>;
  returnValues?: (vals: Record<string, unknown>) => void;
  alertText?: string | Record<string, unknown>;
  disableGroupuing?: boolean;
  buttonStyles?: string;
  buttonText?: string;
  buttonIcon?: ReactNode;
}

export default function FormBuilder({
  formConfig,
  onSubmit,
  isLoading,
  returnValues,
  disableGroupuing = false,
  alertText,
  buttonStyles,
  buttonText,
  buttonIcon,
}: FormBuilderProps) {
  const schema = useMemo(() => generateZodSchema(formConfig), [formConfig]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    getValues,
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

  useEffect(() => {
    returnValues?.(getValues());
  }, []);

  console.log(formConfig);

  useEffect(() => {
    const subscription = watch((values) => {
      console.log(values);

      returnValues?.(values);
    });

    return () => subscription.unsubscribe();
  }, [watch, returnValues]);

  useEffect(() => {
    isLoading && isLoading(isSubmitting);
  }, [isSubmitting]);

  // console.log(formConfig);
  // console.log(watch());

  const groupedData = formConfig.reduce((acc: Record<string, FieldProps[]>, field) => {
    if (!field.source) {
      return acc;
    }

    const key = field?.source;

    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push(field);
    return acc;
  }, {});

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="col grow space-y-6 w-full">
      {!disableGroupuing ? (
        Object.entries(groupedData).map(([source, fields]) => (
          <section key={source} className="mb-8 space-y-4">
            <h3 className="mb-4 text-sm font-semibold capitalize">{source} Parameters</h3>
            <Fields fields={fields} errors={errors} control={control} register={register} />
          </section>
        ))
      ) : (
        <Fields fields={formConfig} errors={errors} control={control} register={register} />
      )}

      {alertText && (
        <Alert
          variant="destructive"
          className="border-destructive bg-destructive/20 overflow-x-auto"
          title={'Authorization Failed'}
        >
          {typeof alertText === 'string' ? (
            alertText
          ) : (
            <pre>{JSON.stringify(alertText, null, 2)}</pre>
          )}
        </Alert>
      )}

      <Button
        type="submit"
        size={'icon-lg'}
        className={cn(
          buttonStyles,
          'bg-primary! hover:border-primary! hover:text-primary mt-auto flex w-full gap-3 border-3! border-transparent py-4.5! text-sm! font-semibold text-white duration-300 hover:bg-white!',
        )}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing
          </>
        ) : (
          buttonText || 'Send Request'
        )}
        {!isSubmitting && (buttonIcon ? buttonIcon : <SendHorizontal />)}
      </Button>
    </form>
  );
}

interface FieldsProps {
  fields: any;
  errors: FieldErrors;
  control: Control;
  register: UseFormRegister<Record<string, any>>;
}

export const Fields = ({ fields, errors, control, register }: FieldsProps) => {
  return fields.map((field: any) => {
    const hasError = !!errors[field.name];
    const fieldOptions = field?.enum;
    const options = field.enum
      ? fieldOptions?.map((option: any) => ({
          label: option,
          value: option,
        }))
      : undefined;

    return (
      <div key={field.name}>
        <Label htmlFor={field.name} className="mb-1 text-sm! text-black/60 capitalize">
          {field.name} <b className="text-destructive">{field.required ? '*' : ''}</b>
        </Label>

        {field.enum ? (
          <Controller
            name={field.name}
            control={control}
            render={({ field: controlField }) => (
              <Select {...controlField} placeholder={`Select ${field.name}`} options={options} />
            )}
          />
        ) : (
          <Input
            type={
              field.name.includes('password')
                ? 'password'
                : field.type === 'number'
                  ? 'number'
                  : 'text'
            }
            placeholder={field.description}
            id={field.name}
            step={field.type === 'number' ? '0.01' : undefined}
            {...register(field.name as never)}
            className={`${hasError ? 'border-red-500 focus-visible:ring-red-500' : ''} pl-4 text-xs!`}
          />
        )}

        {hasError && (
          <p className="mt-1 pl-2 text-xs font-medium text-red-500 first-letter:uppercase">
            {errors[field.name]?.message?.toString()}
          </p>
        )}
      </div>
    );
  });
};
