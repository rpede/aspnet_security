import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core";
import { switchMap } from "rxjs"

export interface User {
  id: number,
  fullName: string
  avatarUrl?: string
}

export interface Post {
  id: number,
  authorId: number,
  title: string,
  content: string,
}

@Injectable()
export class HomeService {
  constructor(private readonly http: HttpClient) { }

  getUser() {
    return this.http.get<User>("/api/account/whoami");
  }

  getFollowers(id: number) {
    return this.http.get<User[]>(`/api/users/${id}/followers`);
  }

  getFollowing(id: number) {
    return this.http.get<User[]>(`/api/users/${id}/following`);
  }

  getPosts(id: number) {
    return this.http.get<Post[]>(`/api/posts`, { params: { author: id } })
  }
}