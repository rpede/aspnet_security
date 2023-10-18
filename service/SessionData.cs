using infrastructure.DataModels;

namespace service;

public class SessionData
{
    public required int UserId { get; init; }
    public required bool IsAdmin { get; init; }

    public static SessionData FromUser(User user)
    {
        return new SessionData { UserId = user.Id, IsAdmin = user.IsAdmin };
    }

    public static SessionData FromDictionary(Dictionary<string, object> dict)
    {
        return new SessionData { UserId = (int)dict[Keys.UserId], IsAdmin = (bool)dict[Keys.IsAdmin] };
    }

    public Dictionary<string, object> ToDictionary()
    {
        return new Dictionary<string, object> { { Keys.UserId, UserId }, { Keys.IsAdmin, IsAdmin } };
    }

    public static class Keys
    {
        public const string UserId = "u";
        public const string IsAdmin = "a";
    }
}