using Azure.Storage.Blobs;

namespace service.Services;

public class BlobService
{
    private readonly BlobServiceClient _client;

    public BlobService(BlobServiceClient client)
    {
        _client = client;
    }

    public string Save(string containerName, Stream stream, string? url)
    {
        var name = url != null ? new Uri(url).LocalPath.Split("/").Last() : Guid.NewGuid().ToString();
        var container = _client.GetBlobContainerClient(containerName);
        var blob = container.GetBlobClient(name);
        if (blob.Exists().Value) blob.Delete();
        blob.Upload(stream);
        return blob.Uri.GetLeftPart(UriPartial.Path);
    }
}