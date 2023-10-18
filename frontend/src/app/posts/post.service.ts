import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

export interface Post {
    id: number;
    author?: {
        id: number;
        fullName: string;
    };
    title: string;
    content: string;
}

@Injectable()
export class PostService {
    constructor(private readonly http: HttpClient) { }

    getPost(id: number) {
        return this.http.get<Post>(`/api/posts/${id}`);
    }
}