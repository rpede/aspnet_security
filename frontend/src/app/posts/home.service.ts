import {Injectable} from "@angular/core";
import {Apollo, gql} from "apollo-angular";
import {map} from "rxjs"

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

export interface DataResponse {
  me: {
    posts: Post[],
    followers: User[],
    following: User[]
  }
}

const GET_DATA = gql`
  query GetData {
    me {
      posts {
        id
        title
        content
      }
      followers {
        id
        fullName
        avatarUrl
      }
      following {
        id
        fullName
        avatarUrl
      }
    }
  }
`;

@Injectable()
export class HomeService {
  constructor(private readonly apollo: Apollo) {
  }

  getDate() {
    return this.apollo.query<DataResponse>({query: GET_DATA}).pipe(map(d => d.data.me));
  }
}
