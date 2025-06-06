import TextArea from '../input/TextArea';

interface TextAreaFieldProps {
  field: any;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function TextAreaField({
  field,
  value,
  onChange,
  error
}: TextAreaFieldProps) {
  return (
    <TextArea
      value={value || ''}
      onChange={onChange}
      placeholder={field.placeholder}
      required={field.is_required}
      error={!!error}
      hint={error}
    />
  );
}