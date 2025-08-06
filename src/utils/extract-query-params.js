export function extractQueryParams(query) {
  return query.substr(1).split('&').reduce((queryParams, param) => {// Extrai os parâmetros de consulta da string de consulta
    const [key, value] = param.split('=')

    queryParams[key] = value

    return queryParams
  }, {})
}
