# Repository instructions

## Release preparation

- Before creating a new PR, increase the package version in `pubspec.yaml` from
  the current `origin/main` version: patch for compatible fixes, minor for
  compatible features, and major for breaking changes.
- Use a stable `major.minor.patch` version, optionally with a numeric `+build`
  suffix for documentation revisions (for example, `1.1.3+1`). The iOS podspec
  uses only the base version (`1.1.3`), because CocoaPods rejects `+build`.
  Add a dated release section using the full package version to `CHANGELOG.md`.
- Update this package's path dependency version in `example/pubspec.lock` too,
  so `flutter pub get` does not modify a tracked file during CI.
- Keep the same version when updating an existing PR, unless `origin/main`
  has already used that version. Check `origin/main` before pushing the final update.
- Run the relevant checks and `flutter pub publish --dry-run` from a clean
  checkout. Do not include unrelated local changes.
- Merge to `origin/main` starts CI. After CI passes, the release job creates
  `v<version>` and dispatches publishing on that tag using `GITHUB_TOKEN`.
  Do not add a personal release token. See `.github/RELEASING.md`.
