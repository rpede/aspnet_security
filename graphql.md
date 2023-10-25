# GraphQL

Install the **GraphQL** plugin in Rider.

## Backend

Install dependency into **api** project.

```sh
dotnet add api package HotChocolate.AspNetCore 
```

### Basic API with static data

Create some types:

```csharp
// api/GraphQL/Types/QueryGql.cs
[GraphQLName("Query")]
public class QueryGql
{
    public UserGql GetMe() =>
        new UserGql()
        {
            Id = 1,
            FullName = "Joe Doe",
            Email = "test@example.com",
            AvatarUrl = "https://robohash.org/test@example.com",
            IsAdmin = true,
        };
}

// api/GraphQL/Types/UserGql.cs
[GraphQLName("User")]
public class UserGql
{
    public int Id { get; set; }
    public string FullName { get; set; }
    public string Email { get; set; }
    public string? AvatarUrl { get; set; }
    public required bool IsAdmin { get; set; }
}

// api/GraphQL/Types/PostGql.cs
[GraphQLName("Post")]
public class PostGql
{
    public int Id { get; set; }
    public int? AuthorId { get; set; }
    public string Title { get; set; }
    public string Content { get; set; }
}
```

The **Query** class is the root of our GraphQL API.
Everything in our API is exposed through it.

`[GraphQLName("something")` allow us to specify the name for a field or class in GraphQL API.
I use **Gql** postfix for all GraphQL types tell apart what is exposed.

Now we just need to hook the **Query** class up to ASP.NET and we can begin to play around with our new GraphQL API.

Open [Program.cs](api/Program.cs) and add;

```csharp
// right before `builder.Services.AddControllers();`
builder.Services.AddGraphQLServer().AddQueryType<QueryGql>();

// right before `app.MapControllers();`
app.MapGraphQL();
```

Hurray, you created your first GraphQL API.

The library we are using gives us a really cool UI we can use to play around with the API.

It is kinda similar to Swagger in that it is build into our web server.
But it is much nicer interface, more like and Postman.

I will refer to it as GraphQL IDE.

