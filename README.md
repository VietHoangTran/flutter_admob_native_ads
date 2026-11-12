# Flutter AdMob Native Ads

Native and banner ads for Flutter on Android and iOS, with automatic reload,
preloading, and 12 customizable native layouts.

[![pub.dev](https://img.shields.io/pub/v/flutter_admob_native_ads.svg)](https://pub.dev/packages/flutter_admob_native_ads)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

- **Native ads:** 12 layouts, theme-aware styling, and cached ad support.
- **Banner ads:** adaptive, inline adaptive, and standard sizes.
- **Automatic reload for both:** configurable intervals, visibility/lifecycle/network checks, and retry on failure.
- **Preload and callbacks:** prepare ads ahead of time and track load, click, impression, and revenue events.

## Install & Setup

```yaml
dependencies:
  flutter_admob_native_ads: ^1.1.3+1
```

Run `flutter pub get`, then configure your AdMob **App ID** on both platforms.
App IDs contain `~`; the ad unit IDs used in widgets contain `/`.

**Android:** set `minSdk` to **23 or higher**, and add this inside
`<application>` in `android/app/src/main/AndroidManifest.xml`:

```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="YOUR_ADMOB_APP_ID" />
```

**iOS:** target **iOS 13 or higher**, and add to `ios/Runner/Info.plist`:

```xml
<key>GADApplicationIdentifier</key>
<string>YOUR_ADMOB_APP_ID</string>
```

Initialize Google Mobile Ads in `AppDelegate` with
`MobileAds.shared.start(completionHandler: nil)`.
See the [complete platform setup](doc/USAGE.md#installation) for the AppDelegate
example and CocoaPods instructions.

## Native Ads with Auto Reload

Use Google test ad unit IDs during development; replace the placeholder below
with the appropriate platform's [native test ID](doc/USAGE.md#native-ads-1).

```dart
import 'package:flutter_admob_native_ads/flutter_admob_native_ads.dart';

NativeAdWidget(
  options: NativeAdOptions(
    adUnitId: 'YOUR_NATIVE_AD_UNIT_ID',
    layoutType: NativeAdLayoutType.form6,
    enableSmartReload: true,
    reloadIntervalSeconds: 60,
    retryDelaySeconds: 12,
  ),
  height: NativeAdLayoutType.form6.recommendedHeight,
)
```

Omit `style` to follow the Flutter light/dark theme, or provide a
`NativeAdStyle` for custom colors and spacing.

## Banner Ads with Auto Reload

Use the platform's [banner test ID](doc/USAGE.md#banner-ads-1) during development.

```dart
BannerAdWidget(
  options: BannerAdOptions(
    adUnitId: 'YOUR_BANNER_AD_UNIT_ID',
    size: BannerAdSize.adaptiveBanner,
    enableSmartReload: true,
    reloadIntervalSeconds: 60,
    retryDelaySeconds: 12,
  ),
)
```

## How Automatic Reload Works

Both examples enable an automatic reload attempt every **60 seconds**. A reload
proceeds only while the app is in the foreground, the ad is visible, and the
network is available. Failed reloads use the configured retry delay.

| Option | Purpose |
| --- | --- |
| `enableSmartReload: true` | Enable visibility-aware reload handling. Disabled by default. |
| `reloadIntervalSeconds: 60` | Attempt reload every 60 seconds. `null` disables the interval timer. |
| `retryDelaySeconds: 12` | Wait 12 seconds before retrying a failed reload. |

The widgets track visibility automatically; their default `visibilityThreshold`
is `0.5`. For manual loading, preloading, or explicit `reload()` calls, use a
`NativeAdController` or `BannerAdController` as shown in the
[usage guide](doc/USAGE.md#basic-usage-with-controller).

## Layout Previews


Design references for the 12 supported forms. Actual ad content and styling vary.

| **form1** | **form2** | **form3** |
| --- | --- | --- |
| ![Native ad form1 design reference](https://raw.githubusercontent.com/VietHoangTran/flutter_admob_native_ads/main/ads_template_native/ad_1.png) | ![Native ad form2 design reference](https://raw.githubusercontent.com/VietHoangTran/flutter_admob_native_ads/main/ads_template_native/ad_2.png) | ![Native ad form3 design reference](https://raw.githubusercontent.com/VietHoangTran/flutter_admob_native_ads/main/ads_template_native/ad_3.png) |
| **form4** | **form5** | **form6** |
| ![Native ad form4 design reference](https://raw.githubusercontent.com/VietHoangTran/flutter_admob_native_ads/main/ads_template_native/ad_4.png) | ![Native ad form5 design reference](https://raw.githubusercontent.com/VietHoangTran/flutter_admob_native_ads/main/ads_template_native/ad_5.png) | ![Native ad form6 design reference](https://raw.githubusercontent.com/VietHoangTran/flutter_admob_native_ads/main/ads_template_native/ad_6.png) |
| **form7** | **form8** | **form9** |
| ![Native ad form7 design reference](https://raw.githubusercontent.com/VietHoangTran/flutter_admob_native_ads/main/ads_template_native/ad_7.png) | ![Native ad form8 design reference](https://raw.githubusercontent.com/VietHoangTran/flutter_admob_native_ads/main/ads_template_native/ad_8.png) | ![Native ad form9 design reference](https://raw.githubusercontent.com/VietHoangTran/flutter_admob_native_ads/main/ads_template_native/ad_9.png) |
| **form10** | **form11** | **form12** |
| ![Native ad form10 design reference](https://raw.githubusercontent.com/VietHoangTran/flutter_admob_native_ads/main/ads_template_native/ad_10.png) | ![Native ad form11 design reference](https://raw.githubusercontent.com/VietHoangTran/flutter_admob_native_ads/main/ads_template_native/ad_11.png) | ![Native ad form12 design reference](https://raw.githubusercontent.com/VietHoangTran/flutter_admob_native_ads/main/ads_template_native/ad_12.png) |

<details>
<summary>Additional full-screen design reference</summary>

This reference is separate from the 12 supported forms.

![Full-screen native ad design reference](https://raw.githubusercontent.com/VietHoangTran/flutter_admob_native_ads/main/ads_template_native/ad_full.png)

</details>

## More Examples

- [All layout forms and recommended heights](doc/USAGE.md#layout-forms)
- [Preload native ads](doc/USAGE.md#preload-for-instant-display) · [Preload banners](doc/USAGE.md#preload-banner)
- [Custom styling](doc/USAGE.md#custom-styling) · [Callbacks and API](doc/USAGE.md#api-reference)
- [Runnable example app](example) · [Live template gallery](doc/USAGE.md#reference-template-gallery)
- [Issues and feedback](https://github.com/VietHoangTran/flutter_admob_native_ads/issues)

MIT License — see [LICENSE](LICENSE). Maintained by
[VietHoangTran](https://github.com/VietHoangTran).
