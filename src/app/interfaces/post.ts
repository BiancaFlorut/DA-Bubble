export interface Post {
    endPoint: string;
    body: (payload: any) => string;
    options: {
        headers: {
            'Content-Type': string;
            responseType: string;
        };
    };
}
