import http from 'node:http';

import { routes } from './routes.js';
import { json } from './middlewares/json.js';
import { extractQueryParams } from './utils/extract-query-params.js';
import { csv } from './middlewares/csv.js';

const server = http.createServer(async (req, res) => {
  const { method, url } = req;
   
  // ✅ Middleware para CSV em rota específica
  if (url === '/tasks/import' && method === 'POST') {
    await csv(req, res);
  } else {
    await json(req, res);
  }

  // Separa a URL da query string
  const [pathname, query] = url.split('?');

  // Procura pela rota
  const route = routes.find((route) => {
    return route.method === method && route.path.test
      ? route.path.test(pathname)
      : route.path === pathname;
  });

  if (route) {
    // Extrai parâmetros se usar buildRoutePath
    if (route.path.test) {
      const routeParams = pathname.match(route.path);
      const { query: queryFromPath, ...params } = routeParams?.groups || {};
      req.params = params;
      req.query = queryFromPath
        ? extractQueryParams(`?${queryFromPath}`)
        : query
        ? extractQueryParams(`?${query}`)
        : {};
    } else {
      req.query = query ? extractQueryParams(`?${query}`) : {};
      req.params = {};
    }

    return route.handler(req, res);
  }

  return res.writeHead(404).end();
});

server.listen(3333, () => {
  console.log('Servidor rodando na porta 3333');
});
