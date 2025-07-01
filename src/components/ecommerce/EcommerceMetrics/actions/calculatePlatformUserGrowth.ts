import { supabase } from "../../../../lib/supabase";

/**
 * Calcula a variação percentual de usuários entre o mês atual e o mês anterior.
 * Retorna { percent: number, current: number, previous: number }
 */
export async function calculatePlatformUserGrowth() {
  // Datas de início e fim do mês atual
  const now = new Date();
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // Datas de início e fim do mês anterior
  const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const startOfCurrentMonthCopy = new Date(startOfCurrentMonth); // fim do mês anterior

  // Buscar contagem do mês atual
  const { count: current, error: errorCurrent } = await supabase
    .from("platform_users")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startOfCurrentMonth.toISOString())
    .lt("created_at", startOfNextMonth.toISOString());

  // Buscar contagem do mês anterior
  const { count: previous, error: errorPrevious } = await supabase
    .from("platform_users")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startOfPreviousMonth.toISOString())
    .lt("created_at", startOfCurrentMonthCopy.toISOString());

  if (errorCurrent || errorPrevious) {
    throw errorCurrent || errorPrevious;
  }

  // Cálculo da variação percentual
  let percent = 0;
  if (previous && previous > 0) {
    percent = ((current! - previous) / previous) * 100;
  } else if (current && current > 0) {
    percent = 100;
  }

  return {
    percent,
    current: current || 0,
    previous: previous || 0,
  };
} 