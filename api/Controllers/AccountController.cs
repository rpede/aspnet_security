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
        throw new NotImplementedException();
    }

    [HttpPost]
    [Route("/api/account/register")]
    public ResponseDto Register([FromBody] RegisterDto dto)
    {
        throw new NotImplementedException();
    }

    [HttpGet]
    [Route("/api/account/whoami")]
    public ResponseDto WhoAmI()
    {
        throw new NotImplementedException();
    }
}