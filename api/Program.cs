using api;
using api.Middleware;
using Azure.Identity;
using Azure.Storage.Blobs;
using infrastructure.Repositories;
using service;
using service.Services;

var builder = WebApplication.CreateBuilder(args);

// if (builder.Environment.IsProduction())
// {
//     builder.Configuration.AddAzureKeyVault(
//         new Uri($"https://{builder.Configuration["KeyVaultName"]}.vault.azure.net/"),
//         new DefaultAzureCredential());
// }

// Add services to the container.
builder.Services.AddDataSource();

builder.Services.AddSingleton<UserRepository>();
builder.Services.AddSingleton<PasswordHashRepository>();
builder.Services.AddSingleton<UserService>();
builder.Services.AddSingleton<AccountService>();
builder.Services.AddSingleton<PostRepository>();
builder.Services.AddSingleton<PostService>();
builder.Services.AddSingleton<FollowRepository>();
builder.Services.AddSingleton<FollowService>();
builder.Services.AddAvatarBlobService();
builder.Services.AddJwtService();
builder.Services.AddSwaggerGenWithBearerJWT();

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

var frontendOrigin = app.Services.GetService<IConfiguration>()!["FrontendOrigin"];
app.UseCors(policy =>
    policy
        .SetIsOriginAllowed(origin => origin == frontendOrigin)
        .AllowAnyMethod()
        .AllowAnyHeader()
);

app.UseSpaStaticFiles();
app.UseSpa(conf => { conf.Options.SourcePath = frontEndRelativePath; });

app.MapControllers();
app.UseMiddleware<JwtBearerHandler>();
app.UseMiddleware<GlobalExceptionHandler>();
app.Run();