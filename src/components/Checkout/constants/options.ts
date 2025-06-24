// Constantes compartilhadas para padronizar strings em todo o sistema
export const SERVICE_OPTIONS = {
  NONE: "Nenhum - eu vou fornecer o conteúdo",
  LEGACY_NONE: "nenhum - eu vou enviar o conteudo" // Para compatibilidade com dados antigos
} as const;

export const NICHE_OPTIONS = {
  DEFAULT: "Artigo Padrão"
} as const;

// Types para TypeScript
export type ServiceOption =
  (typeof SERVICE_OPTIONS)[keyof typeof SERVICE_OPTIONS];
export type NicheOption = (typeof NICHE_OPTIONS)[keyof typeof NICHE_OPTIONS];
