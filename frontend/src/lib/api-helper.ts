/*
Used to connect the Frontend and Backend
*/

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface ApiResponse<T> {
    data?: T;
    error?: string;
    message?: string;
}

function handleUnauthorized() {
    if (typeof window === "undefined") return;

    localStorage.removeItem("token");

    if (window.location.pathname !== "/") {
        window.location.href = "/";
    }
}

export async function ApiCall<T>(
    endpoint: string,
    options?: RequestInit
): Promise<ApiResponse<T>> {
    try {
        const url = `${API_BASE_URL}${endpoint}`;
        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                ...options?.headers,
            },
            ...options,
        });

        let data = null;
        try {
            const text = await response.text();
            data = text ? JSON.parse(text) : null;
        } catch {
            data = null;
        }

        if (response.status === 401) {
            handleUnauthorized();

            return {
                error: "Your session expired. Please log in again.",
            };
        }

        if (!response.ok) {
            return {
                error: data?.error || `API Error: ${response.status}`,
            };
        }

        return { data };
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "Unknown error occurred",
        };
    }
}

// Retrieves token from localStorage for authenticated requests
function getAuthHeaders(): Record<string, string> {
    if (typeof window === "undefined") return {};
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function GetRequest<T>(endpoint: string): Promise<ApiResponse<T>> {
    return ApiCall<T>(endpoint, { method: "GET" });
}

export async function AuthGetRequest<T>(endpoint: string): Promise<ApiResponse<T>> {
    return ApiCall<T>(endpoint, {
        method: "GET",
        headers: getAuthHeaders(),
    });
}

export async function PostRequest<T>(
    endpoint: string,
    data: unknown
): Promise<ApiResponse<T>> {
    return ApiCall<T>(endpoint, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function AuthPostRequest<T>(
    endpoint: string,
    data: unknown
): Promise<ApiResponse<T>> {
    return ApiCall<T>(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
}

export async function PutRequest<T>(
    endpoint: string,
    data: unknown
): Promise<ApiResponse<T>> {
    return ApiCall<T>(endpoint, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
}

export async function DeleteRequest<T>(endpoint: string): Promise<ApiResponse<T>> {
    return ApiCall<T>(endpoint, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
}