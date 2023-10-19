using infrastructure.DataModels;
using service.Services;

namespace api.GraphQL.Types;

[GraphQLName("Post")]
public class PostGql
{
    public int Id { get; set; }
    public int? AuthorId { get; set; }
    public string Title { get; set; }
    public string Content { get; set; }

    public UserGql? GetAuthor([Service] UserService service)
    {
        if (!AuthorId.HasValue) return null;
        var model = service.GetDetails(AuthorId.Value);
        if (model == null) return null;
        return UserGql.FromQueryModel(model);
    }

    [GraphQLIgnore]
    public static PostGql FromQueryModel(Post model)
    {
        return new PostGql()
        {
            Id = model.Id,
            AuthorId = model.AuthorId,
            Title = model.Title,
            Content = model.Content,
        };
    }
}