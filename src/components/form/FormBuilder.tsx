import { Select } from '@/components/form/Select';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, SendHorizontal } from 'lucide-react';
import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import {
  Controller,
  useForm,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from 'react-hook-form';
import * as z from 'zod';
import { Alert } from '../custom/Alert';
import PrimaryButton from '../PrimaryButton';
import { Button } from '../ui/button';
import { FieldDescription } from '../ui/field';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export interface FieldProps {
  name: string;
  type: 'string' | 'number';
  required: boolean;
  censored?: boolean;
  description: string;
  defaultValue?: string;
  inputDescription?: string;
  enum?: string[];
  source?: string;
}

const generateZodSchema = (config: FieldProps[]) => {
  const schemaShape: Record<string, z.ZodTypeAny> = {};

  config.forEach((field) => {
    const key = field.name;
    let validator: z.ZodTypeAny;

    if (field.type === 'number') {
      const baseNumber = z.coerce.number({
        message: `${key} must be a number`,
      });

      validator = z.preprocess(
        (v) => (v === '' ? undefined : v),
        field.required ? baseNumber : baseNumber.optional(),
      );
    } else {
      validator = z.string();
    }

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

    if (field.type === 'string' && !field.enum && key.toLowerCase().includes('email')) {
      validator = z.email({
        message: 'Please enter a valid email address',
      });
    }

    if (field.required) {
      if (field.type === 'string' && !field.enum) {
        validator = (validator as z.ZodString).min(1, {
          message: `${key} is required`,
        });
      }
    } else if (field.type !== 'number') {
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
  alertTitle?: string;
  alertText?: string | Record<string, unknown>;
  disableGroupuing?: boolean;
  disableForm?: boolean;
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
  disableForm = false,
  alertTitle,
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
        acc[field.name] = field.defaultValue || '';
        return acc;
      },
      {} as Record<string, any>,
    ),
  });

  useEffect(() => {
    returnValues?.(getValues());
  }, []);

  useEffect(() => {
    const subscription = watch((values) => {
      returnValues?.(values);
    });

    return () => subscription.unsubscribe();
  }, [watch, returnValues]);

  useEffect(() => {
    isLoading && isLoading(isSubmitting);
  }, [isSubmitting]);

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
    <form onSubmit={handleSubmit(onSubmit)}>
      <fieldset disabled={disableForm} className="col w-full grow space-y-6">
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
            className="border-destructive bg-destructive/10 overflow-x-auto"
            title={alertTitle || 'Authorization Failed'}
          >
            {typeof alertText === 'string' ? (
              alertText
            ) : (
              <pre>{JSON.stringify(alertText, null, 2)}</pre>
            )}
          </Alert>
        )}

        {formConfig.length > 0 && (
          <PrimaryButton
            type="submit"
            size={'icon-lg'}
            className={cn(buttonStyles, 'mt-auto py-4.5! font-semibold')}
            loading={isSubmitting}
          >
            {buttonText || 'Send Request'}
            {buttonIcon ?? <SendHorizontal />}
          </PrimaryButton>
        )}
      </fieldset>
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
  return fields.map((field: FieldProps) => {
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
              <>
                <Select {...controlField} placeholder={`Select ${field.name}`} options={options} />
                {field.inputDescription && (
                  <FieldDescription>{field.inputDescription}</FieldDescription>
                )}
              </>
            )}
          />
        ) : (
          <InputField field={field} register={register} hasError={hasError} />
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

export function InputField({
  field,
  register,
  hasError,
}: {
  field: FieldProps;
  register: UseFormRegister<Record<string, any>>;
  hasError: boolean;
}) {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  return (
    <>
      <div className="relative">
        <Input
          type={
            field.name.includes('password') || field.censored
              ? isVisible
                ? 'text'
                : 'password'
              : field.type === 'number'
                ? 'number'
                : 'text'
          }
          placeholder={field.description}
          id={field.name}
          defaultValue={field.defaultValue}
          {...register(field.name as never)}
          className={`${hasError ? 'border-red-500 focus-visible:ring-red-500' : ''} ${field.name.includes('password') || field.censored ? 'pr-10' : ''} pl-4 text-xs!`}
        />
        {(field.name.includes('password') || field.censored) && (
          <Button
            className="abs-y-center right-2 size-auto rounded-full! p-1.5!"
            variant="ghost"
            type="button"
            onClick={() => setIsVisible((prev) => !prev)}
          >
            {isVisible ? <Eye /> : <EyeOff />}
          </Button>
        )}
      </div>
      {field.inputDescription && <FieldDescription className='mt-1.5! pl-2'>{field.inputDescription}</FieldDescription>}
    </>
  );
}
