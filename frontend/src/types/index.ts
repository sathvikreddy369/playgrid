export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'GUEST' | 'PLAYER' | 'ORGANIZER' | 'ADMIN';
  isBlocked: boolean;
  reputation?: number;
  profile?: UserProfile;
  _count?: {
    posts?: number;
    matchesCreated?: number;
  };
}

export interface UserProfile {
  id: string;
  userId: string;
  bio?: string;
  avatarUrl?: string;
  location?: string;
  sports?: string[];
}

export interface MatchComment {
  id: string;
  matchId: string;
  userId: string;
  content: string;
  parentId?: string;
  isEdited?: boolean;
  createdAt: string;
  updatedAt?: string;
  user: {
    name: string;
    profile?: {
      avatarUrl?: string;
    };
  };
  replies?: MatchComment[];
}

export interface MatchReview {
  id: string;
  matchId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user?: {
    name: string;
    profile?: {
      avatarUrl?: string;
    };
  };
}

export interface Match {
  id: string;
  title: string;
  sport: string;
  date: string;
  location: string;
  latitude?: number;
  longitude?: number;
  maxPlayers: number;
  costPerPerson?: number;
  skillLevel?: string;
  matchType?: 'COMPETITIVE' | 'CASUAL' | 'MEETUP' | 'PRACTICE' | 'TOURNAMENT' | 'TRAINING';
  status: 'OPEN' | 'FULL' | 'ONGOING' | 'COMPLETED' | 'ARCHIVED' | 'CANCELLED' | 'EXPIRED';
  creatorId: string;
  communityId?: string;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    name: string;
    profile?: {
      avatarUrl?: string;
    };
  };
  community?: {
    id: string;
    name: string;
  };
  players: MatchPlayer[];
  comments: MatchComment[];
  reviews?: MatchReview[];
  _count?: {
    players: number;
  };
}

export interface MatchPlayer {
  id: string;
  matchId: string;
  userId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ATTENDED' | 'WITHDRAWN' | 'KICKED' | 'WAITLISTED';
  performanceRating?: number;
  user?: User;
}

export interface CommunityMember {
  id: string;
  userId: string;
  communityId: string;
  role: 'OWNER' | 'ADMIN' | 'MODERATOR' | 'MEMBER';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'BANNED';
  joinedAt: string;
  user?: User;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  rules?: string[];
  coverImage?: string;
  avatarUrl?: string;
  sports?: string[];
  tags?: string[];
  location?: string;
  primaryVenueId?: string;
  privacy: 'PUBLIC' | 'PRIVATE';
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner?: User;
  primaryVenue?: Venue;
  members?: CommunityMember[];
  _count?: {
    members: number;
    matches: number;
  };
}

export interface Venue {
  id: string;
  name: string;
  location: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  latitude?: number;
  longitude?: number;
  description?: string;
  operatingHours?: Record<string, string>;
  contactEmail?: string;
  website?: string;
  contactPhone?: string;
  pricing?: string;
  amenities?: string[];
  sports?: string[];
  photos?: string[];
  ownerId: string;
  owner?: User;
  matches?: Match[];
  _count?: {
    reviews: number;
    matches: number;
  };
}

export interface Report {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  status: 'PENDING' | 'REVIEWED' | 'DISMISSED' | 'ACTION_TAKEN';
  submitterId: string;
  submitter?: User;
  createdAt: string;
}

export interface Post {
  id: string;
  content: string;
  type: string;
  authorId: string;
  author?: User;
  createdAt: string;
  _count?: {
    likes?: number;
    replies?: number;
  };
}
