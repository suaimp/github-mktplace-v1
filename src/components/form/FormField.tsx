import { useDrag, useDrop } from "react-dnd";
import { useRef, useState } from "react";
import FormFieldSettings from "./FormFieldSettings";
import * as Icons from "../../icons";

interface FormField {
  id: string;
  field_type: string;
  label: string;
  description?: string;
  placeholder?: string;
  default_value?: string;
  options?: any[];
  validation_rules?: Record<string, any>;
  is_required: boolean;
  position: number;
  width: "full" | "half" | "third" | "quarter";
  css_class?: string;
}

interface FormFieldProps {
  field: FormField;
  index: number;
  moveField: (dragIndex: number, hoverIndex: number) => Promise<void>;
  onEdit: (field: FormField) => void;
  onDelete: (fieldId: string) => void;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

export default function FormField({
  field,
  index,
  moveField,
  onEdit,
  onDelete
}: FormFieldProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [{ handlerId }, drop] = useDrop({
    accept: "form-field",
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId()
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveField(dragIndex, hoverIndex);
      item.index = hoverIndex;
    }
  });

  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: "form-field",
    item: () => {
      return { id: field.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const opacity = isDragging ? 0.4 : 1;

  // Apply drag preview to entire component and drag handle to dots icon
  dragPreview(drop(ref));

  const getFieldIcon = () => {
    switch (field.field_type) {
      case "text":
        return <Icons.FileIcon className="w-5 h-5" />;
      case "textarea":
        return <Icons.FileIcon className="w-5 h-5" />;
      case "number":
        return <Icons.FileIcon className="w-5 h-5" />;
      case "email":
        return <Icons.EnvelopeIcon className="w-5 h-5" />;
      case "phone":
        return <Icons.FileIcon className="w-5 h-5" />;
      case "select":
        return <Icons.ListIcon className="w-5 h-5" />;
      case "multiselect":
        return <Icons.ListIcon className="w-5 h-5" />;
      case "radio":
        return <Icons.CheckCircleIcon className="w-5 h-5" />;
      case "checkbox":
        return <Icons.CheckCircleIcon className="w-5 h-5" />;
      case "date":
        return <Icons.CalenderIcon className="w-5 h-5" />;
      case "time":
        return <Icons.TimeIcon className="w-5 h-5" />;
      case "file":
        return <Icons.FileIcon className="w-5 h-5" />;
      case "hidden":
        return <Icons.EyeCloseIcon className="w-5 h-5" />;
      case "html":
        return <Icons.CodeIcon className="w-5 h-5" />;
      default:
        return <Icons.FileIcon className="w-5 h-5" />;
    }
  };

  const getFieldTypeName = (type: string) => {
    switch (type) {
      case "text":
        return "Texto Simples";
      case "textarea":
        return "Texto Longo";
      case "number":
        return "Número";
      case "email":
        return "Email";
      case "phone":
        return "Telefone";
      case "select":
        return "Lista Suspensa";
      case "multiselect":
        return "Múltipla Escolha";
      case "radio":
        return "Botões de Opção";
      case "checkbox":
        return "Caixas de Seleção";
      case "date":
        return "Data";
      case "time":
        return "Hora";
      case "file":
        return "Upload de Arquivo";
      case "hidden":
        return "Campo Oculto";
      case "html":
        return "HTML";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  return (
    <>
      <div
        ref={ref}
        style={{ opacity }}
        data-handler-id={handlerId}
        className={`relative p-4 mb-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow ${
          isDragging ? "border-brand-500 dark:border-brand-500" : ""
        }`}
        onClick={() => setIsSettingsOpen(true)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg">
              {getFieldIcon()}
            </div>
            <div>
              <h4 className="font-medium text-gray-800 dark:text-white/90">
                {field.label}
                {field.is_required && (
                  <span className="ml-1 text-error-500">*</span>
                )}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Campo de {getFieldTypeName(field.field_type)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsSettingsOpen(true);
              }}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              title="Editar campo"
            >
              <Icons.PencilIcon className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(field.id);
              }}
              className="p-2 text-error-500 hover:text-error-600 dark:text-error-400 dark:hover:text-error-300"
              title="Excluir campo"
            >
              <Icons.TrashBinIcon className="w-5 h-5" />
            </button>
            <div
              ref={drag}
              className="cursor-move p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400"
            >
              <Icons.HorizontaLDots className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      <FormFieldSettings
        field={field}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={onEdit}
      />
    </>
  );
}
