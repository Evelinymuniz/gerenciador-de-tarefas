export function parseCSV(csvContent) {
  return new Promise((resolve, reject) => {
    try {
      const lines = csvContent.trim().split('\n');
      
      if (lines.length < 2) {
        return resolve([]);
      }

      // Primeira linha são os headers
      const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
      
      // Verifica se tem as colunas necessárias
      if (!headers.includes('title') || !headers.includes('description')) {
        return reject(new Error('CSV deve conter as colunas "title" e "description"'));
      }

      const tasks = [];

      // Processa cada linha (exceto a primeira que é header)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(',').map(value => value.trim().replace(/"/g, ''));
        
        // Cria objeto com base nos headers
        const task = {};
        headers.forEach((header, index) => {
          task[header] = values[index] || '';
        });

        // Valida se tem title e description
        if (task.title && task.description) {
          tasks.push({
            title: task.title,
            description: task.description
          });
        }
      }

      resolve(tasks);
    } catch (error) {
      reject(error);
    }
  });
}