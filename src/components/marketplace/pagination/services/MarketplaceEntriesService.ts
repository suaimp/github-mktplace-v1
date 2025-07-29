import { supabase } from "../../../../lib/supabase";
import { MarketplacePaginationParams, MarketplacePaginatedResponse, MarketplaceEntry, MarketplaceCounts } from "../types";

export class MarketplaceEntriesService {
  /**
   * Carrega entradas do marketplace com paginação no backend
   */
  static async loadEntriesPaginated(params: MarketplacePaginationParams): Promise<MarketplacePaginatedResponse<MarketplaceEntry>> {
    try {
      const { page, limit, searchTerm, tabFilter, sortField, sortDirection, formId } = params;
      
      // Calcular offset
      const offset = (page - 1) * limit;
      
      // Build the base query - só entradas verificadas para o marketplace
      let query = supabase
        .from("form_entries")
        .select(
          `
          id,
          created_at,
          status,
          form_entry_values (
            field_id,
            value,
            value_json
          )
        `,
          { count: 'exact' }
        )
        .eq("form_id", formId)
        .eq("status", "verificado");

      // Apply sorting
      const sortColumnMap: Record<string, string> = {
        'created_at': 'created_at',
        'status': 'status'
      };
      
      const sortColumn = sortColumnMap[sortField || 'created_at'] || 'created_at';
      query = query.order(sortColumn, { ascending: sortDirection === 'asc' });

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) throw error;

      // Load form fields for processing
      const { data: fieldsData } = await supabase
        .from("form_fields")
        .select(`*, form_field_settings (*)`)
        .eq("form_id", formId)
        .order("position", { ascending: true });

      const fields = fieldsData || [];

      // Process entries to map values to fields
      const processedEntries = (data || []).map((entry: any) => {
        const values: Record<string, any> = {};

        entry.form_entry_values.forEach((value: any) => {
          if (value.value_json !== null) {
            values[value.field_id] = value.value_json;
          } else {
            // Verifica se value.value contém um objeto com promotional_price ou price
            try {
              const parsedValue = JSON.parse(value.value);

              if (parsedValue && typeof parsedValue === "object") {
                // Para campos do tipo product, preserva o objeto completo
                if (parsedValue.price || parsedValue.promotional_price) {
                  values[value.field_id] = parsedValue;
                } else {
                  values[value.field_id] = parsedValue;
                }
              } else {
                values[value.field_id] = value.value;
              }
            } catch {
              values[value.field_id] = value.value;
            }
          }
        });

        return {
          id: entry.id,
          created_at: entry.created_at,
          status: entry.status,
          values,
        };
      });

      // Apply client-side filters that require processed data
      let filteredEntries = processedEntries;

      // Apply tab filter
      if (tabFilter === 'promocao') {
        filteredEntries = filteredEntries.filter((entry) => {
          const productField = fields.find(f => f.field_type === 'product');
          if (productField) {
            const productData = entry.values[productField.id];
            if (productData && typeof productData === 'object') {
              const promotionalPrice = productData.promotional_price || productData.price_promotional;
              return promotionalPrice && parseFloat(promotionalPrice) > 0;
            }
          }
          return false;
        });
      } else if (tabFilter === 'favoritos') {
        // TODO: Implementar filtro de favoritos quando disponível
        filteredEntries = [];
      }

      // Apply search filter
      if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        filteredEntries = filteredEntries.filter((entry) => {
          return Object.entries(entry.values).some(([fieldId, value]) => {
            const field = fields.find((f) => f.id === fieldId);
            if (!field) return false;

            // Only search in text-based fields
            if (["text", "textarea", "email", "url"].includes(field.field_type)) {
              return String(value).toLowerCase().includes(lowerSearchTerm);
            }
            return false;
          });
        });
      }

      // For client-side filtering, we need to recalculate pagination
      const filteredCount = filteredEntries.length;
      const totalPages = Math.ceil(filteredCount / limit);

      // Apply pagination to filtered results
      const startIndex = (page - 1) * limit;
      const paginatedFiltered = filteredEntries.slice(startIndex, startIndex + limit);

      return {
        data: paginatedFiltered,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: filteredCount,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      };
    } catch (error) {
      console.error("Error loading marketplace entries with pagination:", error);
      throw error;
    }
  }

  /**
   * Carrega contadores para as tabs do marketplace
   */
  static async loadMarketplaceCounts(formId: string): Promise<MarketplaceCounts> {
    try {
      // Load all verified entries
      const { data: entriesData, error } = await supabase
        .from("form_entries")
        .select(`
          id,
          form_entry_values (
            field_id,
            value,
            value_json
          )
        `)
        .eq("form_id", formId)
        .eq("status", "verificado");

      if (error) throw error;

      // Load form fields
      const { data: fieldsData } = await supabase
        .from("form_fields")
        .select("*")
        .eq("form_id", formId);

      const fields = fieldsData || [];

      // Process entries to count categories
      let promocaoCount = 0;
      
      (entriesData || []).forEach((entry: any) => {
        const values: Record<string, any> = {};

        entry.form_entry_values.forEach((value: any) => {
          if (value.value_json !== null) {
            values[value.field_id] = value.value_json;
          } else {
            try {
              const parsedValue = JSON.parse(value.value);
              values[value.field_id] = parsedValue;
            } catch {
              values[value.field_id] = value.value;
            }
          }
        });

        // Check if entry has promotional price
        const productField = fields.find(f => f.field_type === 'product');
        if (productField) {
          const productData = values[productField.id];
          if (productData && typeof productData === 'object') {
            const promotionalPrice = productData.promotional_price || productData.price_promotional;
            if (promotionalPrice && parseFloat(promotionalPrice) > 0) {
              promocaoCount++;
            }
          }
        }
      });

      return {
        todos: entriesData?.length || 0,
        promocao: promocaoCount,
        favoritos: 0 // TODO: Implementar quando disponível
      };
    } catch (error) {
      console.error("Error loading marketplace counts:", error);
      throw error;
    }
  }
}
