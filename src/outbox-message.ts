export interface OutboxMessage {
  id: string;
  destination: string;
  destinationType: 'integration' | 'internal';
  payload: unknown;
}
