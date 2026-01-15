export const QUEUES = {
  CONTACTS: 'contacts',
  DOCUMENTS: 'documents',
} as const;

export type QueueName = typeof QUEUES[keyof typeof QUEUES];