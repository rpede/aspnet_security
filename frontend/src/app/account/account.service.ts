import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Apollo, gql} from "apollo-angular";
import {map} from "rxjs";
import {CredentialsInput, LoginResult, RegistrationInput, User} from "./account.models";


const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      id
      email
      fullName
      avatarUrl
      isAdmin
    }
  }
`;

const LOGIN_MUTATION = gql`
  mutation Login($input: CredentialsInput!){
    login(input: $input) {
      __typename
      ... on TokenResponse {
        token
      }
      ...on InvalidCredentials {
        message
      }
    }
  }
`

@Injectable()
export class AccountService {
  constructor(
    private readonly http: HttpClient,
    private readonly apollo: Apollo,
  ) {
  }

  getCurrentUser() {
    return this.apollo.query<{ me: User }>({query: GET_CURRENT_USER})
      .pipe(map(d => d.data.me));
  }

  login(value: CredentialsInput) {
    return this.apollo.mutate<{ login: LoginResult }>({
      mutation: LOGIN_MUTATION,
      variables: {input: value}
    }).pipe(map(d => d.data?.login));
  }

  register(value: RegistrationInput) {
    return this.http.post<any>('/api/account/register', value);
  }
}
