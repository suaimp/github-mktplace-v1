import { useState, useEffect } from "react";
import { FeedbackSubmissionsService } from "../../../services/db-services/home-dashboard-services/feedbackSubmissionsService";
import type { FeedbackSubmissionDisplay } from "../../../services/db-services/home-dashboard-services/feedbackSubmissionsService";

interface AdminFeedbackDashboardProps {
  className?: string;
}

export default function AdminFeedbackDashboard({
  className = ""
}: AdminFeedbackDashboardProps) {
  const [feedbacks, setFeedbacks] = useState<FeedbackSubmissionDisplay[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadFeedbacks();
    loadStats();
  }, [selectedStatus, currentPage]);

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      setError(null);

      let result;
      if (selectedStatus === "all") {
        // Carregar todos os feedbacks (método específico para admins)
        result = await FeedbackSubmissionsService.getAllFeedbacks(
          currentPage,
          10
        );
      } else {
        // Carregar feedbacks por status
        result = await FeedbackSubmissionsService.getFeedbacksByStatus(
          selectedStatus,
          currentPage,
          10
        );
      }

      setFeedbacks(result.data);
      setTotalCount(result.count);
    } catch (err) {
      console.error("Erro ao carregar feedbacks:", err);
      setError(
        err instanceof Error ? err.message : "Erro ao carregar feedbacks"
      );
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await FeedbackSubmissionsService.getStats();
      setStats(statsData);
    } catch (err) {
      console.error("Erro ao carregar estatísticas:", err);
    }
  };

  const handleMarkAsReviewed = async (feedbackId: string) => {
    try {
      await FeedbackSubmissionsService.markAsReviewed(
        feedbackId,
        "Revisado pelo administrador"
      );
      await loadFeedbacks();
      await loadStats();
    } catch (err) {
      console.error("Erro ao marcar como revisado:", err);
      setError(
        err instanceof Error ? err.message : "Erro ao marcar como revisado"
      );
    }
  };

  const handleStatusChange = async (feedbackId: string, newStatus: string) => {
    try {
      await FeedbackSubmissionsService.updateStatus(feedbackId, newStatus);
      await loadFeedbacks();
      await loadStats();
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      setError(err instanceof Error ? err.message : "Erro ao atualizar status");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR");
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
      reviewed:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      in_progress:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
      resolved:
        "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          statusStyles[status] || statusStyles.pending
        }`}
      >
        {status === "pending" && "Pendente"}
        {status === "reviewed" && "Revisado"}
        {status === "in_progress" && "Em Progresso"}
        {status === "resolved" && "Resolvido"}
      </span>
    );
  };

  if (loading && feedbacks.length === 0) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Painel Administrativo - Feedbacks
        </h2>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total
            </h3>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {stats.total}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Pendentes
            </h3>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Revisados
            </h3>
            <p className="text-2xl font-bold text-blue-600">{stats.reviewed}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Em Progresso
            </h3>
            <p className="text-2xl font-bold text-purple-600">
              {stats.in_progress}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Resolvidos
            </h3>
            <p className="text-2xl font-bold text-green-600">
              {stats.resolved}
            </p>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Filtrar por status:
        </label>
        <select
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="all">Todos</option>
          <option value="pending">Pendentes</option>
          <option value="reviewed">Revisados</option>
          <option value="in_progress">Em Progresso</option>
          <option value="resolved">Resolvidos</option>
        </select>
      </div>

      {/* Lista de Feedbacks */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200 dark:bg-red-900/20 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Assunto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Prioridade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {feedbacks.map((feedback) => (
                <tr
                  key={feedback.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {feedback.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {feedback.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {feedback.subject}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                      {feedback.message}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {feedback.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {feedback.priority}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(feedback.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(feedback.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {feedback.status === "pending" && (
                      <button
                        onClick={() => handleMarkAsReviewed(feedback.id)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Marcar como Revisado
                      </button>
                    )}
                    <select
                      value={feedback.status}
                      onChange={(e) =>
                        handleStatusChange(feedback.id, e.target.value)
                      }
                      className="text-xs px-2 py-1 border border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="pending">Pendente</option>
                      <option value="reviewed">Revisado</option>
                      <option value="in_progress">Em Progresso</option>
                      <option value="resolved">Resolvido</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalCount > 10 && (
          <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Mostrando {(currentPage - 1) * 10 + 1} -{" "}
              {Math.min(currentPage * 10, totalCount)} de {totalCount} feedbacks
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={currentPage * 10 >= totalCount}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
              >
                Próximo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
