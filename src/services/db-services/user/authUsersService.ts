import { supabase } from '../../../lib/supabase';

/**
 * Busca todos os registros da tabela user_stats (um por mês/ano)
 */
export async function getAllUserStats() {
  try {
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .order('year', { ascending: true })
      .order('id', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar user_stats:', error);
    return [];
  }
}

/**
 * Busca o month_total do mês atual e do mês passado na tabela user_stats
 */
export async function getCurrentAndPreviousMonthTotals() {
  try {
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // getMonth() é 0-based
    const currentYear = today.getFullYear();
    // Mês passado
    let prevMonth = currentMonth - 1;
    let prevYear = currentYear;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = currentYear - 1;
    }
    // Buscar todos os registros
    const { data, error } = await supabase
      .from('user_stats')
      .select('month_total, name, year, last_date');
    if (error) throw error;
    console.log('user_stats data:', data);
    if (data && data.length > 0) {
      data.forEach(row => console.log('Linha:', row, 'last_date:', row.last_date));
    } else {
      console.log('user_stats data está vazio!');
    }
    // Função para checar se a data está no mês/ano desejado
    function isSameMonthYear(dateStr: string, month: number, year: number) {
      if (!dateStr) return false;
      const [yyyy, mm] = dateStr.split('-');
      return Number(mm) === month && Number(yyyy) === year;
    }
    // Encontrar linha do mês atual
    let current = data?.find(row => row.last_date && isSameMonthYear(row.last_date, currentMonth, currentYear)) || null;
    // Encontrar linha do mês passado
    let previous = data?.find(row => row.last_date && isSameMonthYear(row.last_date, prevMonth, prevYear)) || null;
    // Se não encontrar current, pega o registro mais recente
    if (!current && data && data.length > 0) {
      current = data.reduce((latest, row) => {
        return (row.last_date > latest.last_date) ? row : latest;
      }, data[0]);
    }
    // Se não encontrar previous, pega o segundo mais recente
    if (!previous && data && data.length > 1) {
      // Ordena por last_date decrescente
      const sorted = [...data].sort((a, b) => b.last_date.localeCompare(a.last_date));
      previous = sorted[1] || null;
    }
    console.log('current:', current, 'previous:', previous);
    return {
      currentMonthTotal: current?.month_total ?? 0,
      previousMonthTotal: previous?.month_total ?? 0,
      currentMonthName: current?.name ?? '',
      previousMonthName: previous?.name ?? ''
    };
  } catch (error) {
    console.error('Erro ao buscar totais dos meses:', error);
    return {
      currentMonthTotal: 0,
      previousMonthTotal: 0,
      currentMonthName: '',
      previousMonthName: ''
    };
  }
}

// Função auxiliar para converter nome do mês para número
function getMonthNumber(name: string): number {
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return meses.findIndex(m => m.toLowerCase() === name.toLowerCase().trim()) + 1;
} 