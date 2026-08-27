// features/auth/api/authApi.ts
import { apiClient } from "@/shared/lib/apiClient";
import type {
  LoginRequest,
  LoginResponse,
  User,
  Consignee,
} from "../types";

const encryptPassword = (clearText: string): string => {
  try {
    return btoa(clearText);
  } catch (error) {
    console.warn("Encryption failed, using fallback:", error);
    return clearText;
  }
};

let _cachedCompany: Consignee | null = null;

export const authApi = {
  getCompany: async (): Promise<Consignee | null> => {
    if (_cachedCompany) {
      return _cachedCompany;
    }

    try {
      const response = await apiClient.get<Consignee[]>("/Consignee/filter?gslType=1");
      const company = response.data && response.data.length > 0 ? response.data[0] : null;
      _cachedCompany = company;
      return company;
    } catch (error: any) {
      console.error("Failed to fetch company:", error);
      return null;
    }
  },

  login: async (body: LoginRequest): Promise<LoginResponse> => {
    const company = await authApi.getCompany();
    if (!company) {
      throw new Error("Failed to get company information. Please try again.");
    }

    const loginData = {
      userName: body.username?.trim(),
      password: body.password,
      branch: body.branch || "3",
      tin: company.tin,
    };

    try {
      const encodedPassword = encodeURIComponent(loginData.password);
      
      const queryParams = new URLSearchParams({
        userName: loginData.userName || '',
        password: encodedPassword,
        tin: loginData.tin,
        consigneeUnit: loginData.branch
      });

      const url = `/SysInitialize/authenticate?${queryParams.toString()}`;
      
      const response = await apiClient.get(url);
      // const role = response.data.data.role;
      if (response.status === 200 && response.data?.success) {
        // The user data might be inside response.data.data.personInfo or response.data.data itself
        const data = response.data.data;
        
        // Try to find user information in different possible locations
        let userData = null;
        
        // Check if the data object has userName directly
        if (data && data.userName) {
          userData = data;
        }
        // Check if personInfo contains user info
        else if (data && data.personInfo && data.personInfo.userName) {
          userData = data.personInfo;
        }
        // Check if data is an array and first element has userName
        else if (Array.isArray(data) && data.length > 0 && data[0].userName) {
          userData = data[0];
        }
        // Check if there's a user property
        else if (data && data.user && data.user.userName) {
          userData = data.user;
        }
        // Check if any property in data has userName
        else if (data) {
          for (const key of Object.keys(data)) {
            if (data[key] && typeof data[key] === 'object' && data[key].userName) {
              userData = data[key];
              break;
            }
          }
        }

        // If we found user data with userName, use it
        if (userData && userData.userName) {
          // Add additional properties
          userData.remark = `${loginData.branch}_${encryptPassword(loginData.password)}`;
          userData.branch = loginData.branch;
          userData.tin = loginData.tin;
          userData.role = response.data.data.role; 

          // Store in localStorage
          localStorage.setItem('ems-user', JSON.stringify(userData));
          localStorage.setItem('ems-login-timestamp', Date.now().toString());
          
          if (body.rememberMe) {
            localStorage.setItem('ems-remember-me', 'true');
          } else {
            localStorage.removeItem('ems-remember-me');
          }

          return {
            success: true,
            user: userData,
            message: response.data.message || "Login successful"
          };
        } else {
          // Try to construct a user from the available data
          
          // If we have personInfo but no userName, try to use it anyway
          if (data && data.personInfo) {
            const personInfo = data.personInfo;
            // Use id or other properties as fallback
            userData = {
              userName: personInfo.fullName || personInfo.name || body.username,
              id: personInfo.id || 'unknown',
              fullName: personInfo.fullName || personInfo.name || body.username,
              role: data.role || 0,
              ...personInfo
            };
            
            // Add additional properties
            userData.remark = `${loginData.branch}_${encryptPassword(loginData.password)}`;
            userData.branch = loginData.branch;
            userData.tin = loginData.tin;
            
            // Store in localStorage
            localStorage.setItem('ems-user', JSON.stringify(userData));
            
            return {
              success: true,
              user: userData,
              message: "Login successful (user constructed from personInfo)"
            };
          }
          
          return {
            success: false,
            user: null as any,
            message: "Invalid response format from server"
          };
        }
      } else {
        return {
          success: false,
          user: null as any,
          message: response.data?.message || "Authentication failed"
        };
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || "Login failed");
    }
  },

  clearCompanyCache: (): void => {
    _cachedCompany = null;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      _cachedCompany = null;
      localStorage.removeItem('ems-user');
      localStorage.removeItem('ems-login-timestamp');
      localStorage.removeItem('ems-remember-me');
      localStorage.removeItem('ems-session-persistent');
    }
  },

  getUserByUsername: async (username: string): Promise<User | null> => {
    try {
      const response = await apiClient.get<User>(`/auth/user/${username}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error("Get user by username error:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch user");
    }
  },
};