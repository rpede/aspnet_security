# JWT Management

Implementing authorization with bearer tokens have been widely adopted in newer time.
Tokens in this context often refer to JWT, though not always the case.

The token is send to the server in a HTTP header like this:

```txt
Authorization: Bearer <token>
```

A JWT has a payload part containing information that can be used to make decisions on whether to authorize a request.
It also has a signature protecting from the payload from tampering.

A signature is basically just a hash over the payload and a secret.
Only server knows the secret, meaning that only it can sign and verify the signature.

**Note:** payload of a JWT is just a base64 encoded JSON object.
Everybody can decode the payload.
It is NOT encrypted.
Only protected from tampering.

Since JWT can contain information about users, we don't need any server side state to identify the user.

Unlike cookies - bearer tokens are not send automatically by the web browser to the server.
Client side JavaScript is need to send the bearer token with requests.

The main advantage of bearer token with JWT is that we use them across origins.

As an example a company could centralize authentication on a server at `auth.example.com`.
Employee training is available at `moodle.example.com`.
Payroll system is only available on internal network at `payroll.example.local`.

## Server implementation

First we need to add a package for working with JWT.
Even though JWT are pretty simple in concept, its nice to delegate
encoding/decoding, signing, verification, validity period etc. to a library.

```sh
dotnet add service package System.IdentityModel.Tokens.Jwt
```

### Dependency injection

There are couple of options for creating and signing token that might want to
make configurable.
So that we can use different values in development vs deployed.
Could perhaps also be useful to be able to change after deployment.

So lets create a class for it. Somewhere in **service** project put:

```csharp
public class JwtOptions
{
    public required byte[] Secret { get; init; }
    public required TimeSpan Lifetime { get; init; }
    public string? Address { get; set; }
}
```

We are also going to create a class to help with creating and validating JWTs:

```csharp
public class JwtService
{
    private readonly JwtOptions _options;

    public JwtHelper(JwtOptions options)
    {
        _options = options;
    }

    public string IssueToken(SessionData data)
    {
        throw new NotImplementedException();
    }

    public SessionData ValidateAndDecodeToken(string token)
    {
        throw new NotImplementedException();
    }
}
```

Notice **JwtService** takes the options as a constructor parameter.
The options should be loaded from configuration and we want to be able to dependency inject the JWT helper where needed.

[Dependency injection](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/dependency-injection?view=aspnetcore-8.0)
is configured in [Program.cs](api/Program.cs).
The problem is that when adding too much dependency configuration directly to the file, it becomes rather crowded and
difficult to navigate.

A common fix is to bundle up the configuration details in extensions methods and just reference it in **Program.cs**.
In fact this pattern is already being use to configure the database.

See `AddSqLiteDataSource()`
in [SQLiteServiceCollectionExtensions.cs](/home/owrflow/code/aspnet_security_prep/api/SQLiteServiceCollectionExtensions.cs).

We need something similar for our JwtHelper.

Lets rename the file to just **ServiceCollectionExtensions.cs**.
Now add the setup for JwtOptions and JwtHelper:

```csharp
public static void AddJwtHelper(this IServiceCollection services)
{
    services.AddSingleton<JwtOptions>(services =>
    {
        var configuration = services.GetRequiredService<IConfiguration>();
        var options = configuration.GetRequiredSection("JWT").Get<JwtOptions>()!;
        
        // If address isn't set in the config then we are likely running in development mode.
        // We will use the address of the server as *issuer* for JWT.
        if (string.IsNullOrEmpty(options?.Address))
        {
            var server = services.GetRequiredService<IServer>();
            var addresses = server.Features.Get<IServerAddressesFeature>().Addresses;
            options.Address = addresses.First();
        }

        return options;
    });
    services.AddSingleton<JwtHelper>();
}
```

Now we can just call the method in [Program.cs](api/Program.cs).

```csharp
builder.Services.AddJwtHelper();
```

Should be added right after adding singletons for repositories and services.

