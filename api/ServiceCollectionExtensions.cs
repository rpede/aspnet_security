using infrastructure;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Microsoft.OpenApi.Models;
using service;
using service.Services;

namespace api;

public static class ServiceCollectionExtensions
{
    public static void AddSqLiteDataSource(this IServiceCollection services)
    {
        services.AddSingleton<SQLiteDataSource>(provider =>
        {
            const string name = "WebApiDatabase";
            var config = provider.GetService<IConfiguration>()!;
            var connectionString = config.GetConnectionString(name);
            if (string.IsNullOrWhiteSpace(connectionString))
                throw new InvalidOperationException($"Connection string named '{name}'");
            return new SQLiteDataSource { ConnectionString = connectionString };
        });
    }

    public static void AddJwtService(this IServiceCollection services)
    {
        services.AddSingleton<JwtOptions>(services =>
        {
            var configuration = services.GetRequiredService<IConfiguration>();
            var options = configuration.GetRequiredSection("JWT").Get<JwtOptions>()!;

            // If address isn't set in the config then we are likely running in development mode.
            // We will use the address of the server as *issuer* for JWT.
            if (string.IsNullOrEmpty(options?.Address))
            {
                var server = services.GetRequiredService<IServer>();
                var addresses = server.Features.Get<IServerAddressesFeature>()?.Addresses;
                options.Address = addresses?.FirstOrDefault();
            }

            return options;
        });
        services.AddSingleton<JwtService>();
    }

    public static void AddSwaggerGenWithBearerJWT(this IServiceCollection services)
    {
        services.AddSwaggerGen(c =>
            {
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    In = ParameterLocation.Header,
                    Description = "Please insert JWT with Bearer into field",
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    Scheme = "Bearer",
                    BearerFormat = "JWT"
                });
                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            },
                            Scheme = "oauth2",
                            Name = "Bearer",
                            In = ParameterLocation.Header
                        },
                        new string[] { }
                    }
                });
            }
        );
    }
}