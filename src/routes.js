import { randomUUID } from 'node:crypto';
import { Database } from './database.js';
import {
  mapArrayTasksResponse,
  mapTaskResponse,
} from './mappers/task-response-mapper.js';
import { buildRoutePath } from './utils/build-route-path.js';

const database = new Database();

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { search } = req.query;

      let tasks = database.select('tasks');

      if (search) {
        tasks = tasks.filter(
          (task) =>
            task.title.toLowerCase().includes(search.toLowerCase()) ||
            task.description.toLowerCase().includes(search.toLowerCase())
        );
      }

      const formattedTasks = mapArrayTasksResponse(tasks);

      return res.end(JSON.stringify(formattedTasks));
    },
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { title, description } = req.body;
      if (!title || !description) {
        return res.writeHead(400).end(
          JSON.stringify({
            error: 'Title e description são obrigatórios',
          })
        );
      }

      const tasks = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      database.insert('tasks', tasks);

      const formattedTask = mapTaskResponse(tasks);

      return res.writeHead(201).end(JSON.stringify(formattedTask));
    },
  },

  {
    method: 'POST',
    path: buildRoutePath('/tasks/import'),
    handler: async (req, res) => {
      try {
        if (!req.csv) {
          return res.writeHead(400).end(
            JSON.stringify({
              error: 'CSV content is required',
            })
          );
        }

        const csvTasks = await parseCSV(req.csv);

        if (csvTasks.length === 0) {
          return res.writeHead(400).end(
            JSON.stringify({
              error: 'Nenhuma tarefa válida encontrada no CSV',
            })
          );
        }

        const createdTasks = [];
        const importStartTime = new Date();

        for (const csvTask of csvTasks) {
          const task = {
            id: randomUUID(),
            title: csvTask.title,
            description: csvTask.description,
            completed_at: null,
            created_at: new Date(),
            updated_at: new Date(),
          };

          database.insert('tasks', task);
          createdTasks.push(task);
        }

        const formattedTasks = createdTasks.map((task) =>
          mapTaskResponse(task)
        );

        return res.writeHead(201).end(
          JSON.stringify({
            success: true,
            message: '✅ Importação realizada com sucesso!',
            summary: {
              total_imported: createdTasks.length,
              imported_at: new Date().toLocaleString('pt-BR'),
              processing_time: `${Date.now() - importStartTime.getTime()}ms`,
            },
            data: {
              tasks: formattedTasks,
            },
          })
        );
      } catch (error) {
        return res.writeHead(400).end(
          JSON.stringify({
            success: false,
            error: 'Erro ao processar CSV',
            details: error.message,
            timestamp: new Date().toLocaleString('pt-BR'),
          })
        );
      }
    },
  },

  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params;
      const { title, description } = req.body;

      if (!id) {
        return res.writeHead(400).end(
          JSON.stringify({
            error: 'Id é obrigatório',
          })
        );
      }

      if (!title || !description) {
        return res.writeHead(400).end(
          JSON.stringify({
            error: 'Title e description são obrigatórios',
          })
        );
      }

      const task = database.select('tasks').find((task) => task.id === id);

      if (!task) {
        return res.writeHead(404).end(
          JSON.stringify({
            error: 'Task not found',
          })
        );
      }

      database.update('tasks', id, {
        title,
        description,
        updated_at: new Date(),
      });

      return res.writeHead(204).end();

      // ✅ OPÇÃO 2: Retornar a tarefa atualizada formatada (descomente se preferir)
      // const updatedTask = database.select('tasks').find(t => t.id === id);
      // const formattedTask = mapTaskResponse(updatedTask);
      // return res.writeHead(200).end(JSON.stringify(formattedTask));
    },
  },

  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (req, res) => {
      const { id } = req.params;

      if (!id) {
        return res.writeHead(400).end(
          JSON.stringify({
            error: 'Id é obrigatório',
          })
        );
      }

      const task = database.select('tasks').find((task) => task.id === id);

      if (!task) {
        return res.writeHead(404).end(
          JSON.stringify({
            error: 'Task not found',
          })
        );
      }

      // LÓGICA DE TOGGLE: Marcar/Desmarcar automaticamente
      let completedAtValue;

      if (task.completed_at === null) {
        // Se está null (não concluída) -> marcar como concluída com data atual
        completedAtValue = new Date();
      } else {
        // Se já tem data (concluída) -> desmarcar (voltar para null)
        completedAtValue = null;
      }

      database.update('tasks', id, {
        completed_at: completedAtValue,
        updated_at: new Date(),
      });

      const updatedTask = database.select('tasks').find((t) => t.id === id);
      const formattedTask = mapTaskResponse(updatedTask);
      return res.writeHead(200).end(JSON.stringify(formattedTask));
    },
  },

  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params;

      if (!id) {
        return res.writeHead(400).end(
          JSON.stringify({
            error: 'Id é obrigatório',
          })
        );
      }

      const task = database.select('tasks').find((task) => task.id === id);

      if (!task) {
        return res.writeHead(404).end(
          JSON.stringify({
            error: 'Task not found',
          })
        );
      }

      database.delete('tasks', id);

      return res.writeHead(204).end();
    },
  },
];
