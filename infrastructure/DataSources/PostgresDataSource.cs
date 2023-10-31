using System.Data;
using Npgsql;

namespace infrastructure.DataSources;

public class PostgresDataSource : IDataSource
{
    private readonly NpgsqlDataSource _dataSource;
    public string ConnectionString { get; }

    public PostgresDataSource(string connectionString)
    {
        ConnectionString = connectionString;
        _dataSource = NpgsqlDataSource.Create(ConnectionString);
    }

    public IDbConnection OpenConnection()
    {
        return _dataSource.OpenConnection();
    }
}