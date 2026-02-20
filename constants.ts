export const APP_NAME = "RoomVision AI";
export const GEMINI_MODEL = "gemini-2.5-flash-image"; // Optimized for image editing tasks

export const PROCESSING_STEPS = [
  { id: 'upload', label: 'Analyzing images...', status: 'pending' },
  { id: 'depth', label: 'Estimating room depth & geometry...', status: 'pending' },
  { id: 'segment', label: 'Segmenting furniture object...', status: 'pending' },
  { id: 'perspective', label: 'Calculating scale & perspective...', status: 'pending' },
  { id: 'lighting', label: 'Matching lighting & shadows...', status: 'pending' },
  { id: 'render', label: 'Final high-res rendering...', status: 'pending' },
];
