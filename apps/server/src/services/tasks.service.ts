import { tasksRepository } from '@/repositories/tasks.repository.js';

class TasksService {
  constructor(private repo = tasksRepository) {}

  async findAll() {
    return await this.repo.findAll();
  }

  async findById(id: string) {
    return await this.repo.findById(id);
  }

  async create(data: { name: string }) {
    return await this.repo.create(data);
  }

  async update(id: string, data: Partial<{ name: string; completed: boolean }>) {
    return await this.repo.update(id, data);
  }

  async delete(id: string) {
    return await this.repo.delete(id);
  }
}

export const tasksService = new TasksService();