The options for JWT handling can be set in `appsettings.json` or `appsettings.Development.json`.
The config file `appsettings.Development.json` is only used on you development machine, not when the application is
being deployed.

So got ahead and add settings to the end of [appsettings.Development.json](api/appsettings.Development.json).

```json
{
  "JWT": {
    "Secret": "iEGrLqMM8rcnza4G93ljmFGM/SMqNIuxZjWAWooSiEQxQjWEmte+L4SrYVhCgV7wsv73F/oKtk2g8h2wReafuQ==",
    "Lifetime": "04:00:00"
  }
}
```

The secret will be used to sign and verify JWTs.

**Important** Never ever store secrets for production in GIT.
Otherwise your boss will have every right to fire you on the spot, and you will be a disappointment to your parents!

You can generate a new secret with:

```sh
openssl rand -base64 64
```

### JWT handling

Lets implement [JwtService](service/JwtService.cs).
Start with `IssueToken()`:

```csharp
private const string SignatureAlgorithm = SecurityAlgorithms.HmacSha512;

public string IssueToken(SessionData data)
{
    var jwtHandler = new JwtSecurityTokenHandler();
    var token = jwtHandler.CreateEncodedJwt(new SecurityTokenDescriptor
    {
        SigningCredentials = new SigningCredentials(
            new SymmetricSecurityKey(_options.Secret),
            SignatureAlgorithm
        ),
        Issuer = _options.Address,
        Audience = _options.Address,
        Expires = DateTime.UtcNow.Add(_options.Lifetime),
        Claims = data.ToDictionary()
    });
    return token;
}
```

Here `Issuer` and `Audience` is the same because we are going to both issue the token and consumed (audience) from the same
system.

Tokens can be issued by one system and consumed (audience) by another.
Like when you log into other services with your Google or Facebook account.

`Expires` is when the token is valid until.

Claims are the payload of the token.
We can store whatever information we want in claims.
But we should stay away from storing sensitive information in it, since it isn't encrypted.

Next we need to validate the token and extract the payload.
(Right now the payload is just the user ID).

```csharp
public SessionData ValidateAndDecodeToken(string token)
{
    var jwtHandler = new JwtSecurityTokenHandler();
    var principal = jwtHandler.ValidateToken(token, new TokenValidationParameters
    {
        IssuerSigningKey = new SymmetricSecurityKey(_options.Secret),
        ValidAlgorithms = new[] { SignatureAlgorithm },

        // Default value is true already.
        // They are just set here to emphasise the importance.
        ValidateAudience = true,
        ValidateIssuer = true,
        ValidateLifetime = true,

        ValidAudience = _options.Address,
        ValidIssuer = _options.Address,

        // Set to 0 when validating on the same system that created the token
        ClockSkew = TimeSpan.FromSeconds(0)
    }, out var securityToken);
    return SessionData.FromDictionary(new JwtPayload(principal.Claims));
}
```

It should only accepts tokens signed by the one algorithm our applications is using.

The JWT specification allows signing algorithm to be "none" meaning no signature is used.
Attempting to use JWTs without signatures is a really bad idea and therefore we make you we wont accept tokens without.

## Authorization header

Remember that bearer tokens gets added to requests HTTP requests in a header.

We need some code to parse such header.

Add to `api/Middleware/JwtBearerHandler.cs`

```csharp
using service;

namespace api.Middleware;

public class JwtBearerHandler
{
    private readonly ILogger<JwtBearerHandler> _logger;
    private readonly RequestDelegate _next;

    public JwtBearerHandler(ILogger<JwtBearerHandler> logger, RequestDelegate next)
    {
        _logger = logger;
        _next = next;
    }

    public async Task InvokeAsync(HttpContext http)
    {
        var jwtHelper = http.RequestServices.GetRequiredService<JwtService>();

        try
        {
            var authHeader = http.Request.Headers.Authorization.FirstOrDefault();
            if (authHeader != null && authHeader.StartsWith("Bearer "))
            {
                var token = authHeader.Split(" ")[1];
                var data = jwtHelper.ValidateAndDecodeToken(token);
                http.SetSessionData(data);
            }
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error extracting user from bearer token in Authorization header");
        }

        await _next.Invoke(http);
    }
}
```

