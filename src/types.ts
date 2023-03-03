export interface Result {
    id: number,
    name: string,
    description: string,
    strangers_count: string,
    html_url: string,
    language: string
}

export interface ApiResponse {
    items: Result[],
    total_count: number
}