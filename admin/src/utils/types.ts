export interface User {
    id: string;
    userId?: string;
    email: string;
    name: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isLoading: boolean;
    error: string | null;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface Field {
    id: string;
    name: string;
    selector: string;
    contentType: 'text' | 'image' | 'link';
    scrapeType: 'product' | 'category';
    createdAt?: string;
    updatedAt?: string;
    [key: string]: any; // Allow dynamic property access
}

export interface Product {
    id: string;
    name: string;
    subtitle?: string;
    category: string;
    price: string;
    status: 'active' | 'pending' | 'inactive';
    lastUpdated?: string;
    [key: string]: any; // For dynamic fields
}
