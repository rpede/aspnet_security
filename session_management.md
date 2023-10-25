# Session management - Prerequisite

Building on the solution from last week.
Now that we can authenticate users, we need a way to keep them authenticated, so
that the user doesn't have to reauthenticate themselves for each request.
In other words, we need to establish a session.

Our goal is to make such that certain endpoints (such as `/users`) require the
user to be authenticated before they can visit them.

There are two general approaches we can take to accomplish the goal.

- Cookie with Session ID
- Authorization header with a JWT

You should try to implement both approaches to get a feeling for each.

But first we have a bit of common setup to do.

## Frontend Preparation

Lets add an HTTP interceptor to our frontend, so it shows error messages for
calls to the backend.
Otherwise the user will just see a blank screen.

An
[HttpInterceptor](https://angular.io/guide/http-intercept-requests-and-responses)
in Angular is comparable to middleware in ASP.NET.
It allows you to add application wide logic around the request+response cycle of
HTTP.
And is super useful for handling certain cross-cuttings concerns such as
error-handling, logging and authentication.

Add a new file at `frontend/src/interceptors/error-http-interceptors.ts` containing:

```typescript
@Injectable()
export class ErrorHttpInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler):
    Observable<HttpEvent<any>> {
    return next.handle(req);
  }
}
```

It doesn't do anything useful yet, but lets try hooking it up so we can see it
in action.

Find [AppModule](frontend/src/app/app.module.ts) and add the following line to
the providers array:

```typescript
{ provide: HTTP_INTERCEPTORS, useClass: ErrorHttpInterceptor, multi: true },
```

Now we are going to see if it works.
Open one of the pages (`/users` or `/login`) in your web browser.
Then open the developer tools (CTRL+SHIFT+i), click Debugger/Sources tab
(depending on your browser).

Find your interceptor in the file pane (right side). Hint look under Webpack->src->interceptors->error-http-interceptors.ts.
Set a breakpoint at the line that says `return next.handle(req);`.

Refresh and observe that the breakpoint is being reached.

Now that we have verified that our interceptor is working, we can implement the
rest of it.

We will implement the interceptor so it shows HTTP errors as a
[toast](https://ionicframework.com/docs/api/toast).
Add the `ToastController`` to the constructor and implement a method to present
potential errors.

```typescript
  constructor(private readonly toast: ToastController) {}

  private async showError(message: string) {
    return (await this.toast.create({
      message: message,
      duration: 5000,
      color: 'danger'
    })).present()
  }
```

Angular's HTTP client uses something called observables internally.
Conceptually these kinds of observables, you can think of as a mixture between
[Steam](https://docs.oracle.com/javase/8/docs/api/java/util/stream/Stream.html)
and
[ObservableValue](https://docs.oracle.com/javase/8/javafx/api/javafx/beans/value/ObservableValue.html)
in Java/JavaFX.
In that it acts as a sequence that you can chain operations to like a Stream.
And you can notified about changes like ObservableValue.

You can learn more about Observables by reading [RxJS Primer](https://www.learnrxjs.io/learn-rxjs/concepts/rxjs-primer).

Anyway, the only thing we need to concern ourselves with right now, is how to tap into errors.

So replace the intercept method with:

```typescript
  intercept(req: HttpRequest<any>, next: HttpHandler):
    Observable<HttpEvent<any>> {
    return next.handle(req).pipe(catchError(async e => {
      if (e instanceof HttpErrorResponse) {
        this.showError(e.statusText);
      }
      throw e;
    }));
  }
```

`catchError(..)` invokes the given lambda on an error.
We then check if it is an error response from our backend and show it as a toast
using our `showError()` method.

You can remove the error handling from [LoginComponent](frontend/src/app/login.component.ts).
Since it is covered globally by the interceptor.
So `submit()` method becomes:

```typescript
async submit() {
  const url = '/api/account/login';
  var response = await firstValueFrom(this.http.post<ResponseDto<any>>(url, this.form.value));

  (await this.toast.create({
    message: response.messageToClient,
    color: "success",
    duration: 5000
  })).present();
}
```

## Backend Preparation

### Add a role field

To make things slightly more interesting, we will add another field to the
`users` table.

```sql
ALTER TABLE users ADD COLUMN role VARCHAR(10) DEFAULT 'student';
```

And change [User](infrastructure/DataModels/User.cs) to:

```csharp
namespace infrastructure.DataModels;

public class User
{
    public int Id { get; set; }
    public required string FullName { get; set; }
    public required string Email { get; set; }
    public string? AvatarUrl { get; set; }
    public required Role Role { get; set; }
}

public enum Role
{
    Student,
    Teacher,
    Admin
}
```

You also need to add role to all the SQL select statements in
[UserRepository](infrastructure/Repositories/UserRepository.cs).
Here is an example:

```sql
SELECT
    id as {nameof(User.Id)},
    full_name as {nameof(User.FullName)},
    email as {nameof(User.Email)},
    avatar_url as {nameof(User.AvatarUrl)},
    role as {nameof(User.Role)}
FROM users
```

Later on we will use the new role field to determine what a user can access.

### Session data

Add this to **service** project:

```csharp
using infrastructure.DataModels;

namespace service;

public class SessionData
{
    public required int UserId { get; init; }
    public required Role Role { get; init; }

    public static SessionData FromUser(User user)
    {
        return new SessionData { UserId = user.Id, Role = user.Role };
    }

    public static SessionData FromDictionary(Dictionary<string, object> dict)
    {
        return new SessionData { UserId = (int)dict[Keys.UserId], Role = Enum.Parse<Role>((string) dict[Keys.Role]) };
    }

    public Dictionary<string, object> ToDictionary()
    {
        return new Dictionary<string, object> { { Keys.UserId, UserId }, { Keys.Role, Enum.GetName(Role)! } };
    }

    public static class Keys
    {
        public const string UserId = "u";
        public const string Role = "r";
    }
}
```

**SessionData** is the data we are going to store about the user between request,
so we know who they are, and can decide on wether they are authorized for an
action.

Attaching session data to HttpContext allows us to access it in other parts of
our application.

For convenience, lets add some [extension methods](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/extension-methods) to HttpContext for attaching and getting the session data.
Extension methods are really just static methods, but you call them like they
were defined on the target type (target is the type after `this` keyword in
parameters).

Add this to a new file in **api** project.

```csharp
using service;

namespace api;

public static class HttpContextExtensions
{
    public static void SetSessionData(this HttpContext httpContext, SessionData data)
    {
        throw new NotImplementedException();
    }

    public static SessionData? GetSessionData(this HttpContext httpContext)
    {
        throw new NotImplementedException();
    }
}
```

## Protecting endpoint with a filter

And add following to `api/Filters/RequireAuthentication.cs`

```csharp
using System.Security.Authentication;
using Microsoft.AspNetCore.Mvc.Filters;

namespace api.Filters;

public class RequireAuthentication : ActionFilterAttribute
{
    public override void OnActionExecuting(ActionExecutingContext context)
    {
        if (context.HttpContext.GetSessionData() == null) throw new AuthenticationException();
    }
}
```

This filter can be added to controllers or actions to only allow the endpoints
to be access by authenticated users.

Add `[RequireAuthentication]` to
[UserController](api/Controllers/UserController.cs) to protect it.

Maybe you have noticed that there is `/api/account/whoami` endpoint.

Lets implement it:

```csharp
[RequireAuthentication]
[HttpGet]
[Route("/api/account/whoami")]
public ResponseDto WhoAmI()
{
    var data = HttpContext.GetSessionData();
    var user = _service.Get(data);
    return new ResponseDto
    {
        ResponseData = user
    };
}
```

We also need add this to [AccountService](service/AccountService.cs):

```csharp
public User? Get(SessionData data)
{
    return _userRepository.GetById(data.UserId);
}
```

## Up next

That is it for the common setup.

However the implementation isn't finished yet yet. 
You will need to implement either Cookie or JWT based session.

⚠️ Now would be a good time to commit!

That way you can get back to the common starting point and try the other
approach.