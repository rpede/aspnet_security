# Security Headers

```shell
dotnet add api package NetEscapades.AspNetCore.SecurityHeaders
```

In [Program.cs](api/Program.cs) remove:

```csharp
app.UseCors(options =>
{
    options.SetIsOriginAllowed(origin => true)
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
});
```

And add:

```csharp
app.UseSecurityHeaders();
```

This changes HTTP headers to give some protection against various attacks such as CSRF and Clickjacking.

Lets observe the changes in headers:

1. Run the run the backend
2. Go to [http://localhost:5000/users](http://localhost:5000/users)
3. Open developer in your browser and click the network tab (CTRL+SHIFT+i)
4. Refresh if the list is empty
5. Select the first element and pay attention to the headers
6. Remove the `app.UseSecurityHeaders()` observe the difference
7. Add `app.UseSecurityHeaders()` back in