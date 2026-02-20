export enum AppState {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface ProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed';
}

export interface GeneratedImageResult {
  imageUrl: string;
  originalRoomUrl: string;
  originalFurnitureUrl: string;
}

export interface RoomDimensions {
  length: string;
  width: string;
  height: string;
  unit: 'ft' | 'm';
}
