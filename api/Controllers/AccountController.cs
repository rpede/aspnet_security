using api.Filters;
using api.TransferModels;
using Microsoft.AspNetCore.Mvc;
using service;

namespace api.Controllers;

[ValidateModel]
public class AccountController : ControllerBase
{
    private readonly AccountService _service;

    public AccountController(AccountService service)
    {
        _service = service;
    }

    [HttpPost]
    [Route("/api/account/login")]
    public ResponseDto Login([FromBody] LoginDto dto)
    {
        var user = _service.Authenticate(dto.Email, dto.Password);
        HttpContext.SetSessionData(SessionData.FromUser(user!));
        return new ResponseDto
        {
            MessageToClient = "Successfully authenticated"
        };
    }

    [HttpPost]
    [Route("/api/account/register")]
    public ResponseDto Register([FromBody] RegisterDto dto)
    {
        var user = _service.Register(dto.FullName, dto.Email, dto.Password, dto.AvatarUrl);
        return new ResponseDto
        {
            MessageToClient = "Successfully registered"
        };
    }

    [RequireAuthentication]
    [HttpGet]
    [Route("/api/account/whoami")]
    public ResponseDto WhoAmI()
    {
        var data = HttpContext.GetSessionData();
        var user = _service.Get(data);
        return new ResponseDto
        {
            ResponseData = user
        };
    }

    [HttpPost]
    [Route("/api/account/logout")]
    public ResponseDto Logout()
    {
        HttpContext.Session.Clear();
        return new ResponseDto()
        {
            MessageToClient = "Successfully logged out"
        };
    }
}