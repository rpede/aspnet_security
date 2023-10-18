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

export const data = {
  User: {
    posts: [
      {
        "id": 1,
        "authorId": 2,
        "title": "My First Post",
        "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Id neque aliquam vestibulum morbi. Auctor neque vitae tempus quam. Diam sit amet nisl suscipit adipiscing. Amet est placerat in egestas erat imperdiet sed euismod nisi. Neque vitae tempus quam pellentesque nec nam aliquam sem et. Malesuada fames ac turpis egestas sed tempus urna et. Velit laoreet id donec ultrices. Ante metus dictum at tempor commodo ullamcorper a lacus vestibulum. Dis parturient montes nascetur ridiculus. A condimentum vitae sapien pellentesque habitant morbi tristique senectus et. Egestas purus viverra accumsan in nisl nisi."
      },
      {
        "id": 2,
        "authorId": 2,
        "title": "Another post",
        "content": "Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Mattis ullamcorper velit sed ullamcorper morbi. Nec sagittis aliquam malesuada bibendum arcu vitae elementum. Enim nulla aliquet porttitor lacus. Massa sed elementum tempus egestas sed sed risus. Dignissim diam quis enim lobortis scelerisque fermentum. Magna sit amet purus gravida quis blandit turpis cursus. Semper viverra nam libero justo laoreet sit amet cursus sit. Maecenas pharetra convallis posuere morbi leo urna. Quis eleifend quam adipiscing vitae proin sagittis nisl rhoncus. At urna condimentum mattis pellentesque id nibh tortor. Pharetra vel turpis nunc eget. Est pellentesque elit ullamcorper dignissim. Rhoncus dolor purus non enim praesent elementum facilisis. Ligula ullamcorper malesuada proin libero nunc consequat interdum varius sit."
      },
    ] as Post[],
    postCount: 2,
    followers: [
      {
        "id": 3,
        "fullName": "Dorie Lysaght",
        "avatarUrl": "https://robohash.org/eligendiquopossimus.png?size=50x50&set=set1"
      },
      {
        "id": 4,
        "fullName": "Jessey Burris",
        "avatarUrl": "https://robohash.org/estassumendamaiores.png?size=50x50&set=set1"
      },
      {
        "id": 5,
        "fullName": "Zacherie MacAughtrie",
        "avatarUrl": "https://robohash.org/natusetminus.png?size=50x50&set=set1"
      }
    ] as User[],
    followerCount: 3,
    following: [
      {
        "id": 3,
        "fullName": "Dorie Lysaght",
        "avatarUrl": "https://robohash.org/eligendiquopossimus.png?size=50x50&set=set1"
      }
    ] as User[],
    followingCount: 1,
  }
}
