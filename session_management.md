# Session management

Building on the solution from last week.
Now that we can authenticate users, we need a way to keep them authenticated, so
that the user don't have to reauthenticate themselves for each request.
In other words, we need to establish a session for the user.

Our goal is to make such that certain endpoints (such as `/users`) require the
user to be authenticated before they can visit them.

There are two general approaches to accomplish the goal.

- Cookie with Session ID
- Authorization header with a JWT

You should try to implement both approaches to get a feeling for each.

## Frontend Preparation

However first we should add an HTTP interceptor to our frontend so that it can
show an error message.
Otherwise the user will just see a blank screen.

An
[HttpInterceptor](https://angular.io/guide/http-intercept-requests-and-responses)
in Angular is comparable to middleware in ASP.NET.
It allows you to add application wide logic around the request+response cycle.
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

Event though it doesn't do anything useful yet, but lets try hooking it up so we
can see it in action.

Find [AppModule](frontend/src/app/app.module.ts) and add the following line to the providers array:

```typescript
{ provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
```

Lets test that it works.
Open one of the pages (`/users` or `/login`) in your web browser.
Now open the developer tools (CTRL+SHIFT+i), click Debugger or Sources tab
depending on your browser.

Find your interceptor in the file pane (right side). Hint look under Webpack->src.
Set a breakpoint at the line that says `return next.handle(req);`.

Refresh and observe that the breakpoint is being reached.

Now that we verified that our interceptor is working, we can implement the rest of it.
We will show any HTTP errors in a toast, so lets add the controller to the
constructor and implement a method to present potential errors.

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
It acts as a sequence that you can append operations to (like a Stream), and you
can listen to changes (like ObservableValue).

You can learn more about them by reading [RxJS Primer](https://www.learnrxjs.io/learn-rxjs/concepts/rxjs-primer).

Anyway, the only thing we need to concern ourselves with right now is how to tap into errors.

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

To make things slightly more interesting, lets add another field to the `users`
table.

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

You also need to add role to all the select statements in
[UserRepository](infrastructure/Repositories/UserRepository.cs):

```sql
SELECT
    id as {nameof(User.Id)},
    full_name as {nameof(User.FullName)},
    email as {nameof(User.Email)},
    avatar_url as {nameof(User.AvatarUrl)},
    role as {nameof(User.Role)}
FROM users
```

We will use this role field to determine what the user can access.

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


You might have noticed the `/api/account/whoami` endpoint.

Lets finally implement it so we can use it to verify that our session is
working.

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

And add this to [AccountService]()

```csharp
public User? Get(SessionData data)
{
    return _userRepository.GetById(data.UserId);
}
```

That is it for the common setup.

But application doesn't work yet. 
You will need to implement either JWT or Cookie based session.