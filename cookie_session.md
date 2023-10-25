# Cookie with Session ID

A cookie is simply a small block of data that can be set by the web server.
It is then automatically included by the browser in future HTTP requests.

Cookies can be used to track the browser across different sites.
That is why EU made a law forcing site to ask people for consent before storing
such of cookies.

Cookies are also often also used for session management.
It works by storing a hard-to-guess ID in a cookie.
During login - the ID gets associated with information about the user on the
backend.
It allows the backend to keep track of the user because the browser
automatically attaches the cookie to future requests.

### Same-origin policy

Cookies are only send to the same origin for which they were set.

The origin of the ASP.NET web server is `http://localhost:5000` and Angular
development server is `http://localhost:4200`.
The ports are different meaning they have different origins and therefore don't
share cookies.

This can be fixed by proxy request through angular-dev server to backend.
That way the web browser will only thing it is talking to one web server and
therefore attach cookies.

It also means that instead of calling the full URLs like
`http://localhost:5000/api/users` in frontend code, we should call `/api/users`
instead.
Your web browser knows that requests for then shortened URL (known as path)
should go to the same origin for which the page was initially loaded.

Don't worry to much about it, as it's already configured in my starter solution.

You can find information about how to proxy request from angular-dev server
[here](https://angular.io/guide/build#proxying-to-a-backend-server).

### Enable Session

Most web frameworks provide a handy API to manage data associated with a session
ID stored in a cookie.
In ASP.NET this is done using `HttpContext.Session`.

To use sessions we will need to enable it in [Program.cs](api/Program.cs).
Add following towards the top of the file:

```csharp
builder.Services.AddDistributedMemoryCache();

builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromHours(4);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    options.Cookie.SameSite = SameSiteMode.Strict;
});
```

And add this right before `app.UseSpaStaticFiles();`

```typescript
app.UseSession();
```

### Store information in session

Lets implement the extension methods for session information on HttpContext.

Modify [HttpContextExtensions](api/HttpContextExtensions.cs):

```csharp
namespace api;

public static class HttpContextExtensions
{
    public static void SetSessionData(this HttpContext httpContext, SessionData data)
    {
        httpContext.Session.SetInt32(SessionData.Keys.UserId, data.UserId);
        httpContext.Session.SetString(SessionData.Keys.Role, Enum.GetName(data.Role));
    }

    public static SessionData? GetSessionData(this HttpContext httpContext)
    {
        var userId = httpContext.Session.GetInt32(SessionData.Keys.UserId);
        var role = httpContext.Session.GetString(SessionData.Keys.Role);
        if (userId == null || role == null) return null;
        return new SessionData()
        {
            UserId = userId.Value,
            Role = Enum.Parse<Role>(role)
        };
    }
}
```

Here we store all values from the [User](infrastructure/DataModels/User.cs) object in the session.
However most real world applications would only store what is needed to control
access.
Commonly user and role IDs.

### Login with session

Now alter `Login()` in AccountController so user is stored in the session.
Just insert the following before the return statement:

```csharp
HttpContext.SetSessionData(SessionData.FromUser(user));
```

Use the developer tools in your web browser to verify that a session cookie is being
set when you login. Right click the page then Network tab, enter your
credentials and submit.

### Require Authentication

Remember our goal was to prevent the user from accessing the `/users` endpoint without authentication?
We are almost there.

Hurray! We have reached our goal.

To verify:

1. Make sure `[RequireAuthentication]` is added the
[UserController](api/Controllers/UserController.cs) class.
2. Close you browser
3. Open it back up and go to `/users`
4. Notice the error toast from the HTTP interceptor
5. Login and you should be able see `/users`

### Logout

Kinda silly that you have to close the browser to logout right?

You should implement a logout function.

Add a new POST endpoint to your
[AccountController](api/Controllers/AccountController.cs) for log-out, where you
call `HttpContext.Session.Clear();`.

Now add a logout button to a component in your frontend.

```html
<ion-button (click)="logout()">Logout</ion-button>
```

```typescript
  async logout() {
    const url = '/api/account/logout';
    await firstValueFrom(this.http.post<ResponseDto<any>>(url, {}));
    (await this.toastController.create({
      message: 'Successfully logged out',
      duration: 5000,
      color: 'success',
    })).present()
  }
```

## Wrap up

Commit to a different branch so you can compare with the other approach.