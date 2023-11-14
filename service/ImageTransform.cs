using ImageMagick;

namespace service;

// dotnet add service package Magick.NET-Q16-AnyCPU

public sealed class ImageTransform(Stream stream) : IDisposable
{
    private readonly MagickImage _image = new(stream);
    private Stream? _outStream;

    /// <summary>
    /// Resize image to maximum given dimensions while keeping aspect ratio intact.
    /// </summary>
    /// <param name="width"></param>
    /// <param name="height"></param>
    /// <returns></returns>
    public ImageTransform Resize(int width, int height)
    {
        _image.Resize(new MagickGeometry(width, height));
        return this;
    }

    /// <summary>
    /// Adjust image orientation based on metadata.
    /// </summary>
    /// <returns></returns>
    public ImageTransform FixOrientation()
    {
        _image.AutoOrient();
        return this;
    }

    /// <summary>
    /// Remove potential sensitive image metadata.
    /// </summary>
    /// <returns></returns>
    public ImageTransform RemoveMetadata()
    {
        // Exif profile: Camera settings, GPS location, Date, Time Zone, ... etc
        var exifProfile = _image.GetExifProfile();
        // IPTC profile: Copyright, Permissions and licenses, Creator's information and contact details, Rights usage terms, ...etc
        var iptcProfile = _image.GetIptcProfile();
        // Xmp profile: IPTC with additionnal information
        var xmpProfile = _image.GetXmpProfile();

        if (exifProfile != null) _image.RemoveProfile(exifProfile);
        if (iptcProfile != null) _image.RemoveProfile(iptcProfile);
        if (xmpProfile != null) _image.RemoveProfile(xmpProfile);
        return this;
    }

    public ImageTransform Jpeg()
    {
        _image.Format = MagickFormat.Jpeg;
        return this;
    }

    /// <summary>
    /// Get a byte stream representing the transformed image.
    /// </summary>
    /// <returns></returns>
    public Stream ToStream()
    {
        _outStream = new MemoryStream();
        _image.Write(_outStream);
        _outStream.Position = 0;
        return _outStream;
    }

    public void Dispose()
    {
        _image.Dispose();
        stream.Dispose();
        _outStream?.Dispose();
    }
}