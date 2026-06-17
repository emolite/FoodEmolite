export interface BaseSearchRequest<TSearchParams> {
    page: number;
    pageSize: number;
    sortBy?: string | null;
    asc: boolean;
    searchParams?: TSearchParams | null;
}