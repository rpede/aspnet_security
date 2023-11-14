using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace service.Services;

public class BlobService
{
    private readonly BlobServiceClient _client;

    public BlobService(BlobServiceClient client)
    {
        _client = client;
    }

    public string Save(string containerName, Stream stream, string contentType, string? url)
    {
        var name = url != null ? new Uri(url).LocalPath.Split("/").Last() : Guid.NewGuid().ToString();
        var container = _client.GetBlobContainerClient(containerName);
        var blob = container.GetBlobClient(name);
        if (blob.Exists().Value) blob.Delete();
        blob.Upload(stream, new BlobHttpHeaders() { ContentType = contentType });
        return blob.Uri.GetLeftPart(UriPartial.Path);
    }
}