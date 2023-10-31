using System.Data;

namespace infrastructure.DataSources;

public interface IDataSource
{
    public string ConnectionString { get; }
    public IDbConnection OpenConnection();
}