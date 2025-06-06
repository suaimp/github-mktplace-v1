interface HtmlFieldProps {
  field: {
    description?: string;
  };
}

export default function HtmlField({ field }: HtmlFieldProps) {
  return (
    <div 
      className="prose max-w-none dark:prose-invert"
      dangerouslySetInnerHTML={{ __html: field.description || '' }}
    />
  );
}