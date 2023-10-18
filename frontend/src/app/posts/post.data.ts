export interface Post {
    id: number,
    author?: {
        id: number,
        fullName: string,
    },
    title: string,
    content: string
}

export const data = {
    "id": 1,
    "author": {
        "id": 1,
        "fullName": "Joe Doe"
    },
    "title": "My First Post",
    "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Id neque aliquam vestibulum morbi. Auctor neque vitae tempus quam. Diam sit amet nisl suscipit adipiscing. Amet est placerat in egestas erat imperdiet sed euismod nisi. Neque vitae tempus quam pellentesque nec nam aliquam sem et. Malesuada fames ac turpis egestas sed tempus urna et. Velit laoreet id donec ultrices. Ante metus dictum at tempor commodo ullamcorper a lacus vestibulum. Dis parturient montes nascetur ridiculus. A condimentum vitae sapien pellentesque habitant morbi tristique senectus et. Egestas purus viverra accumsan in nisl nisi."
} as Post;