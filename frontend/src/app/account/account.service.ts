import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

export interface User {
    id: number;
    fullName: string;
    email: string;
    avatarUrl: string | null;
    isAdmin: boolean;
}

export interface Credentials {
    email: string;
    password: string;
}

export interface Registration {
    fullName: string;
    email: String;
    password: string;
    avatarUrl: string | null,
}

@Injectable()
export class AccountService {
    constructor(private readonly http: HttpClient) { }

    getCurrentUser() {
        return this.http.get<User>('/api/account/whoami');
    }

    login(value: Credentials) {
        return this.http.post<{ token: string }>('/api/account/login', value);
    }

    register(value: Registration) {
        return this.http.post<any>('/api/account/register', value);
    }
}