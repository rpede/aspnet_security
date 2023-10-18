export interface User {
    id: number,
    fullName: string,
    email: string,
    avatarUrl: string | null
    isAdmin: boolean
}

export const data = {
    id: 1,
    fullName: "Joe Doe",
    email: "test@example.com",
    avatarUrl: null,
    isAdmin: true
} as User;