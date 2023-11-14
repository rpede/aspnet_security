using System.Net;
using api.Filters;
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
    //[RequestSizeLimit(10 * 1024 * 1024 /* 10MB */)] // 400 bad request
    public IActionResult Update([FromForm] UpdateAccountCommandModel model, IFormFile? avatar)
    {
        if (avatar?.Length > 10 * 1024 * 1024) return StatusCode(StatusCodes.Status413PayloadTooLarge);
        var session = HttpContext.GetSessionData()!;
        string? avatarUrl = null;
        if (avatar != null)
        {
            avatarUrl = _accountService.Get(session)?.AvatarUrl;
            using var avatarTransform = new ImageTransform(avatar.OpenReadStream())
               .Resize(200, 200)
               .FixOrientation()
               .RemoveMetadata();
            avatarUrl = _blobService.Save("avatar", avatarTransform.ToStream(), avatarUrl);
        }

        _accountService.Update(session, model, avatarUrl);
        return Ok();
    }
}