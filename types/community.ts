import { Timestamp } from "firebase/firestore";

export interface MediaItemStatus {
    url: string;
    status: 'PENDING' | 'SAFE' | 'REJECTED' | 'ERROR' | 'PROCESSING_VIDEO' | 'UNKNOWN_TYPE' | 'UNCHECKED_VIDEO';
    type: 'image' | 'video' | 'unknown';
}

export interface Discussion {
  id: string;
  title: string;
  category: "learning" | "support";
  authorName: string;
  authorId: string;
  authorInitials: string;
  authorPhotoURL?: string | null;
  createdAt: Timestamp;
  excerpt: string;
  content: string;
  tags: string[];
  likeCount: number;
  replyCount: number;
  likedBy?: string[];
  mediaURLs?: string[];
  mediaStatus?: Record<string, MediaItemStatus['status']>;
  lastUpdatedAt?: Timestamp;
  textModerationStatus?: 'SAFE_TEXT' | 'REJECTED_TEXT' | 'ERROR_TEXT' | 'PENDING_TEXT'; 
  needsReview?: boolean; 
  isHidden?: boolean; 
}

export interface Comment {
  id: string;
  discussionId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  authorPhotoURL?: string | null;
  createdAt: Timestamp;
  likeCount?: number;
  likedBy?: string[];
  lastUpdatedAt?: Timestamp;
  moderationStatus?: 'SAFE_TEXT' | 'REJECTED_TEXT' | 'ERROR_TEXT' | 'PENDING_TEXT'; 
  needsReview?: boolean; 
  isHidden?: boolean; 
}