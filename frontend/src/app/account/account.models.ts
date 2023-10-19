export interface User {
  id: number;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  isAdmin: boolean;
}

export interface RegistrationInput {
  fullName: string;
  email: String;
  password: string;
  avatarUrl: string | null,
}

export interface CredentialsInput {
  email: string;
  password: string;
}

export interface TokenResponse {
  __typename: "TokenResponse";
  token: string;
}

export interface InvalidCredentials {
  __typename: "InvalidCredentials";
  message: string;
}

export type LoginResult = TokenResponse | InvalidCredentials;

