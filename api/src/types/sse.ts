export type SSEMessageType = 'connected' | 'new_booking' | 'booking_update';

export interface ISSEMessage<TData = unknown> {
  type: SSEMessageType;
  data: TData;
}


