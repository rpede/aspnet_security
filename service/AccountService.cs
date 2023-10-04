using infrastructure.DataModels;
using infrastructure.Repositories;
using Microsoft.Extensions.Logging;
using Service;

namespace service;

public class AccountService
{
    private readonly ILogger<AccountService> _logger;
    private readonly PasswordHashRepository _passwordHashRepository;
    private readonly UserRepository _userRepository;

    public AccountService(ILogger<AccountService> logger, UserRepository userRepository,
        PasswordHashRepository passwordHashRepository)
    {
        _logger = logger;
        _userRepository = userRepository;
        _passwordHashRepository = passwordHashRepository;
    }

    public User? Authenticate(string email, string password)
    {
        throw new NotImplementedException();
    }

    public User Register(string fullName, string email, string password, string? avatarUrl)
    {
        throw new NotImplementedException();
    }
}