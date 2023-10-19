import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Apollo, gql} from "apollo-angular";
import {map} from "rxjs";

export interface Post {
  id: number;
  author?: {
    id: number;
    fullName: string;
  };
  title: string;
  content: string;
}

interface PostResponse {
  post: Post;
}

const GET_POST = gql`
  query GetPost($id: Int!) {
    post(id: $id) {
      id
      title
      content
    }
  }
`;

@Injectable()
export class PostService {
  constructor(private readonly apollo: Apollo) {
  }

  getPost(id: number) {
    return this.apollo.query<PostResponse>({query: GET_POST, variables: {id}}).pipe(map(d => d.data.post));
  }
}
