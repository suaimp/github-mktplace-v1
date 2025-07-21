// Função para converter ISO para datetime-local
export function toDateTimeLocal(value?: string | null): string {
  if (!value) return '';
  // Remove o 'Z' se existir e pega só até os minutos
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  // Ajusta para o fuso local
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60000);
  return localDate.toISOString().slice(0, 16);
} 