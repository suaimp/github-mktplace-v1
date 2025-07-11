import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { PencilIcon, TrashBinIcon, EyeIcon } from "../../icons";
import { formatDate } from "../form/utils/formatters";
import { renderFormattedValue } from "./EntryValueFormatter";

interface EntriesTableProps {
  entries: any[];
  fields: any[];
  loading: boolean;
  selectedFormId: string;
  onView: (entry: any) => void;
  onEdit: (entry: any) => void;
  onDelete: (entryId: string) => void;
}

export default function EntriesTable({ 
  entries, 
  fields, 
  loading, 
  selectedFormId,
  onView, 
  onEdit, 
  onDelete 
}: EntriesTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verificado':
        return <Badge color="success">Verificado</Badge>;
      case 'reprovado':
        return <Badge color="error">Reprovado</Badge>;
      case 'em_analise':
      default:
        return <Badge color="warning">Em Análise</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-12 bg-gray-200 rounded-lg w-full mb-4 dark:bg-gray-800"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg dark:bg-gray-800"></div>
          ))}
        </div>
      </div>
    );
  }

  // Display first two fields from the selected form
  // Filter out admin-only and button_buy fields
  const displayFields = fields
    .filter(field => {
      const settings = field.form_field_settings;
      return field.field_type !== 'button_buy' && 
             (!settings || settings.visibility !== 'admin');
    })
    .slice(0, 2);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Data
                </TableCell>
                
                {/* Show first two fields from the selected form */}
                {displayFields.map((field) => (
                  <TableCell
                    key={field.id}
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    {field.label}
                  </TableCell>
                ))}
                
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Publisher
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Ações
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {formatDate(entry.created_at)}
                    </span>
                  </TableCell>
                  
                  {/* Display first two fields from the selected form */}
                  {displayFields.map((field) => {
                    // Skip admin-only fields
                    const settings = field.form_field_settings;
                    if (settings?.visibility === 'admin') {
                      return (
                        <TableCell 
                          key={field.id}
                          className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap"
                        >
                          <span className="text-gray-400 dark:text-gray-600 italic">Admin only</span>
                        </TableCell>
                      );
                    }
                    
                    return (
                      <TableCell 
                        key={field.id}
                        className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap"
                      >
                        {renderFormattedValue(entry.values[field.id], field.field_type, field)}
                      </TableCell>
                    );
                  })}
                  
                  {/* Publisher */}
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">
                    {entry.publisher ? (
                      <div>
                        <div className="font-medium">{entry.publisher.first_name} {entry.publisher.last_name}</div>
                        <div className="text-xs">{entry.publisher.email}</div>
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap">
                    {getStatusBadge(entry.status || 'em_analise')}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onView(entry)}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        title="Visualizar"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onEdit(entry)}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        title="Editar"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onDelete(entry.id)}
                        className="p-2 text-error-500 hover:text-error-600 dark:text-error-400 dark:hover:text-error-300"
                        title="Excluir"
                      >
                        <TrashBinIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {entries.length === 0 && (
                <TableRow>
                  <TableCell 
                    colSpan={5 + displayFields.length} 
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    {selectedFormId ? "Nenhum registro encontrado para este formulário" : "Selecione um formulário para ver as entradas"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}