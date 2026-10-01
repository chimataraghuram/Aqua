param()
if (-not (Get-Command safari-web-extension-converter -ErrorAction SilentlyContinue)) {
  throw 'Safari packaging requires macOS with Xcode. Copy dist/safari-source to that machine and run: xcrun safari-web-extension-converter dist/safari-source --project-location ./SafariAqua --app-name Aqua'
}
safari-web-extension-converter 'dist/safari-source' --project-location 'dist/safari-project' --app-name Aqua
