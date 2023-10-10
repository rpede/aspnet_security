using infrastructure.DataModels;
using service;

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