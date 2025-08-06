import fs from 'node:fs/promises';

const databasePath = new URL('./db.json', import.meta.url);

export class Database {
  database = {};

  constructor() {
    fs.readFile(databasePath, 'utf-8')
      .then((data) => {
        this.database = JSON.parse(data);
      })
      .catch(() => {
        this.database = {};
        this.#persist();
      });
  }

  #persist() {
    fs.writeFile(databasePath, JSON.stringify(this.database));
  }

  select(table) {
    const data = this.database[table] ?? [];
    return data;
  }

  insert(table, data) {
    if (Array.isArray(this.database[table])) {
      this.database[table].push(data);
    } else {
      this.database[table] = [data];
    }

    this.#persist();

    return data;
  }

  update(table, id, data) {
    // ✅ Verifica se a tabela existe
    if (!this.database[table]) {
      return false; // Tabela não existe
    }

    const rowIndex = this.database[table].findIndex((row) => row.id === id);

    // ✅ Retorna false em vez de throw error
    if (rowIndex === -1) {
      return false; // Registro não encontrado
    }

    // ✅ Atualiza o registro
    this.database[table][rowIndex] = {
      ...this.database[table][rowIndex],
      ...data,
    };

    this.#persist();

    // ✅ Retorna o registro atualizado
    return this.database[table][rowIndex];
  }

  delete(table, id) {
    // ✅ Verifica se a tabela existe
    if (!this.database[table]) {
      return false; // Tabela não existe
    }

    const rowIndex = this.database[table].findIndex((row) => row.id === id);

    // ✅ Retorna false em vez de throw error
    if (rowIndex === -1) {
      return false; // Registro não encontrado
    }

    // ✅ Remove o registro
    this.database[table].splice(rowIndex, 1);

    this.#persist();

    return true; // Registro removido com sucesso
  }
}
