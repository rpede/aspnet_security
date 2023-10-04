using infrastructure;

namespace api;

public static class SqLiteServiceCollectionExtensions
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
}