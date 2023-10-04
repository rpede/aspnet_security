using System.Data;
using Microsoft.Data.Sqlite;

namespace infrastructure;

public class SQLiteDataSource
{
    public required string ConnectionString { init; get; }

    public IDbConnection OpenConnection()
    {
        return new SqliteConnection(ConnectionString);
    }
}