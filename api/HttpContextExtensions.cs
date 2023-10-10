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