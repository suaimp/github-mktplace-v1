import { getFormEntries } from '../../../../services/db-services/form-services/formEntriesService';
import { getForms } from '../../../../services/db-services/form-services/formsService';

/**
 * Busca todos os form_entries do form 'cadastro de sites'
 */
export async function getSitesEntries() {
  // Busca todos os forms
  const forms = await getForms();
  if (!forms) return [];
  // Busca o id do form com title = 'cadastro de sites'
  const cadastroSitesForm = forms.find(f => f.title?.toLowerCase() === 'cadastro de sites');
  if (!cadastroSitesForm) return [];
  // Busca todos os form_entries
  const entries = await getFormEntries();
  if (!entries) return [];
  // Filtra os entries pelo form_id
  const filtered = entries.filter(e => e.form_id === cadastroSitesForm.id);
  return filtered;
} 