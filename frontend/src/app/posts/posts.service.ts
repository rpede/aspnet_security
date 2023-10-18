import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

export interface Post {
    id: number;
    authorId?: number;
    title: string;
    content: string;
}

@Injectable()
export class PostsService {
    constructor(private readonly http: HttpClient) { }

    getPosts() {
        return this.http.get<Post[]>(`/api/posts`);
    }
}