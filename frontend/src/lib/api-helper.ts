const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ApiResponse<T> {
    data?: T;
    error?: string;
    message?: string;
}

function handleUnauthorized() {
    if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        window.location.href = "/";
    }
}

async function ApiCall<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {}),
            },
        });

        const text = await response.text();
        const data = text ? JSON.parse(text) : null;

        if (response.status === 401) {
            handleUnauthorized();
            return { error: "Session expired. Please log in again." };
        }

        if (!response.ok) {
            return {
                error:
                    data?.error ||
                    data?.message ||
                    `API Error: ${response.status}`,
            };
        }

        return { data };
    } catch (error) {
        return {
            error:
                error instanceof Error
                    ? error.message
                    : "Something went wrong.",
        };
    }
}

export function getAuthHeaders(): HeadersInit {
    const token =
        typeof window !== "undefined"
            ? localStorage.getItem("token")
            : null;

    if (!token) {
        return {};
    }

    return {
        Authorization: `Bearer ${token}`,
    };
}

export function GetRequest<T>(endpoint: string): Promise<ApiResponse<T>> {
    return ApiCall<T>(endpoint, {
        method: "GET",
    });
}

export function AuthGetRequest<T>(endpoint: string): Promise<ApiResponse<T>> {
    return ApiCall<T>(endpoint, {
        method: "GET",
        headers: {
            ...getAuthHeaders(),
        },
    });
}

export function PostRequest<T>(
    endpoint: string,
    body: unknown
): Promise<ApiResponse<T>> {
    return ApiCall<T>(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
    });
}

export function AuthPostRequest<T>(
    endpoint: string,
    body: unknown
): Promise<ApiResponse<T>> {
    return ApiCall<T>(endpoint, {
        method: "POST",
        headers: {
            ...getAuthHeaders(),
        },
        body: JSON.stringify(body),
    });
}

export function PutRequest<T>(
    endpoint: string,
    body: unknown
): Promise<ApiResponse<T>> {
    return ApiCall<T>(endpoint, {
        method: "PUT",
        headers: {
            ...getAuthHeaders(),
        },
        body: JSON.stringify(body),
    });
}

export function DeleteRequest<T = unknown>(
    endpoint: string
): Promise<ApiResponse<T>> {
    return ApiCall<T>(endpoint, {
        method: "DELETE",
        headers: {
            ...getAuthHeaders(),
        },
    });
}