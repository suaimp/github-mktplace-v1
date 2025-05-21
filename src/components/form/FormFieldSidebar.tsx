import { useState } from "react";
import * as Icons from "../../icons";

interface FormFieldSidebarProps {
  onAddField: (fieldType: string) => void;
}

// Definição dos grupos de campos disponíveis para adicionar ao formulário
// Cada grupo possui um título e uma lista de campos (tipo, título, descrição, ícone)
const fieldGroups = [
  {
    title: "Campos Básicos",
    fields: [
      {
        type: "text",
        title: "Texto Simples",
        description: "Para respostas curtas",
        icon: "FileIcon"
      },
      {
        type: "textarea",
        title: "Texto Longo",
        description: "Para respostas mais longas",
        icon: "FileIcon"
      },
      {
        type: "number",
        title: "Número",
        description: "Apenas para números",
        icon: "FileIcon"
      },
      {
        type: "email",
        title: "Email",
        description: "Para endereços de email",
        icon: "EnvelopeIcon"
      },
      {
        type: "phone",
        title: "Telefone",
        description: "Para números de telefone",
        icon: "FileIcon"
      },
      {
        type: "modal_button",
        title: "Botão modal",
        description: "Botão para abrir modal",
        icon: "TaskIcon"
      },
      {
        type: "service_table",
        title: "Tabela de Serviços",
        description: "Tabela para exibir serviços",
        icon: "TableIcon"
      }
    ]
  },
  {
    title: "Campos de Escolha",
    fields: [
      {
        type: "select",
        title: "Lista Suspensa",
        description: "Escolha única de uma lista",
        icon: "ListIcon"
      },
      {
        type: "multiselect",
        title: "Múltipla Escolha",
        description: "Várias escolhas de uma lista",
        icon: "ListIcon"
      },
      {
        type: "radio",
        title: "Botões de Opção",
        description: "Seleção de escolha única",
        icon: "CheckCircleIcon"
      },
      {
        type: "checkbox",
        title: "Caixas de Seleção",
        description: "Seleção de múltipla escolha",
        icon: "CheckCircleIcon"
      },
      {
        type: "toggle",
        title: "Toggle Switch",
        description: "Alternância entre sim/não",
        icon: "CheckCircleIcon"
      }
    ]
  },
  {
    title: "Campos Avançados",
    fields: [
      {
        type: "date",
        title: "Data",
        description: "Seletor de data",
        icon: "CalenderIcon"
      },
      {
        type: "time",
        title: "Hora",
        description: "Seletor de hora",
        icon: "TimeIcon"
      },
      {
        type: "file",
        title: "Upload de Arquivo",
        description: "Campo para envio de arquivos",
        icon: "FileIcon"
      },
      {
        type: "url",
        title: "URL do Site",
        description: "Para endereços de websites",
        icon: "FileIcon"
      },
      {
        type: "product",
        title: "Produto",
        description: "Campo para preço do produto",
        icon: "BoxIcon"
      },
      {
        type: "commission",
        title: "Comissão de Venda",
        description: "Porcentagem de comissão",
        icon: "DollarLineIcon"
      },
      {
        type: "country",
        title: "País",
        description: "Seleção de países",
        icon: "GridIcon"
      },
      {
        type: "brazilian_states",
        title: "Estados do Brasil",
        description: "Seleção de estado e cidade do Brasil",
        icon: "GridIcon"
      },
      {
        type: "brand",
        title: "Marca",
        description: "Nome e logo da marca",
        icon: "BoxCubeIcon"
      },
      {
        type: "button_buy",
        title: "Botão de Compra",
        description: "Botão para comprar produtos",
        icon: "ShoppingCartIcon"
      }
    ]
  },
  {
    title: "Campos de Layout",
    fields: [
      {
        type: "section",
        title: "Seção",
        description: "Adicionar título de seção com descrição",
        icon: "ListIcon"
      },
      {
        type: "html",
        title: "HTML",
        description: "Adicionar conteúdo HTML personalizado",
        icon: "CodeIcon"
      }
    ]
  },
  {
    title: "Campos de API",
    fields: [
      {
        type: "moz_da",
        title: "Moz DA",
        description: "Domain Authority do Moz",
        icon: "ChartIcon"
      },
      {
        type: "semrush_as",
        title: "Semrush AS",
        description: "Authority Score do Semrush",
        icon: "ChartIcon"
      },
      {
        type: "ahrefs_dr",
        title: "Ahrefs DR",
        description: "Domain Rating do Ahrefs",
        icon: "ChartIcon"
      },
      {
        type: "ahrefs_traffic",
        title: "Ahrefs Traffic",
        description: "Tráfego orgânico do Ahrefs",
        icon: "AhrefsTrafficIcon"
      },
      {
        type: "similarweb_traffic",
        title: "Similarweb Traffic",
        description: "Tráfego total do Similarweb",
        icon: "SimilarwebTrafficIcon"
      },
      {
        type: "google_traffic",
        title: "Google Traffic",
        description: "Tráfego estimado do Google",
        icon: "GoogleTrafficIcon"
      }
    ]
  }
];

export default function FormFieldSidebar({
  onAddField
}: FormFieldSidebarProps) {
  // Estado para busca de campos pelo usuário
  const [searchTerm, setSearchTerm] = useState("");
  // Estado para controlar quais grupos estão expandidos
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(fieldGroups.map((g) => g.title))
  );

  // Alterna a expansão de um grupo de campos
  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupTitle)) {
        next.delete(groupTitle);
      } else {
        next.add(groupTitle);
      }
      return next;
    });
  };

  // Filtra os grupos e campos conforme o termo de busca
  const filteredGroups = fieldGroups
    .map((group) => ({
      ...group,
      fields: group.fields.filter(
        (field) =>
          field.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          field.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }))
    .filter((group) => group.fields.length > 0);

  return (
    // Container principal da sidebar
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header com busca */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          Adicionar Campos
        </h3>
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar campos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-brand-500 dark:focus:border-brand-500"
          />
          <Icons.GridIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Lista de grupos e campos disponíveis */}
      <div className="flex-1 overflow-y-auto">
        {filteredGroups.map((group) => (
          <div
            key={group.title}
            className="border-b border-gray-200 dark:border-gray-800 last:border-0"
          >
            {/* Botão para expandir/recolher grupo */}
            <button
              onClick={() => toggleGroup(group.title)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              {group.title}
              <Icons.ChevronDownIcon
                className={`w-5 h-5 transition-transform ${
                  expandedGroups.has(group.title) ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Lista de campos do grupo, exibidos se o grupo estiver expandido */}
            {expandedGroups.has(group.title) && (
              <div className="p-4 grid grid-cols-2 gap-3">
                {group.fields.map((field) => {
                  const Icon = Icons[field.icon as keyof typeof Icons];
                  return (
                    // Botão para adicionar o campo ao formulário
                    <button
                      key={field.type}
                      onClick={() => onAddField(field.type)}
                      className="flex flex-col items-center justify-center p-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white/90 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-brand-500 dark:hover:border-brand-500 transition-colors group"
                      title={field.description}
                    >
                      <Icon className="mb-2 w-6 h-6 group-hover:text-brand-500" />
                      <span className="text-xs font-medium text-center leading-tight">
                        {field.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
