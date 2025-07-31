 import Badge from "../../ui/badge/Badge";

export function getStatusBadge(status: string) {
  switch (status) {
    case "verificado":
      return <Badge color="success">Verificado</Badge>;
    case "reprovado":
      return <Badge color="error">Reprovado</Badge>;
    case "em_analise":
    default:
      return <Badge color="warning">Em análise</Badge>;
  }
}
