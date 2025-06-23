import { useState, useEffect } from "react";
import {
  getFeedbackSubmissions,
  updateFeedbackStatus,
  deleteFeedback,
  getFeedbackStats,
  getCategoryName,
  getPriorityName
} from "./actions/feedbackActions";
import {
  FeedbackSubmission,
  FeedbackStatus,
  FEEDBACK_STATUSES
} from "./types/feedback";
import { TrashBinIcon } from "../../../icons";

export default function FeedbackManager() {
  const [submissions, setSubmissions] = useState<FeedbackSubmission[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FeedbackStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"date" | "priority">("date");

  useEffect(() => {
    loadData();
  }, []);
  const loadData = async () => {
    try {
      setLoading(true);
      const [feedbackData, statsData] = await Promise.all([
        getFeedbackSubmissions(),
        getFeedbackStats()
      ]);

      console.log("📂 Dados de feedback carregados:", {
        totalSubmissions: feedbackData.length,
        submissions: feedbackData.map((sub) => ({
          id: sub.id,
          subject: sub.subject,
          category: getCategoryName(sub.category),
          categoryId: sub.category,
          priority: getPriorityName(sub.priority),
          priorityId: sub.priority,
          status: sub.status,
          submittedAt: sub.submittedAt
        })),
        stats: statsData
      });

      setSubmissions(feedbackData);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading feedback data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: FeedbackStatus) => {
    try {
      await updateFeedbackStatus(id, status);
      await loadData(); // Reload data
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this feedback?")) {
      try {
        await deleteFeedback(id);
        await loadData(); // Reload data
      } catch (error) {
        console.error("Error deleting feedback:", error);
      }
    }
  };
  const filteredSubmissions = submissions
    .filter((sub) => filter === "all" || sub.status === filter)
    .sort((a, b) => {
      if (sortBy === "date") {
        return (
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        );
      } else {
        // Ordenação por prioridade: Alta(3) > Média(2) > Baixa(1)
        return b.priority - a.priority;
      }
    });

  const getStatusColor = (status: FeedbackStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "reviewed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "implemented":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };
  const getPriorityColor = (priorityId: number) => {
    const priorityName = getPriorityName(priorityId);
    switch (priorityName) {
      case "Alta":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "Média":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "Baixa":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-brand-500 mb-1">
              {stats.total}
            </div>{" "}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total de Submissões
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-yellow-500 mb-1">
              {stats.pending}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Pendente de Análise
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-green-500 mb-1">
              {stats.implemented}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Implementadas
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-blue-500 mb-1">
              {stats.reviewed}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Em Análise
            </div>
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            {" "}
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filtrar por Status:
            </label>{" "}
            <select
              value={filter}
              onChange={(e) => {
                const newFilter = e.target.value as FeedbackStatus | "all";
                console.log("📊 Status selecionado:", newFilter);
                setFilter(newFilter);
              }}
              className="px-3 py-1 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              {" "}
              <option value="all">Todos</option>
              {FEEDBACK_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            {" "}
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Ordenar por:
            </label>{" "}
            <select
              value={sortBy}
              onChange={(e) => {
                const newSortBy = e.target.value as "date" | "priority";
                console.log("🔄 Ordenação selecionada:", newSortBy);
                setSortBy(newSortBy);
              }}
              className="px-3 py-1 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="date">Data</option>
              <option value="priority">Prioridade</option>
            </select>
          </div>{" "}
          <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
            Mostrando {filteredSubmissions.length} de {submissions.length}{" "}
            submissões
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              Nenhuma submissão de feedback encontrada.
            </p>
          </div>
        ) : (
          filteredSubmissions.map((submission) => (
            <div
              key={submission.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      {submission.subject}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        submission.status
                      )}`}
                    >
                      {submission.status}
                    </span>{" "}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                        submission.priority
                      )}`}
                    >
                      {getPriorityName(submission.priority).toLowerCase()}{" "}
                      prioridade
                    </span>
                  </div>{" "}
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                    {getCategoryName(submission.category)} • Enviado por{" "}
                    {submission.name} ({submission.email})
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    {new Date(submission.submittedAt).toLocaleDateString()} at{" "}
                    {new Date(submission.submittedAt).toLocaleTimeString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {" "}
                  <select
                    value={submission.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as FeedbackStatus;
                      console.log("🔄 Status atualizado para submission:", {
                        id: submission.id,
                        subject: submission.subject,
                        oldStatus: submission.status,
                        newStatus: newStatus,
                        category: getCategoryName(submission.category),
                        priority: getPriorityName(submission.priority)
                      });
                      handleStatusUpdate(submission.id, newStatus);
                    }}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    {FEEDBACK_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleDelete(submission.id)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                  >
                    <TrashBinIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {submission.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