We also need to hook it up in [Program.cs](api/Program.cs).
Add `app.UseMiddleware<JwtBearerHandler>()` right above `app.UseMiddleware<GlobalExceptionHandler>()`.
The other in which middleware is added determines the in which they are executed.
Therefore the `GlobalExceptionHandler` middleware should be the last.

Header looks like this:

```txt
Authorization: Bearer <token>
```

So we grab the token part then validate and decode it using the service we just implemented.

Last we associate the payload/data from the token with the context for the current HTTP request in our app.
That way we can get the data again anywhere in filters or actions
using **HttpContextExtensions**.

Speaking of [HttpContextExtensions](api/HttpContextExtensions.cs).
We need to implement it in a way that works without cookie sessions.

```csharp
public static class HttpContextExtensions
{
    public static void SetSessionData(this HttpContext httpContext, SessionData data)
    {
        httpContext.Items["data"] = data;
    }

    public static SessionData? GetSessionData(this HttpContext httpContext)
    {
        return httpContext.Items["data"] as SessionData;
    }
}
```

`httpContext.Items` is destroyed after current request have been completed.
No server side storage this time.


## Swagger + JWT

To get swagger working with bearer tokens we need to add a bit of configuration.

In **HttpContextExtensions** add:

```csharp
public static void AddSwaggerGenWithBearerJWT(this IServiceCollection services)
{
    services.AddSwaggerGen(c =>
        {
            c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                In = ParameterLocation.Header,
                Description = "Please insert JWT with Bearer into field",
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = "Bearer",
                BearerFormat = "JWT"
            });
            c.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        },
                        Scheme = "oauth2",
                        Name = "Bearer",
                        In = ParameterLocation.Header
                    },
                    new string[] { }
                }
            });
        }
    );
}
```

Now hook up the configuration in [Program.cs](api/Program.cs).

```csharp
builder.Services.AddSwaggerGenWithBearerJWT();
```

## Client implementation

### Token storage

Add a simple service to deal with storing the token.

```typescript
import { Injectable } from "@angular/core";

@Injectable()
export class AuthService {
  private readonly storage: Storage = window.sessionStorage;

  setToken(token: string) {
    this.storage.setItem("token", token);
  }

  getToken() {
    return this.storage.getItem("token");
  }
}
```

We got two options for storing
it; [sessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage)
and [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).

Read about them and maybe experiment with each so you know the difference.

### Login

Change to `submit()` in [LoginComponent](frontend/src/app/login.component.ts) to:

```typescript
async submit() {
    const url = '/api/account/login';
    var response = await firstValueFrom(this.http.post<ResponseDto<{token: string}>>(url, this.form.value));
    this.auth.setToken(response.responseData!.token);

    (await this.toast.create({
        message: response.messageToClient,
        color: "success",
        duration: 5000
    })).present();
}
```

It just calls AuthService to set the token we get after successful login.

### Add token to header

We also need another interceptor to add the authorization header.
So add following to `frontend/src/interceptors/auth-http-interceptor.ts`

```typescript
@Injectable()
export class AuthHttpInterceptor implements HttpInterceptor {
    constructor(private readonly service: AuthService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = this.service.getToken();
        if (token && this.sameOrigin(req)) {
            return next.handle(req.clone({
                headers: req.headers.set("Authorization", `Bearer ${token}`)
            }));
        }
        return next.handle(req);
    }
    
    private sameOrigin(req: HttpRequest<any>) {
        const isRelative = !req.url.startsWith("http://") || !req.url.startsWith("https://");
        return req.url.startsWith(location.origin) || isRelative;
    }
}
```

Remember to add it to [AppModule](frontend/src/app/app.module.ts) just like the other interceptor.

It adds a token to Authorization header if we have one.

To protect the token we only added to request to our own system.
Either the url begins the origin for which the document was loaded, or we have a relative url in which case it doesn't
start with http:// or https://