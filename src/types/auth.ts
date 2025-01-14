export interface UserData {
    fullName: string;
    email: string;
    phoneNumber?: string;
    createdAt: string;
}

export interface AuthError {
    code: string;
    message: string;
} 