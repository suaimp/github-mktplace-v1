import { useState } from "react";
import { PaperPlaneIcon, UserCircleIcon } from "../../../icons";
import { supabase } from "../../../lib/supabase";
import { FEEDBACK_CATEGORIES } from "./types/feedback";
import PhoneInput from "../../form/group-input/PhoneInput";
import usePhoneInput from "./hooks/usePhoneInput";
import useFeedbackForm from "./hooks/useFeedbackForm";

export default function FeedbackForm() {
  const { 
    formData, 
    updateFormData, 
    resetForm, 
    isLoadingUser
  } = useFeedbackForm();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = FEEDBACK_CATEGORIES;

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    const newValue = name === "category" ? Number(value) : value;

    if (name === "category" && Number(value) > 0) {
      const selectedCategory = categories.find(
        (cat) => cat.category_id === Number(value)
      );
      console.log("🏷️ Categoria selecionada:", {
        id: Number(value),
        name: selectedCategory?.category,
        allCategories: categories
      });
    }

    updateFormData(name as keyof typeof formData, newValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    console.log("📝 Formulário sendo enviado:", {
      formData,
      categoryName: categories.find(
        (cat) => cat.category_id === formData.category
      )?.category
    });
    try {
      // Buscar token JWT do usuário autenticado
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      // Envio para edge function de e-mail
      const categoryName = categories.find(cat => cat.category_id === formData.category)?.category || "";
      const response = await fetch("https://uxbeaslwirkepnowydfu.supabase.co/functions/v1/feedback-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          feedback: {
            ...formData,
            category: categoryName
          }
        })
      });
      if (!response.ok) {
        throw new Error("Erro ao enviar feedback por e-mail");
      }
      setIsSubmitted(true);
      // Resetar formulário mantendo dados do usuário
      resetForm();
    } catch (err) {
      console.error("❌ Erro ao enviar feedback:", err);
      setError(
        err instanceof Error ? err.message : "Failed to submit feedback"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingUser) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <svg
              className="h-8 w-8 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
            Obrigado pelo seu feedback!
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Sua sugestão foi enviada com sucesso. Iremos analisá-la e
            retornaremos em breve.
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="text-brand-500 hover:text-brand-600 font-medium"
          >
            Enviar outra sugestão
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <UserCircleIcon className="h-6 w-6 text-brand-500" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Compartilhe Suas Ideias de Melhoria
          </h3>
        </div>
        <p className="text-gray-500 text-sm dark:text-gray-400">
          Ajude-nos a melhorar compartilhando suas sugestões e feedback
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 dark:bg-red-900/20 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Nome *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full h-11 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="Seu nome completo"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full h-11 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="seu.email@exemplo.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Categoria *
            </label>
            <div className="relative">
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full h-11 px-3 py-2 pr-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white appearance-none bg-white dark:bg-gray-800"
              >
                <option value={0}>Selecione uma categoria</option>
                {categories.map((categoryOption) => (
                  <option
                    key={categoryOption.category_id}
                    value={categoryOption.category_id}
                  >
                    {categoryOption.category}
                  </option>
                ))}
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  className="stroke-gray-500 dark:stroke-gray-400"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.79175 7.396L10.0001 12.6043L15.2084 7.396"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Telefone
            </label>
            <PhoneInput
              countries={usePhoneInput.countries}
              value={formData.phone}
              onChange={(value) => updateFormData("phone", value)}
              placeholder="(99) 99999-9999"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="subject"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Assunto *
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            required
            className="w-full h-11 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            placeholder="Breve descrição da sua sugestão"
          />
        </div>

        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Mensagem Detalhada *
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white resize-none"
            placeholder="Por favor, forneça informações detalhadas sobre sua sugestão ou ideia de melhoria..."
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Enviando...
              </>
            ) : (
              <>
                <PaperPlaneIcon className="h-4 w-4" />
                Enviar Feedback
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
