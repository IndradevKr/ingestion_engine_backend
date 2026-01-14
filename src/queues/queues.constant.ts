export const QUEUES = {
  CONTACTS: 'contacts',
} as const;

export type QueueName = typeof QUEUES[keyof typeof QUEUES];