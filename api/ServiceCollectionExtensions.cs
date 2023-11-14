using Azure.Storage.Blobs;
using infrastructure.DataSources;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Microsoft.OpenApi.Models;
using service.Services;

namespace api;

public static class ServiceCollectionExtensions
{
    public static void AddDataSource(this IServiceCollection services)
    {
        services.AddSingleton<IDataSource>(provider =>
        {
            const string name = "WebApiDatabase";
            var config = provider.GetService<IConfiguration>()!;
            var connectionString = config.GetConnectionString(name);

            if (string.IsNullOrWhiteSpace(connectionString))
                throw new InvalidOperationException($"Connection string named '{name}'");
            if (connectionString.EndsWith(".sqlite"))
            {
                return new SQLiteDataSource { ConnectionString = connectionString };
            }

            if (connectionString.StartsWith("postgres://"))
            {
                var uri = new Uri(connectionString);
                return new PostgresDataSource(
                    $"""
                     Host={uri.Host};
                     Database={uri.AbsolutePath.Trim('/')};
                     User Id={uri.UserInfo.Split(':')[0]};
                     Password={uri.UserInfo.Split(':')[1]};
                     Port={(uri.Port > 0 ? uri.Port : 5432)};
                     Pooling=true;
                     MaxPoolSize=3
                     """
                );
            }

            throw new InvalidOperationException($"Unsupported connection string: ${connectionString}");
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

    public static void AddAvatarBlobService(this IServiceCollection services)
    {
        services.AddSingleton<BlobService>(provider =>
        {
            var connectionString = provider.GetService<IConfiguration>()!
                .GetConnectionString("AvatarStorage");
            var client = new BlobServiceClient(connectionString);
            return new BlobService(client);
        });
    }
}