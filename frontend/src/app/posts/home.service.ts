import {HttpClient} from "@angular/common/http"
import {Injectable} from "@angular/core";
import {combineLatest, map, shareReplay, switchMap} from "rxjs"

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
  constructor(private readonly http: HttpClient) {
  }

  getDate() {
    const user$ = this.getUser().pipe(shareReplay());
    const posts$ = user$.pipe(switchMap(({id}) => this.getPosts(id)), shareReplay());
    const followers$ = user$.pipe(switchMap(({id}) => this.getFollowers(id)), shareReplay());
    const following$ = user$.pipe(switchMap(({id}) => this.getFollowing(id)), shareReplay());
    return combineLatest(posts$, followers$, following$).pipe(map(([posts, followers, following]) => ({
      posts,
      followers,
      following
    })));
  }

  private getUser() {
    return this.http.get<User>("/api/account/whoami");
  }

  private getFollowers(id: number) {
    return this.http.get<User[]>(`/api/users/${id}/followers`);
  }

  private getFollowing(id: number) {
    return this.http.get<User[]>(`/api/users/${id}/following`);
  }

  private getPosts(id: number) {
    return this.http.get<Post[]>(`/api/posts`, {params: {author: id}})
  }
}
