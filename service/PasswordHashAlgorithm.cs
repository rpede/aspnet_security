using System.Security.Cryptography;

namespace Service;

public abstract class PasswordHashAlgorithm
{
    public static PasswordHashAlgorithm Create(string algorithmName)
    {
        throw new NotImplementedException();
    }

    public abstract string GetName();

    public abstract string HashPassword(string password, string salt);

    public abstract bool VerifyHashedPassword(string password, string hash, string salt);

    public string GenerateSalt()
    {
        return Encode(RandomNumberGenerator.GetBytes(128));
    }

    protected byte[] Decode(string value)
    {
        return Convert.FromBase64String(value);
    }

    protected string Encode(byte[] value)
    {
        return Convert.ToBase64String(value);
    }
}