using api.Filters;
using Microsoft.AspNetCore.Mvc;
using service.Services;

namespace api.Controllers;

[RequireAuthentication]
[ApiController]
public class UserController : ControllerBase
{
    private readonly UserService _userService;
    private readonly FollowService _followService;

    public UserController(UserService userService, FollowService followService)
    {
        _userService = userService;
        _followService = followService;
    }

    [HttpGet("/api/users")]
    public IActionResult Get()
    {
        return Ok(_userService.GetOverview());
    }

    [HttpGet("/api/users/{id}")]
    public IActionResult Get(int id)
    {
        var user = _userService.GetDetails(id);
        return user != null ? Ok(user) : NotFound();
    }

    [HttpGet("/api/users/{id}/followers")]
    public IActionResult GetFollowers(int id)
    {
        return Ok(_followService.GetFollowers(id));
    }

    [HttpGet("/api/users/{id}/following")]
    public IActionResult GetFollowing(int id)
    {
        return Ok(_followService.GetFollowing(id));
    }
}