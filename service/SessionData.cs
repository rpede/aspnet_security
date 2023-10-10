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
        return new SessionData { UserId = (int)dict[Keys.UserId], Role = Enum.Parse<Role>((string)dict[Keys.Role]) };
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