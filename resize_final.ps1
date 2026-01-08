Add-Type -AssemblyName System.Drawing
$Path = "C:\Users\ZAYN\Downloads\SABR_OS_FINAL\public\SABR-LOGO.png"
$Output = "C:\Users\ZAYN\Downloads\SABR_OS_FINAL\public\SABR-LOGO-SMALL.png"

$img = [System.Drawing.Image]::FromFile($Path)
$newImg = New-Object System.Drawing.Bitmap(512, 512)
$g = [System.Drawing.Graphics]::FromImage($newImg)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($img, 0, 0, 512, 512)
$newImg.Save($Output, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$newImg.Dispose()
$img.Dispose()

Remove-Item $Path
Rename-Item $Output "SABR-LOGO.png"
