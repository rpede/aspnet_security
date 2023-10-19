# GraphQL

Install dependency into **api** project.

```sh
dotnet add api package HotChocolate.AspNetCore 
```

Install the **GraphQL** plugin in Rider.

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
    public UserGql? Author { get; set; }
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
builder.Services.AddGraphQLServer().AddQueryType<Query>();

// right before `app.MapControllers();`
app.MapGraphQL();
```

Hurray, you created your first GraphQL API.

The library we are using gives us a really cool UI we can use to play around with the API.

It is kinda similar to Swagger in that it is build into our web server.
But it is much nicer interface, more like and Postman.

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

At the moment our API only exposes static data, which isn't super useful.
Let's fix it so we get data from the database instead.

We can fetch dynamic data with resolvers.

[From documentation](https://chillicream.com/docs/hotchocolate/v13/fetching-data/resolvers)
> A resolver is a generic function that fetches data from an arbitrary data source for a particular field.

Add a method to convert query model to GraphQL model in [UserGql](api/GraphQL/Types/UserGql.cs)

```csharp
    [GraphQLIgnore]
    public static UserGql FromQueryModel(UserDetailQueryModel model)
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

Change **QueryGql** class

```csharp
[GraphQLName("Query")]
public class QueryGql
{
    public UserGql? GetMe([Service] UserService service)
    {
        var model = service.GetDetails(id: 1);
        if (model == null) return null;
        return UserGql.FromQueryModel(model);
    }
}
```

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
builder.Services .AddGraphQLServer().AddQueryType<QueryGql>();

// with
builder.Services
    .AddGraphQLServer()
    .AddQueryType<QueryGql>()
    .AddHttpRequestInterceptor<HttpRequestInterceptor>();
```

Change the root query once again [QueryGql](api/GraphQL/Types/QueryGql.cs)

```csharp
[GraphQLName("Query")]
public class QueryGql
{
    public UserGql? GetMe(
        [GlobalState(GlobalStateKeys.Session)] SessionData? session,
        [Service] UserService service
    )
    {
        if (session == null) return null;
        var model = service.GetDetails(session.UserId);
        if (model == null) return null;
        return UserGql.FromQueryModel(model);
    }
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

Lets provide an option to fetch ones own posts.

In [UserGql](./api/GraphQL/Types/UserGql.cs) add:

```csharp
public IEnumerable<PostGql> GetPosts([Service] PostService service)
{
    return service.GetByAuthor(this.Id).Select(PostGql.FromQueryModel);
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

## Challenges

### Optimize heavy data field

The **Content** field of **Post** can contain a lot of data.
Imagine the UI just shows a list of posts with the title then it will be wasteful to fetch **content** from database.

Change the `Content` field on `PostGql` to a resolver function, such that the content will only be queried when actually
needed.

Notice nothing in the GraphQL API have to change, so the frontend is therefor unaffected.