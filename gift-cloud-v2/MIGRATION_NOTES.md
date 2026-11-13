# APERTURE Gift Cloud — source backup

This directory backs up the Nov 13, 2026 Lovable preview from commit `15c182e5f6ceccd4addc39f24329b03f8b0028aa`. It is isolated from the current production `chatgpt-gift-studio` service, which has not been changed.

Lovable editor: https://lovable.dev/projects/00db5bc6-e9bf-4625-849d-76377622a6c6

No paid services or checkout enabled. Gift contents are encoded in the URL fragment and readable by anyone with the link. This is a source backup, **not** a public deployment. Tests in `tests/e2e` require Playwright and a running app. The current app uses a Lovable TanStack starter and may need configuration changes to run independently.
