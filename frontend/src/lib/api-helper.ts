/*
Used to connect the Frontend and Backend
*/

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
console.log("API_BASE_URL:", API_BASE_URL);


interface ApiResponse<T>{
    data?: T;
    error?: string;
    message?: string;
}


export async function ApiCall<T>(
    endpoint: string,
    options?: RequestInit
): Promise<ApiResponse<T>> {
    
    /*
    Sends a fetch request to the Backend Enpoint used in the call
    */
    try{
        const url = `${API_BASE_URL}${endpoint}`;
        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                ...options?.headers,
            },
            ...options,
        });

        let data = null;

        try{
            const text = await response.text();
            data = text ? JSON.parse(text) : null;
        } catch{
            data = null;
        }
        /*
        Checks for an HTTP Request Pass
        Raises error if not
        */
        if(!response.ok) {
            return {
                error: data?.error || `API Error: ${response.status}`,
            };
        }

        return {data};
    } catch(error){
        return {
            error: error instanceof Error ? error.message : "Unknown error occured",
        }
    }
}

/*
Handles GET Requests
*/
export async function GetRequest<T>(
    endpoint: string
): Promise<ApiResponse<T>>{
    return ApiCall<T>(
        endpoint, 
        {method: "GET"}
    )
}

/*
Handles POST Requests
Converts body to JSON String
*/
export async function PostRequest<T>(
    endpoint: string,
    data: any
): Promise<ApiResponse<T>>{
    return ApiCall<T>(
        endpoint, 
        {method: "POST",
        body: JSON.stringify(data),
    })
}