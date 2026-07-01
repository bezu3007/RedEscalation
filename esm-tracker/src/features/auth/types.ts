// features/auth/types.ts
export interface User {
  id: string | number;
  userName: string;
  email?: string;
  role?: string;
  fullName?: string;
  department?: string;
  branch?: string;
  remark?: string;
  tin?: string;
  personInfo?: any; // For the personInfo from your response
  navigatorList?: any[]; // For navigation data
  accessMatrix?: any[];
  roleActivityList?: any[];
  mobileLicenseDtos?: any[];
  bannerImagePath?: string;
  forcePasswordChange?: boolean;
  passwordConfig?: any;
  botLink?: string;
  // Add any other properties from your response
}

export interface Consignee {
  id?: string | number;
  name?: string;
  tin: string;
  gslType?: number;
}

export interface LoginRequest {
  username: string;
  password: string;
  rememberMe: boolean;
  branch?: string;
  tin?: string;
}

export interface LoginResponse {
  success: boolean;
  user: User;
  message?: string;
  errorType?: number;
}