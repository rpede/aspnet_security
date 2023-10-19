using api;
using api.GraphQL;
using api.GraphQL.Types;
using api.Middleware;
using infrastructure.Repositories;
using service;
using service.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddSqLiteDataSource();

builder.Services.AddSingleton<UserRepository>();
builder.Services.AddSingleton<PasswordHashRepository>();
builder.Services.AddSingleton<UserService>();
builder.Services.AddSingleton<AccountService>();
builder.Services.AddSingleton<PostRepository>();
builder.Services.AddSingleton<PostService>();
builder.Services.AddSingleton<FollowRepository>();
builder.Services.AddSingleton<FollowService>();
builder.Services.AddJwtService();
builder.Services.AddSwaggerGenWithBearerJWT();

builder.Services
    .AddGraphQLServer()
    .AddQueryType<QueryGql>()
    .AddMutationType<MutationGql>()
    .AddType<TokenResultGql>()
    .AddType<InvalidCredentialsGql>()
    .AddHttpRequestInterceptor<HttpRequestInterceptor>();

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
var frontEndRelativePath = "./../frontend/www";
builder.Services.AddSpaStaticFiles(conf => conf.RootPath = frontEndRelativePath);
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseSecurityHeaders();

app.UseSpaStaticFiles();
app.UseSpa(conf => { conf.Options.SourcePath = frontEndRelativePath; });

app.MapGraphQL();

app.MapControllers();
app.UseMiddleware<JwtBearerHandler>();
app.UseMiddleware<GlobalExceptionHandler>();
app.Run();