Open [http://localhost:5000/graphql/](http://localhost:5000/graphql/)

Click *Create Document* and type:

```graphql
{
    me {
        id
        fullName
        avatarUrl
    }
}
```

### Query with dynamic data

At the moment our API only exposes static data, which isn't super useful.
Let's fix it so we get data from the database instead.

We can fetch dynamic data with resolvers.

[From documentation:](https://chillicream.com/docs/hotchocolate/v13/fetching-data/resolvers)
> A resolver is a generic function that fetches data from an arbitrary data source for a particular field.

Lets a add a resolver function [QueryGql](api/GraphQL/Types/QueryGql.cs) that fetches all posts

```csharp
public IEnumerable<PostGql> GetPosts([Service] PostService service)
{
    return service.GetAll().Select(PostGql.FromModel);
}
```

We also need a way to convert between the Post data-model and PostGql.
Lets add it [PostGql](api/GraphQL/Types/PostGql.cs):

```csharp
[GraphQLIgnore]
public static PostGql FromModel(Post model)
{
    return new PostGql()
    {
        Id = model.Id,
        AuthorId = model.AuthorId,
        Title = model.Title,
        Content = model.Content
    };
}
```

Try it out in GraphQL IDE;

```graphql
{
    posts {
        id
        authorId
        title
        content
    }
}
```

### Using Session

To implement `GetMe()` top-level resolver with dynamic data, we need to information from session.

Add a method to convert query model to GraphQL model in [UserGql](api/GraphQL/Types/UserGql.cs)

```csharp
[GraphQLIgnore]
public static UserGql FromModel(User model)
{
    return new UserGql()
    {
        Id = model.Id,
        FullName = model.FullName,
        Email = model.Email,
        AvatarUrl = model.AvatarUrl,
        IsAdmin = model.IsAdmin,
    };
}
```

`[GraphQLIgnore]` just means that the method won't be part of the schema.

Change the method in [QueryGql](api/GraphQL/Types/QueryGql.cs):

```csharp
public UserGql? GetMe([Service] UserService service)
{
    var model = service.GetById(id: 1);
    if (model == null) return null;
    return UserGql.FromModel(model);
}
```

Restart .NET project and try in GraphQL IDE.

Okay, cool. We are now fetching data from the database.
However the user ID is hardcoded.
It would be cool if we could get ID from JWT based session instead.

ChilliCream got a feature called **Global State** which allows us to share a piece of data across all resolvers for a
single
query.
And we can use an **interceptor** to add data from HttpContext to Global State.

```csharp
// api/GraphQL/GlobalStateKeys.cs
public static class GlobalStateKeys
{
    public const string Session = "Session";
}

// api/GraphQL/HttpRequestInterceptor.cs
public class HttpRequestInterceptor : DefaultHttpRequestInterceptor
{
    public override ValueTask OnCreateAsync(HttpContext context,
        IRequestExecutor requestExecutor, IQueryRequestBuilder requestBuilder,
        CancellationToken cancellationToken)
    {
        var session = context.GetSessionData();
        requestBuilder.SetGlobalState(GlobalStateKeys.Session, session);

        return base.OnCreateAsync(context, requestExecutor, requestBuilder, cancellationToken);
    }
}
```

Attach the interceptor in [Program.cs](api/Program.cs)

```csharp
// replace 
builder.Services.AddGraphQLServer().AddQueryType<QueryGql>();

// with
builder.Services
    .AddGraphQLServer()
    .AddQueryType<QueryGql>()
    .AddHttpRequestInterceptor<HttpRequestInterceptor>();
```

Change the root query once again [QueryGql](api/GraphQL/Types/QueryGql.cs)

```csharp
public UserGql? GetMe(
    [GlobalState(GlobalStateKeys.Session)] SessionData? session,
    [Service] UserService service
)
{
    if (session == null) return null;
    var model = service.GetById(session.UserId);
    if (model == null) return null;
    return UserGql.FromModel(model);
}
```

To test it out. Login with swagger [http://localhost:5000/swagger/index.html](http://localhost:5000/swagger/index.html)

```json
{
  "email": "test@example.com",
  "password": "testtest"
}
```

Copy JWT from response.

Goto [http://localhost:5000/graphql/](http://localhost:5000/graphql/).
In the bottom of the page add a HTTP header with the JWT like this:

| Name | Value |
|------|-------|
| Authorization | Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1IjoxLCJhIjp0cnVlLCJuYmYiOjE2OTc3MTA1OTgsImV4cCI6MTY5NzcyNDk5OCwiaWF0IjoxNjk3NzEwNTk4LCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjUwMDAiLCJhdWQiOiJodHRwOi8vbG9jYWxob3N0OjUwMDAifQ.bcJpc1kRB5Baav-0shgncM-GoZ7BTDgTphGOhBHQZIbtvaM9w5H3YXNf9C8AVPbQZBTPD8g11ICe85MPdFoUog |

Execute the query

```graphql
{
    me {
        id
        fullName
        avatarUrl
    }
}
```

Lets also provide an option to fetch ones own posts.

In [UserGql](./api/GraphQL/Types/UserGql.cs) add:

```csharp
public IEnumerable<PostGql> GetPosts([Service] PostService service)
{
    return service.GetByAuthor(this.Id).Select(PostGql.FromModel);
}
```

Try to include posts in the query

```graphql
{
    me {
        id
        fullName
        avatarUrl
        posts {
            id,
            title,
            content
        }
    }
}
```

### Query inputs

It is also possible to provide input to resolver functions.

Add to [QueryGql](api/GraphQL/Types/QueryGql.cs);

```csharp
public PostGql? GetPost([Service] PostService service, int id)
{
    var model = service.GetById(id);
    if (model == null) return null;
    return PostGql.FromModel(model);
}
```

Query with:

```graphql
query GetPost($id: Int!) {
    post(id: $id) {
        id
        title
        content
    }
}
```

`$id` is called variable in GraphQL, but it serves the same purpose as parameters in your Dapper+SQL.

You can set a value for in the the bottom pane of GraphQL IDE.

```json
{
  "id": 1
}
```

Note that GraphQL variables is just a JSON document.

### Mutation and union types

All state changes in a GraphQL API is done with mutations.

We could start writing one for login so we don't need Swagger anymore.

Before we write the mutation we need some types for input and result.

```csharp
// api/GraphQL/Types/LoginTypes.cs
[GraphQLName("Credentials")]
public class CredentialsGql
{
    public string Email { get; set; }
    public string Password { get; set; }

    [GraphQLIgnore]
    public LoginCommandModel ToModel() => new() { Email = Email, Password = Password };
}

[UnionType("LoginResult")]
public interface ILoginResultGql { }

[GraphQLName("TokenResponse")]
public class TokenResultGql : ILoginResultGql
{
    public string Token { get; set; }
}

[GraphQLName("InvalidCredentials")]
public class InvalidCredentialsGql : ILoginResultGql
{
    public string Message { get; set; }
}
```

We will be using a feature called Union type.
It basically means that the result from login mutation can be TokenResponse or InvalidCredentials.

Now for the mutation:

```csharp
// api/GraphQL/Types/MutationGql.cs
    
[GraphQLName("Mutation")]
public class MutationGql
{
    public ILoginResultGql Login(CredentialsGql input, [Service] AccountService accountService,
        [Service] JwtService jwtService)
    {
        var user = accountService.Authenticate(input.ToModel());
        if (user == null) return new InvalidCredentialsGql { Message = "Invalid credentials" };
        var session = SessionData.FromUser(user);
        var token = jwtService.IssueToken(session);
        return new TokenResultGql { Token = token };
    }
}
```

Notice how the mutation class looks a lot like the query class.
The only difference is just the convention that only mutations make changes.

Also notice that ILoginResultGql which is just an interface.
Because the concrete return types has to be part of the schema, we need to tell the framework about them.

In [Program.cs](api/Program.cs), change to:

```csharp
builder.Services
    .AddGraphQLServer()
    .AddQueryType<QueryGql>()
    .AddMutationType<MutationGql>()
    .AddType<TokenResultGql>()
    .AddType<InvalidCredentialsGql>()
    .AddHttpRequestInterceptor<HttpRequestInterceptor>();
```

Note that we just keep chaining calls to `AddGraphQLServer()` for all the types it needs to know about to build our API.

In GraphQL IDE:

```graphql
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
```

Test with the variables:

```json
{
  "input": {
    "email": "test@example.com",
    "password": "testtest"
  }
}
```

`__typename` just includes the name of the type we get back.
Useful when the frontend needs to tell them apart.

Try with different credentials and observe the return type change.

## Frontend

Initial setup described here is based
on [Apollo Angular - Get Started](https://the-guild.dev/graphql/apollo-angular/docs/get-started).

```sh
cd frontend
npm run ng add apollo-angular
```

For URL type `/graphql`

Add the `/graphql` endpoint to [proxy.conf.json](frontend/src/proxy.conf.json).
Note: Keep `/api` endpoint.

```json
{
  "/graphql": {
    "target": "http://localhost:5000",
    "secure": false
  }
}
```

Change [PostsFeedService](frontend/src/app/posts/posts-feed.service.ts) to:

```typescript
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
```

```sh
npm start
```

Go to [http://localhost:4200/posts](http://localhost:4200/posts), open developer tools in browser.
Observe that the posts are now loaded through `/graphql` endpoint.

## Challenges

### 1. Authors

On the posts feed page, it would be nice if one could see the the author of posts.

Add a resolver method to [PostGql](api/GraphQL/Types/PostGql.cs) and fill in the implementation.

```csharp
    public UserGql? GetAuthor([Service] UserService service)
    {
        // TODO your implementation here
    }
```

Then update the frontend to show the author.

### 2. Optimize heavy data field

The **Content** field of **Post** can contain a lot of data.
Imagine the UI just shows a list of posts with the title then it will be wasteful to fetch **content** from database.

Change the `Content` field on `PostGql` to a resolver function, such that the content will only be queried when actually
needed.

Notice nothing in the GraphQL API have to change, so the frontend is therefor unaffected.

### 3. Followers

Since our blog platform is trying to be the next big thing in social media, it is very important that our users can
always keep track of who they follow and who is following them.

Add resolver methods for **Followers** and **Following** to [UserGql](api/GraphQL/Types/UserGql.cs).

You can use [FollowService](service/Services/FollowService.cs) to query the database.
But you will need change the response type of `GetFollowers` and `GetFollowing` to the data-model, then convert to
UserGql in the resolver methods.

Update [HomeService](frontend/src/app/posts/home.service.ts)
and [HomeComponent](frontend/src/app/posts/home.component.ts) in frontend to use GraphQL to fetch data.
See if you can do it with just one query.

### 4. Login and Register with mutations

On the frontend change login method in [AccountService](frontend/src/app/account/account.service.ts) to use the login
mutation.

Do the same for register.
Remember there is no register mutation in the backend yet, so you will also have to create
it.

### 5. Data loader

If you make the following GraphQL query:

```graphql
{
    posts {
        title
        author {
            fullName
        }
    }
}
```

How many database queries will be execute?

I can't tell if you answered correct, since I'm just a text document.
But the real answer is N+1.
One query to get all posts.
Then a new query for each author of a post.

As you can tell, that can quickly become a lot of queries.
Which will slaughter performance.

The solution is [data loaders](https://chillicream.com/docs/hotchocolate/v13/fetching-data/dataloader)!

Read the documentation.
Implement a data loader to solve the problem.

### 6. Lazy Loading

HomeComponent loads all data immediately.
But what data gets shown depends on the selected [segment](https://ionicframework.com/docs/api/segment).

Can you change it so that it only loads the data when needed?

To solve the challenge you will need:

- React to `(ionChange)` events on `ion-segments`
- Extend the GraphQL API with resolver methods for counts of posts, followers and following.
- Execute a query for the counts on initialization of HomeComponent.
- Execute queries as needed to fetch additional data when the shown segment change.