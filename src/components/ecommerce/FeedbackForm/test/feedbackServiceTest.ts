// Arquivo para testar o serviço de feedback
// Execute este arquivo no console do navegador para testar

import { FeedbackSubmissionsService } from "../../../../services/db-services/home-dashboard-services/feedbackSubmissionsService";

// Exemplo de teste do serviço
export const testFeedbackService = async () => {
  try {
    console.log("🧪 Testando FeedbackSubmissionsService...");

    // 1. Criar um feedback de teste
    const testFeedback = {
      name: "Usuário Teste",
      email: "teste@exemplo.com",
      category: "Melhoria do Produto",
      priority: "Alta",
      subject: "Teste do serviço",
      message:
        "Esta é uma mensagem de teste para verificar se o serviço está funcionando corretamente.",
      user_type: "user",
      is_internal: false
    };

    console.log("📝 Criando feedback de teste...");
    const createdFeedback = await FeedbackSubmissionsService.create(
      testFeedback
    );
    console.log("✅ Feedback criado com sucesso:", createdFeedback);

    // 2. Buscar o feedback criado
    console.log("🔍 Buscando feedback por ID...");
    const foundFeedback = await FeedbackSubmissionsService.getById(
      createdFeedback.id
    );
    console.log("✅ Feedback encontrado:", foundFeedback);

    // 3. Listar feedbacks do usuário
    console.log("📋 Listando feedbacks do usuário...");
    const userFeedbacks = await FeedbackSubmissionsService.listUserFeedbacks();
    console.log("✅ Feedbacks do usuário:", userFeedbacks);

    // 4. Atualizar status
    console.log("🔄 Atualizando status...");
    const updatedFeedback = await FeedbackSubmissionsService.updateStatus(
      createdFeedback.id,
      "reviewed"
    );
    console.log("✅ Status atualizado:", updatedFeedback);

    // 5. Buscar estatísticas
    console.log("📊 Buscando estatísticas...");
    const stats = await FeedbackSubmissionsService.getStats();
    console.log("✅ Estatísticas:", stats);

    // 6. Listar com filtros
    console.log("🔍 Buscando com filtros...");
    const filteredFeedbacks = await FeedbackSubmissionsService.list({
      status: "reviewed",
      category: "Melhoria do Produto"
    });
    console.log("✅ Feedbacks filtrados:", filteredFeedbacks);

    console.log("🎉 Todos os testes passaram com sucesso!");
    return true;
  } catch (error) {
    console.error("❌ Erro durante os testes:", error);
    return false;
  }
};

// Função para limpar dados de teste (opcional)
export const cleanupTestData = async () => {
  try {
    console.log("🧹 Limpando dados de teste...");

    // Buscar feedbacks de teste
    const testFeedbacks = await FeedbackSubmissionsService.list({
      search: "Teste do serviço"
    });

    // Deletar feedbacks de teste
    for (const feedback of testFeedbacks.data) {
      if (feedback.subject.includes("Teste")) {
        await FeedbackSubmissionsService.delete(feedback.id);
        console.log(`🗑️ Feedback de teste deletado: ${feedback.id}`);
      }
    }

    console.log("✅ Limpeza concluída!");
  } catch (error) {
    console.error("❌ Erro durante a limpeza:", error);
  }
};

// Para usar no console do navegador:
// testFeedbackService();
// cleanupTestData();
