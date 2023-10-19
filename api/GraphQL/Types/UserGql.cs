using service;
using service.Models.Query;
using service.Services;

namespace api.GraphQL.Types;

[GraphQLName("User")]
public class UserGql
{
    public int Id { get; set; }
    public string FullName { get; set; }
    public string Email { get; set; }
    public string? AvatarUrl { get; set; }
    public required bool IsAdmin { get; set; }

    public IEnumerable<PostGql> GetPosts([Service] PostService service)
    {
        return service.GetByAuthor(this.Id).Select(PostGql.FromQueryModel);
    }

    public IEnumerable<UserGql> GetFollowers([Service] FollowService service)
    {
        return service.GetFollowers(Id).Select(FromQueryModel);
    }
    
    public IEnumerable<UserGql> GetFollowing([Service] FollowService service)
    {
        return service.GetFollowing(Id).Select(FromQueryModel);
    }

    [GraphQLIgnore]
    public static UserGql FromQueryModel(UserDetailQueryModel model)
    {
        return new UserGql()
        {
            Id = model.Id,
            FullName = model.FullName,
            Email = model.Email,
            AvatarUrl = model.AvatarUrl,
            IsAdmin = model.IsAdmin,
        };
    }
}