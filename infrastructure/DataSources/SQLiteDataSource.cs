using System.Data;
using Microsoft.Data.Sqlite;

namespace infrastructure.DataSources;

public class SQLiteDataSource : IDataSource
{
    public required string ConnectionString { init; get; }

    public IDbConnection OpenConnection()
    {
        return new SqliteConnection(ConnectionString);
    }
}