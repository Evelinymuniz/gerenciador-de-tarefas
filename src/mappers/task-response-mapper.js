import { formatDateTime } from '../utils/format-date.js';

export function mapTaskResponse(task) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    completed_at: task.completed_at ? formatDateTime(task.completed_at) : null,
    created_at: formatDateTime(task.created_at),
    updated_at: formatDateTime(task.updated_at)
  };
}

// tasks.map(): Aplica uma função a cada item do array
// mapTaskResponse: Função que será aplicada a cada tarefa

export function mapArrayTasksResponse(tasks) {
  return tasks.map(mapTaskResponse);
}

//O mapper é uma camada de transformação que "traduz" os dados do banco para o formato que o 
// cliente vai receber!