export type ResponseOptions<T> = {
  message: string;
  result: T;
  status: number;
};

export type BaseEntity = {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export type Entity<T> = {
  [K in keyof T]: T[K];
} & BaseEntity;

export type Task = Entity<{
  name: string;
  completed: boolean;
}>;
