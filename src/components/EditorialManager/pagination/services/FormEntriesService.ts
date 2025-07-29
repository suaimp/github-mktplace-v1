import { supabase } from "../../../../lib/supabase";
import { PaginationParams, PaginatedResponse, FormEntry, StatusCounts } from "../types";
import { matchEntry } from "../../table/utils";

export class FormEntriesService {
  /**
   * Carrega entradas com paginação no backend - OTIMIZADO
   */
  static async loadEntriesPaginated(params: PaginationParams): Promise<PaginatedResponse<FormEntry>> {
    try {
      const { page, limit, searchTerm, statusFilter, sortField, sortDirection, formId } = params;
      
      console.log(`🔄 [FormEntriesService] Loading entries - Page: ${page}, Limit: ${limit}, FormId: ${formId}`);
      const startTime = performance.now();
      
      // Calcular offset
      const offset = (page - 1) * limit;
      
      // OTIMIZAÇÃO 1: Query básica sem JOINs problemáticos
      let query = supabase
        .from("form_entries")
        .select(
          `
          id,
          form_id,
          status,
          created_at,
          created_by,
          forms!form_id(title),
          form_entry_values(
            field_id,
            value,
            value_json
          ),
          form_entry_notes(
            id,
            note,
            created_at,
            created_by
          )
        `,
          { count: 'exact' }
        );

      // Apply form filter if selected
      if (formId) {
        query = query.eq("form_id", formId);
      }

      // Apply status filter
      if (statusFilter && statusFilter !== 'todos') {
        query = query.eq("status", statusFilter);
      }

      // Apply sorting
      const sortColumnMap: Record<string, string> = {
        'created_at': 'created_at',
        'status': 'status',
        'form_id': 'form_id'
      };
      
      const sortColumn = sortColumnMap[sortField || 'created_at'] || 'created_at';
      query = query.order(sortColumn, { ascending: sortDirection === 'asc' });

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      console.log(`⚡ [FormEntriesService] Query executed in ${(performance.now() - startTime).toFixed(2)}ms`);
      
      // Se há termo de busca, precisamos filtrar antes da paginação
      let filteredData = data;
      let filteredCount = count;
      
      if (searchTerm && formId) {
        const searchStartTime = performance.now();
        
        // Buscar fields para pesquisa
        const { data: fields } = await supabase
          .from("form_fields")
          .select("id, field_type, label")
          .eq("form_id", formId)
          .filter("field_type", "in", '("text","textarea","email","url")'); // Usar filter otimizado

        const fieldsData = fields || [];
        const lowerSearchTerm = searchTerm.toLowerCase();
        
        // Buscar TODOS os entries do form para aplicar filtro de busca
        let searchQuery = supabase
          .from("form_entries")
          .select(
            `
            id,
            form_id,
            status,
            created_at,
            created_by,
            forms!form_id(title),
            form_entry_values(
              field_id,
              value,
              value_json
            ),
            form_entry_notes(
              id,
              note,
              created_at,
              created_by
            )
          `,
            { count: 'exact' }
          );

        if (formId) {
          searchQuery = searchQuery.eq("form_id", formId);
        }

        if (statusFilter && statusFilter !== 'todos') {
          searchQuery = searchQuery.eq("status", statusFilter);
        }

        const { data: allEntries, error: searchError } = await searchQuery;
        
        if (searchError) throw searchError;

        // Processar todas as entries para busca
        const processedEntries = (allEntries || []).map((entry: any) => {
          const values: Record<string, any> = {};
          
          (entry.form_entry_values || []).forEach((entryValue: any) => {
            const { field_id, value, value_json } = entryValue;
            
            if (value_json !== null) {
              values[field_id] = value_json;
            } else {
              try {
                const parsedValue = JSON.parse(value);
                values[field_id] = parsedValue;
              } catch {
                values[field_id] = value;
              }
            }
          });

          return {
            ...entry,
            values
          };
        });

        // Buscar publishers para poder incluir na busca
        const createdByIds = [...new Set(processedEntries.map(entry => entry.created_by).filter(Boolean))];
        let publishersMap: Map<string, any> = new Map();
        
        if (createdByIds.length > 0) {
          // Buscar em platform_users
          const { data: platformUsers } = await supabase
            .from("platform_users")
            .select("id, first_name, last_name, email")
            .in("id", createdByIds);
          
          platformUsers?.forEach(user => {
            publishersMap.set(user.id, { ...user, type: 'platform' });
          });
          
          // Buscar os restantes em admins
          const remainingIds = createdByIds.filter(id => !publishersMap.has(id));
          if (remainingIds.length > 0) {
            const { data: adminUsers } = await supabase
              .from("admins")
              .select("id, first_name, last_name, email")
              .in("id", remainingIds);
            
            adminUsers?.forEach(user => {
              publishersMap.set(user.id, { ...user, type: 'admin' });
            });
          }
        }

        // Filtrar entries com base no termo de busca (incluindo publisher)
        const searchFilteredEntries = processedEntries.filter((entry) => {
          const entryWithPublisher = {
            ...entry,
            publisher: publishersMap.get(entry.created_by) || undefined
          };
          
          return matchEntry(entryWithPublisher, lowerSearchTerm, fieldsData);
        });

        // Aplicar paginação nos resultados filtrados
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        filteredData = searchFilteredEntries.slice(startIndex, endIndex);
        filteredCount = searchFilteredEntries.length;
        
        console.log(`🔍 [FormEntriesService] Search filter applied in ${(performance.now() - searchStartTime).toFixed(2)}ms`);
        console.log(`📊 [FormEntriesService] Found ${filteredCount} results for "${searchTerm}"`);
      }

      // OTIMIZAÇÃO 3: Processar entries e buscar publishers em lote
      const processStartTime = performance.now();
      
      // Usar os dados filtrados se houve busca, senão usar os dados originais
      const dataToProcess = searchTerm ? filteredData : data;
      
      // Buscar todos os publishers de uma só vez
      const createdByIds = [...new Set((dataToProcess || []).map(entry => entry.created_by).filter(Boolean))];
      let publishersMap: Map<string, any> = new Map();
      
      if (createdByIds.length > 0) {
        // Tentar buscar primeiro em platform_users
        const { data: platformUsers } = await supabase
          .from("platform_users")
          .select("id, first_name, last_name, email")
          .in("id", createdByIds);
        
        platformUsers?.forEach(user => {
          publishersMap.set(user.id, { ...user, type: 'platform' });
        });
        
        // Buscar os restantes em admins
        const remainingIds = createdByIds.filter(id => !publishersMap.has(id));
        if (remainingIds.length > 0) {
          const { data: adminUsers } = await supabase
            .from("admins")
            .select("id, first_name, last_name, email")
            .in("id", remainingIds);
          
          adminUsers?.forEach(user => {
            publishersMap.set(user.id, { ...user, type: 'admin' });
          });
        }
      }
      
      const processedEntries = (dataToProcess || []).map((entry: any) => {
        // Processo otimizado de valores
        const values: Record<string, any> = {};
        
        (entry.form_entry_values || []).forEach((entryValue: any) => {
          const { field_id, value, value_json } = entryValue;
          
          // Processamento simplificado sem async
          if (value_json !== null) {
            values[field_id] = value_json;
          } else {
            try {
              const parsedValue = JSON.parse(value);
              values[field_id] = parsedValue;
            } catch {
              values[field_id] = value;
            }
          }
        });

        // Publisher info otimizado (busca em lote)
        const publisher = publishersMap.get(entry.created_by) || null;

        return {
          id: entry.id,
          form_id: entry.form_id,
          created_at: entry.created_at,
          status: entry.status,
          created_by: entry.created_by,
          publisher,
          values,
          form: entry.forms,
          notes: entry.form_entry_notes || [],
          fields: []
        };
      });

      console.log(`🔧 [FormEntriesService] Entries processed in ${(performance.now() - processStartTime).toFixed(2)}ms`);

      // Para busca, já aplicamos a filtragem na query, então usar processedEntries diretamente
      // Usar contagem filtrada se houve busca
      const finalTotalItems = searchTerm ? (filteredCount || 0) : (count || 0);
      const totalPages = Math.ceil(finalTotalItems / limit);

      console.log(`✅ [FormEntriesService] Total processing time: ${(performance.now() - startTime).toFixed(2)}ms`);

      return {
        data: processedEntries,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: finalTotalItems,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      };
    } catch (error) {
      console.error("Error loading entries with pagination:", error);
      throw error;
    }
  }

  /**
   * Carrega contadores de status para as tabs - OTIMIZADO
   */
  static async loadStatusCounts(formId?: string): Promise<StatusCounts> {
    try {
      console.log(`📊 [FormEntriesService] Loading status counts for formId: ${formId}`);
      const startTime = performance.now();

      // OTIMIZAÇÃO: Query mais eficiente usando aggregate ao invés de fetch + filter
      let query = supabase
        .from("form_entries")
        .select("status", { count: "exact" });

      if (formId) {
        query = query.eq("form_id", formId);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // Count each status de forma mais eficiente
      const statusCount = {
        em_analise: 0,
        verificado: 0,
        reprovado: 0
      };

      data?.forEach(entry => {
        if (statusCount.hasOwnProperty(entry.status)) {
          statusCount[entry.status as keyof typeof statusCount]++;
        }
      });

      const counts = {
        todos: count || 0,
        em_analise: statusCount.em_analise,
        verificado: statusCount.verificado,
        reprovado: statusCount.reprovado
      };

      console.log(`✅ [FormEntriesService] Status counts loaded in ${(performance.now() - startTime).toFixed(2)}ms:`, counts);
      return counts;
    } catch (error) {
      console.error("Error loading status counts:", error);
      throw error;
    }
  }
}
