# Settings sharing

Share settings creates a UTF-8 `.json` attachment containing the versioned settings payload. The receiver downloads the file and selects it in Import settings to preview and apply it. JSON content is validated even when a messaging app changes its filename. ZIP archives are no longer supported.

Exports use `application/json` on Android and `public.json` on iOS. File-writing and native sharing failures show an alert, including native error details when available. A completed share dialog does not confirm delivery by the messaging app; sending to another person and downloading through Messenger needs a device check.

The file picker accepts JSON, text, and generic binary MIME types to accommodate download providers. ZIP compression and direct Base64 dependencies are removed.
