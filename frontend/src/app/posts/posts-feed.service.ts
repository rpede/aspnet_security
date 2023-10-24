import {Injectable} from "@angular/core";
import {Apollo, gql} from "apollo-angular";
import {map} from "rxjs";

export interface Post {
  id: number;
  authorId?: number;
  title: string;
  content: string;
}

interface PostResponse {
  posts: Post[];
}

const GET_POSTS = gql`
  query GetPosts {
    posts {
      id
      authorId
      title
      content
    }
  }
`;

@Injectable()
export class PostsFeedService {
  constructor(private readonly apollo: Apollo) {
  }

  getPosts() {
    return this.apollo.query<PostResponse>({query: GET_POSTS}).pipe(map(x => x.data.posts));
  }
}
