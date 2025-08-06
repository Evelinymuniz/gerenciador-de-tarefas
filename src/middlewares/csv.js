export async function csv(req, res) {
  const buffers = [];

  for await (const chunk of req) {
    buffers.push(chunk);
  }

  try {
    const fullStreamContent = Buffer.concat(buffers).toString();
    
    // Verifica se o conteúdo parece ser CSV
    if (!fullStreamContent.trim()) {
      req.csv = null;
      return;
    }

    req.csv = fullStreamContent;
  } catch {
    req.csv = null;
  }
}