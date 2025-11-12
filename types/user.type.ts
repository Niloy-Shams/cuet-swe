import { User as FirebaseUser } from 'firebase/auth'

export type UserRole = 'student' | 'teacher' | null;

export interface BaseUser {
  uid: string;
  email: string;
  name: string;
  image: string;
  role: UserRole;
  createdAt: string;
}

export interface Student extends BaseUser {
  role: 'student';
  batch: string;
  department: string;
}

export interface Teacher extends BaseUser {
  role: 'teacher';
  department: string;
}

export type AppUser = Student | Teacher;

export interface AuthUser {
  firebaseUser: FirebaseUser;
  userData: AppUser | null;
}