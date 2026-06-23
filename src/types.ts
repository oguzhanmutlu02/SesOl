export type RequestCategory = 'Ders Notu' | 'Kitap' | 'Makale' | 'Günlük Hayat' | 'Diğer';
export type RequestType = 'vocal_reading' | 'image_description' | 'sign_language';
export type RequestStatus = 'pending' | 'completed';

export interface AccessibleRequest {
  id: string;
  title: string;
  description: string;
  category: RequestCategory;
  requestType: RequestType;
  contentBody: string; // The text to be read or description of the image/object
  imageUrl?: string;    // If request type is image description
  urgency: 'normal' | 'high';
  submittedBy: string;
  submittedAt: string;
  status: RequestStatus;
  completedAt?: string;
  completedBy?: string;
  audioUrl?: string; // Finished audio link (or data URL from browser recording)
  recordings?: {
    id: string;
    volunteerName: string;
    audioUrl: string;
    createdAt: string;
  }[];
}

export interface LibraryItem {
  id: string;
  title: string;
  description: string;
  category: RequestCategory;
  itemType: 'sesli_kitap' | 'betimleme' | 'sesli_makale' | 'isaret_dili';
  narrator: string;
  audioUrl: string;       // Preloaded or dynamic recorded URL
  textBody?: string;      // Backing text content or transcripts
  duration: string;       // e.g. "01:45"
  views: number;
  likes: number;
  createdAt: string;
}

export type AccessibilityTheme = 'standard' | 'high-contrast-dark' | 'yellow-on-black' | 'cream-soft';
export type ZoomLevel = 'normal' | 'large' | 'extra-large';

export interface AccessibilitySettings {
  zoomLevel: ZoomLevel;
  theme: AccessibilityTheme;
  dyslexicFont: boolean;
  readOnHover: boolean;
  narratorVolume: number;
  narratorSpeed: number;
}

export interface VoiceCommandHelp {
  command: string;
  description: string;
}
