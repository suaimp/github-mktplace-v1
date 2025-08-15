import React, { useEffect, useState } from "react";
import { getMonthRevenue } from "./actions/getMonthRevenue";
import { getMonthRevenueDiff } from "./actions/getMonthRevenueDiff";
import { getCurrentAndPreviousMonthTotals } from '../../../services/db-services/user/authUsersService';
import { getSitesEntries } from './actions/getSitesEntries';
import { getAllOrders } from '../../../services/db-services/marketplace-services/order/OrderService';

// Função utilitária para formatar valores em K
function formatCurrencyK(value: number): string {
  if (value >= 1000) {
    const k = value / 1000;
    // Se for inteiro, exibe sem casas decimais, senão, uma casa decimal
    const kStr = Number.isInteger(k) ? k.toFixed(0) : k.toFixed(1);
    return `R$ ${kStr}K`;
  }
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const AnalyticsSummary: React.FC = () => {
  const [faturamentoMes, setFaturamentoMes] = useState<number | null>(null);
  const [diffPercent, setDiffPercent] = useState<number | null>(null);
  const [usuariosCount, setUsuariosCount] = useState<number | null>(null);
  const [usuariosDiff, setUsuariosDiff] = useState<number | null>(null);
  const [usuariosLoading, setUsuariosLoading] = useState<boolean>(true);
  const [sitesThisMonth, setSitesThisMonth] = useState<number | null>(null);
  const [sitesLoading, setSitesLoading] = useState<boolean>(true);
  // const [sitesDiff, setSitesDiff] = useState<number | null>(null);
  const [salesThisMonth, setSalesThisMonth] = useState<number | null>(null);
  const [salesDiff, setSalesDiff] = useState<number | null>(null);
  const [salesLoading, setSalesLoading] = useState<boolean>(true);

  useEffect(() => {
    getMonthRevenue().then(setFaturamentoMes);
    getMonthRevenueDiff().then(res => setDiffPercent(res.diffPercent));
    setUsuariosLoading(true);
    getCurrentAndPreviousMonthTotals().then(res => {
      setUsuariosCount(res.currentMonthTotal);
      if (res.previousMonthTotal > 0) {
        setUsuariosDiff(((res.currentMonthTotal - res.previousMonthTotal) / res.previousMonthTotal) * 100);
      } else if (res.currentMonthTotal > 0) {
        setUsuariosDiff(999); // Valor especial para primeiros dados
      } else {
        setUsuariosDiff(0);
      }
      setUsuariosLoading(false);
    });
    setSitesLoading(true);
    getSitesEntries().then(entries => {
      // Exibe o total de todos os sites cadastrados
      const totalSites = entries.length;
      
      // Comentado: lógica da porcentagem não é mais usada
      // Para o cálculo da diferença, ainda comparamos mês atual vs anterior
      // const now = new Date();
      // const currentMonth = now.getMonth() + 1;
      // const currentYear = now.getFullYear();
      // const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      // const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      
      // const countCurrent = entries.filter(e => {
      //   const d = new Date(e.created_at);
      //   return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
      // }).length;
      // const countPrev = entries.filter(e => {
      //   const d = new Date(e.created_at);
      //   return d.getMonth() + 1 === prevMonth && d.getFullYear() === prevYear;
      // }).length;
      
      setSitesThisMonth(totalSites); // Mostra o total de todos os sites
      // Comentado: lógica da porcentagem não é mais usada
      // if (countPrev > 0) {
      //   setSitesDiff(((countCurrent - countPrev) / countPrev) * 100);
      // } else if (countCurrent > 0) {
      //   setSitesDiff(999); // Valor especial para primeiros dados
      // } else {
      //   setSitesDiff(0);
      // }
      setSitesLoading(false);
    });
    setSalesLoading(true);
    getAllOrders().then(orders => {
      if (!orders) {
        setSalesThisMonth(0);
        setSalesDiff(0); // Corrigido: definir 0 em vez de null
        setSalesLoading(false);
        return;
      }
      const now = new Date();
      const currentMonth = now.getUTCMonth() + 1;
      const currentYear = now.getUTCFullYear();
      const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      const countCurrent = orders.filter(o => {
        const d = new Date(o.created_at);
        return d.getUTCMonth() + 1 === currentMonth && d.getUTCFullYear() === currentYear;
      }).length;
      const countPrev = orders.filter(o => {
        const d = new Date(o.created_at);
        return d.getUTCMonth() + 1 === prevMonth && d.getUTCFullYear() === prevYear;
      }).length;
      setSalesThisMonth(countCurrent);
      
      if (countPrev > 0) {
        const diff = ((countCurrent - countPrev) / countPrev) * 100;
        setSalesDiff(diff);
      } else if (countCurrent > 0) {
        // Se não há dados no mês anterior mas há no atual, indica crescimento infinito
        setSalesDiff(999);
      } else {
        // Se não há dados em nenhum dos dois meses
        setSalesDiff(0);
      }
      setSalesLoading(false);
    });
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
      {/* Faturamento Mês */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-gray-500 text-theme-sm dark:text-gray-400">Faturamento Mês</p>
        <div className="flex items-end justify-between mt-3">
          <div>
            <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90">
              {faturamentoMes === null ? '...' : formatCurrencyK(faturamentoMes)}
            </h4>
          </div>
          <div className="flex items-center gap-1">
            <span
              className={
                `inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-sm ` +
                (diffPercent !== null && diffPercent < 0
                  ? 'bg-red-200 text-red-700'
                  : 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500')
              }
            >
              <span className="text-xs">
                {diffPercent === null ? '...' : `${diffPercent > 0 ? '+' : ''}${diffPercent.toFixed(1)}%`}
              </span>
            </span>
            <span className="text-gray-500 text-theme-xs dark:text-gray-400">Vs mês anterior</span>
          </div>
        </div>
      </div>
      {/* Total Pageviews */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-gray-500 text-theme-sm dark:text-gray-400">Usuários</p>
        <div className="flex items-end justify-between mt-3">
          <div>
            <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90">
              {usuariosLoading ? '...' : usuariosCount}
            </h4>
          </div>
          <div className="flex items-center gap-1">
            <span className={
              `inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-sm ` +
              (usuariosDiff !== null && usuariosDiff < 0
                ? 'bg-red-200 text-red-700'
                : 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500')
            }>
              <span className="text-xs">
                {usuariosLoading ? '...' : 
                  usuariosDiff === 999 ? '+100%' : 
                  usuariosDiff === null ? '...' : 
                  usuariosDiff === 0 ? '0%' :
                  `${usuariosDiff > 0 ? '+' : ''}${usuariosDiff.toFixed(1)}%`}
              </span>
            </span>
            <span className="text-gray-500 text-theme-xs dark:text-gray-400">Vs mês anterior</span>
          </div>
        </div>
      </div>
      {/* Total Sites */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-gray-500 text-theme-sm dark:text-gray-400">Total de Sites</p>
        <div className="flex items-end justify-between mt-3">
          <div>
            <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90">
              {sitesLoading ? '...' : (sitesThisMonth !== null ? (sitesThisMonth >= 1000 ? `${(sitesThisMonth/1000).toFixed(sitesThisMonth % 1000 === 0 ? 0 : 1)}K` : sitesThisMonth) : '0')}
            </h4>
          </div>
          {/* 
          <div className="flex items-center gap-1">
            <span className={
              `inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-sm ` +
              (sitesDiff !== null && sitesDiff < 0
                ? 'bg-red-200 text-red-700'
                : 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500')
            }>
              <span className="text-xs">
                {sitesLoading ? '...' : 
                  sitesDiff === 999 ? '+100%' : 
                  sitesDiff === null ? '...' : 
                  sitesDiff === 0 ? '0%' :
                  `${sitesDiff > 0 ? '+' : ''}${sitesDiff.toFixed(1)}%`}
              </span>
            </span>
            <span className="text-gray-500 text-theme-xs dark:text-gray-400">Novos cadastros vs mês anterior</span>
          </div>
          */}
        </div>
      </div>
      {/* Visit Duration */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-gray-500 text-theme-sm dark:text-gray-400">Vendas do Mês</p>
        <div className="flex items-end justify-between mt-3">
          <div>
            <h4 className="text-2xl font-bold text-gray-800 dark:text-white/90">
              {salesLoading ? '...' : (salesThisMonth !== null ? (salesThisMonth >= 1000 ? `${(salesThisMonth/1000).toFixed(salesThisMonth % 1000 === 0 ? 0 : 1)}K` : salesThisMonth) : '0')}
            </h4>
          </div>
          <div className="flex items-center gap-1">
            <span className={
              `inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-sm ` +
              (salesDiff !== null && salesDiff < 0
                ? 'bg-red-200 text-red-700'
                : 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500')
            }>
              <span className="text-xs">
                {(() => {
                  // Prioriza mostrar +100% se salesDiff for 999, independente do loading
                  if (salesDiff === 999) return '+100%';
                  if (salesLoading) return '...';
                  if (salesDiff === null) return '...';
                  if (salesDiff === 0) return '0%';
                  return `${salesDiff > 0 ? '+' : ''}${salesDiff.toFixed(1)}%`;
                })()}
              </span>
            </span>
            <span className="text-gray-500 text-theme-xs dark:text-gray-400">Vs mês anterior</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSummary; 