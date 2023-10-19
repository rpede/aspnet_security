using service;
using service.Services;

namespace api.GraphQL.Types;

[GraphQLName("Query")]
public class QueryGql
{
    public UserGql? GetMe(
        [GlobalState(GlobalStateKeys.Session)] SessionData? session,
        [Service] UserService service
    )
    {
        if (session == null) return null;
        var model = service.GetDetails(session.UserId);
        if (model == null) return null;
        return UserGql.FromQueryModel(model);
    }
    
    public IEnumerable<PostGql> GetPosts([Service] PostService service)
    {
        return service.GetAll().Select(PostGql.FromQueryModel);
    }
}