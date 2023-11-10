using System.Net;
using System.Security.Authentication;
using api.Filters;
using api.TransferModels;
using Microsoft.AspNetCore.Mvc;
using service;
using service.Models.Command;
using service.Services;

namespace api.Controllers;

[ValidateModel]
[ApiController]
public class AccountController : ControllerBase
{
    private readonly AccountService _accountService;
    private readonly JwtService _jwtService;
    private readonly BlobService _blobService;

    public AccountController(AccountService accountService, JwtService jwtService, BlobService blobService)
    {
        _accountService = accountService;
        _jwtService = jwtService;
        _blobService = blobService;
    }

    [HttpPost]
    [Route("/api/account/login")]
    public IActionResult Login([FromBody] LoginCommandModel model)
    {
        var user = _accountService.Authenticate(model);
        if (user == null) return Unauthorized();
        var token = _jwtService.IssueToken(SessionData.FromUser(user!));
        return Ok(new { token });
    }

    [HttpPost]
    [Route("/api/account/register")]
    public IActionResult Register([FromBody] RegisterCommandModel model)
    {
        var user = _accountService.Register(model);
        return Created();
    }

    [RequireAuthentication]
    [HttpGet]
    [Route("/api/account/whoami")]
    public IActionResult WhoAmI()
    {
        var data = HttpContext.GetSessionData();
        var user = _accountService.Get(data);
        return Ok(user);
    }
    
    [RequireAuthentication]
    [HttpPut]
    [Route("/api/account/update")]
    public IActionResult Update([FromForm] UpdateAccountCommandModel model, IFormFile? avatar)
    {
        var session = HttpContext.GetSessionData()!;
        string? avatarUrl = null;
        if (avatar != null)
        {
            avatarUrl = this._accountService.Get(session)?.AvatarUrl;
            using var avatarStream = avatar.OpenReadStream();
            avatarUrl = _blobService.Save("avatar", avatarStream, avatarUrl);
        }
        _accountService.Update(session, model, avatarUrl);
        return Ok();
    }
}