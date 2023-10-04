# Authentication

The goal is to implement password based authentication using a really strong
password hashing algorithm.

A bit about the architecture:

Account management tasks, such as registration, authentication, password-reset etc. is delegated
to [AccountService](service/AccountService.cs).
It depends on both [UserRepository](infrastructure/Repositories/UserRepository.cs)
and [PasswordHashRepository](infrastructure/Repositories/PasswordHashRepository.cs).
API endpoints are defined in
[AccountController](api/Controllers/AccountController.cs) which depend on
AccountService.

## Password hashing algorithm

We need to add a package to help us make secure password hashes.
Argon2id is a good choice of hashing algorithm.

```shell
dotnet add service package Konscious.Security.Cryptography.Argon2
```

There is an abstract class named [PasswordHashAlgorithm](service/PasswordHashAlgorithm.cs). It acts as a common
interface for various hashing algorithms.

Note: Since it has no internal state, we could also have used an interface instead of an abstract class.

We extend and implement a subclass that uses argon2id library.
So add the following to a file in the **service** folder.

```csharp
namespace Service;

public class Argon2idPasswordHashAlgorithm : PasswordHashAlgorithm
{
    public const string Name = "argon2id";

    public override string GetName() => Name;

    public override string HashPassword(string password, string salt)
    {
        using var hashAlgo = new Argon2id(Encoding.UTF8.GetBytes(password))
        {
            Salt = Decode(salt),
            MemorySize = 12288,
            Iterations = 3,
            DegreeOfParallelism = 1,
        };
        return Encode(hashAlgo.GetBytes(256));
    }

    public override bool VerifyHashedPassword(string password, string hash, string salt)
    {
        return HashPassword(password, salt).SequenceEqual(hash);
    }
}
```

Implementing password algorithm this way allows for an easier upgrade path years to come.
In case argon2id becomes breakable.

We can add support for a new algorithm just by implementing a new subclass.

PasswordHashAlgorithm and its subclasses are a variation of
the [strategy design pattern](https://en.wikipedia.org/wiki/Strategy_pattern),
where [AccountService](/home/owrflow/code/aspnet_security/service/AccountService.cs) acts as the context.

We also need a way to dynamically create instances of our concrete subclass.
So change `PasswordHashAlgorithm.Create()` to

```csharp
const string PreferredAlgorithmName = Argon2idPasswordHashAlgorithm.Name;

public static PasswordHashAlgorithm Create(string algorithmName = PreferredAlgorithmName)
{
    switch (algorithmName)
    {
        case Argon2idPasswordHashAlgorithm.Name:
            return new Argon2idPasswordHashAlgorithm();
        default:
            throw new NotImplementedException();
    }
}
```

This static `Create()` method is called a [factory method](https://en.wikipedia.org/wiki/Factory_method_pattern).
It is responsible for instantiating the password hashing algorithm at runtime.

## AccountService

We are now ready to implement the [AccountService](service/AccountService.cs).

### Authenticate

Lets start with the `Authenticate()` method (called on login).

```csharp
 public User? Authenticate(string email, string password)
 {
     try
     {
         var passwordHash = _passwordHashRepository.GetByEmail(email);
         var hashAlgorithm = PasswordHashAlgorithm.Create(passwordHash.Algorithm);
         var isValid = hashAlgorithm.VerifyHashedPassword(password, passwordHash.Hash, passwordHash.Salt);
         if (isValid) return _userRepository.GetById(passwordHash.UserId);
     }
     catch (Exception e)
     {
         _logger.LogError("Authenticate error: {Message}", e);
     }

     throw new InvalidCredentialException("Invalid credential!");
 }
```

We call the factory method defined in [PasswordHashAlgorithm](service/PasswordHashAlgorithm.cs) with name of hash
algorithm stored on user row in database.
This allows us to easily implement support for a new password hashing algorithm.

**Important:** if the credentials can not be verified for some reason - whether email doesn't exist, password is incorrect
or an exception is thrown - it is important that we always "fail" in the same way.

In this case: if credentials can't be verified, we return null, no matter the cause.

Detailed error messages are crucial for us when fixing bugs in our application.
However we don't want to expose too much details to potential attackers.
We therefore log the error message instead of returning it to the client.

The client should just see a generic error, not implementation specific details
on why it failed.

### Register

Next lets implement the `register()` method (called when new user registers).

```csharp
public User Register(string fullName, string email, string password, string? avatarUrl)
{
   var hashAlgorithm = PasswordHashAlgorithm.Create();
   var salt = hashAlgorithm.GenerateSalt();
   var hash = hashAlgorithm.HashPassword(password, salt);
   var user = _userRepository.Create(fullName, email, avatarUrl);
   _passwordHashRepository.Create(user.Id, hash, salt, hashAlgorithm.GetName());
   return user;
}
```

**Note** No parameters is being passed to the factory method.
Meaning that the **default/preferred** implementation of `PasswordAlgorithm` will be used.

The name of the hash algorithm is being stored on the user row.
That way we know which algorithm to use when authenticating.

## AccountController

Implement the login endpoint:

```csharp
var user = _service.Authenticate(dto.Email, dto.Password);
return new ResponseDto
{
    MessageToClient = "Successfully authenticated"
};
```

And the register endpoint:

```csharp
var user = _service.Register(dto.FullName, dto.Email, dto.Password, avatarUrl: dto.AvatarUrl);
return new ResponseDto
{
    MessageToClient = "Successfully registered"
};
```

## Wrapping up

You should now go to `/register` endpoint and register a new user.

Try to login with your user on `/login` endpoint.