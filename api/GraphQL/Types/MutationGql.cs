using System.Security.Authentication;
using infrastructure.DataModels;
using service;
using service.Services;

namespace api.GraphQL.Types;

[GraphQLName("Mutation")]
public class MutationGql
{
    public ILoginResultGql Login(CredentialsGql input, [Service] AccountService accountService,
        [Service] JwtService jwtService)
    {
        var user = accountService.Authenticate(input.ToModel());
        if (user == null) return new InvalidCredentialsGql { Message = "Invalid credentials" };
        var session = SessionData.FromUser(user);
        var token = jwtService.IssueToken(session);
        return new TokenResultGql { Token = token };
    }
}