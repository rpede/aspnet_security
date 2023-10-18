using api.Filters;
using Microsoft.AspNetCore.Mvc;
using service;
using service.Services;

namespace api.Controllers;

[RequireAuthentication]
[ApiController]
public class PostController : ControllerBase
{
    private readonly PostService _postService;

    public PostController(PostService postService)
    {
        _postService = postService;
    }

    [HttpGet("/api/posts")]
    public IActionResult Get([FromQuery] int? author)
    {
        return author.HasValue ? Ok(_postService.GetByAuthor(author.Value)) : Ok(_postService.GetAll());
    }

    [HttpGet("/api/posts/{id}")]
    public IActionResult Get(int id)
    {
        return Ok(_postService.GetById(id));
    }
}