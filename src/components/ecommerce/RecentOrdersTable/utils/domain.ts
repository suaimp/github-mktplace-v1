// Utilitário para extrair domínio raiz de uma URL
export function getDomainFromUrl(url: string): string {
  let cleanUrl = url.replace(/^https?:\/\//, '');
  cleanUrl = cleanUrl.replace(/^www\./, '');
  const match = cleanUrl.match(/^[^\/]+/);
  let domain = match ? match[0] : cleanUrl;
  // Remove tudo após o domínio de topo (.com, .org, .net, etc), inclusive .br e outros sufixos
  domain = domain.replace(/([^.]+\.(com|net|org|gov|edu|info|biz|io|co)(\.[a-z]{2})?)(\..*)?$/, '$1');
  return domain;
}
