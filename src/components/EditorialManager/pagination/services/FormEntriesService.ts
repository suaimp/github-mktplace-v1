import { supabase } from "../../../../lib/supabase";
import { PaginationParams, PaginatedResponse, FormEntry, StatusCounts } from "../types";
import { processEntryValues } from "../../actions/valuePriceProcessor";

export class FormEntriesService {
  /**
   * Carrega entradas com paginação no backend
   */
  static async loadEntriesPaginated(params: PaginationParams): Promise<PaginatedResponse<FormEntry>> {
    try {
      const { page, limit, searchTerm, statusFilter, sortField, sortDirection, formId } = params;
      
      // Calcular offset
      const offset = (page - 1) * limit;
      
      // Build the base query
      let query = supabase
        .from("form_entries")
        .select(
          `
          id,
          form_id,
          status,
          created_at,
          created_by,
          form:forms(title),
          values:form_entry_values(
            field_id,
            value,
            value_json
          ),
          notes:form_entry_notes(
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

      // Apply search filter (will be done after data retrieval for complex search)
      
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

      // Process entries to format values
      const processedEntries = await Promise.all(
        (data || []).map(async (entry: any) => {
          // Usa a lógica extraída para processar os valores
          const values = await processEntryValues(entry.values);

          // Get publisher info if created_by exists
          let publisher: any = null;
          if (entry.created_by) {
            // First try to get from platform_users
            const { data: platformUserData, error: platformUserError } =
              await supabase
                .from("platform_users")
                .select("first_name, last_name, email")
                .eq("id", entry.created_by)
                .maybeSingle();

            if (!platformUserError && platformUserData) {
              publisher = platformUserData;
            } else {
              // If not found in platform_users, try admins
              const { data: adminData, error: adminError } = await supabase
                .from("admins")
                .select("first_name, last_name, email")
                .eq("id", entry.created_by)
                .maybeSingle();

              if (!adminError && adminData) {
                publisher = adminData;
              }
            }
          }

          return {
            id: entry.id,
            form_id: entry.form_id,
            created_at: entry.created_at,
            status: entry.status,
            created_by: entry.created_by,
            publisher,
            values,
            form: entry.form,
            notes: entry.notes || [],
            fields: []
          };
        })
      );

      // Apply search filter to processed entries if searchTerm exists
      let filteredEntries = processedEntries;
      if (searchTerm) {
        // We need form fields for proper search
        const { data: fieldsData } = await supabase
          .from("form_fields")
          .select("*")
          .eq("form_id", formId || processedEntries[0]?.form_id)
          .order("position", { ascending: true });

        const fields = fieldsData || [];
        const lowerSearchTerm = searchTerm.toLowerCase();
        
        filteredEntries = processedEntries.filter((entry) => {
          return Object.entries(entry.values).some(([fieldId, value]) => {
            const field = fields.find((f) => f.id === fieldId);
            if (!field) return false;

            // Search in text-based fields
            if (["text", "textarea", "email", "url"].includes(field.field_type)) {
              return String(value).toLowerCase().includes(lowerSearchTerm);
            }
            return false;
          });
        });
      }

      const totalItems = count || 0;
      const totalPages = Math.ceil(totalItems / limit);

      return {
        data: filteredEntries,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
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
   * Carrega contadores de status para as tabs
   */
  static async loadStatusCounts(formId?: string): Promise<StatusCounts> {
    try {
      let query = supabase
        .from("form_entries")
        .select("status", { count: 'exact' });

      if (formId) {
        query = query.eq("form_id", formId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Count each status
      const counts = {
        todos: data?.length || 0,
        em_analise: data?.filter(entry => entry.status === 'em_analise').length || 0,
        verificado: data?.filter(entry => entry.status === 'verificado').length || 0,
        reprovado: data?.filter(entry => entry.status === 'reprovado').length || 0
      };

      return counts;
    } catch (error) {
      console.error("Error loading status counts:", error);
      throw error;
    }
  }
}
