// Type definitions for the application

export interface UserResponse {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
  profile?: ProfileResponse;
}

export interface ProfileResponse {
  id: string;
  skills: string[];
  experience: number;
  education?: string;
  location?: string;
}

export interface JobListingResponse {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  description: string;
  requirements: string[];
  source: string;
  publishedDate?: string;
  scrapedAt: string;
}

export interface ApplicationResponse {
  id: string;
  userId: string;
  jobListingId: string;
  status: string;
  coverLetter?: string;
  sentDate?: string;
  responseDate?: string;
  response?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends AuthRequest {
  fullName: string;
}

export interface LoginResponse {
  token: string;
  user: UserResponse;
}

