# Google Play Store Build Guide for MAKLER App

## What's Been Set Up
✅ Release keystore created: `android/app/makler-release.keystore`
✅ Build configuration updated with release signing
✅ App icons configured from MAINLOGO.png

## Keystore Details
- **Keystore File**: `android/app/makler-release.keystore`
- **Keystore Password**: `makler123`
- **Key Alias**: `makler-key`
- **Key Password**: `makler123`
- **Validity**: 10,000 days (27+ years)

## Build Instructions

### Option 1: Build AAB (Recommended for Play Store)
AAB (Android App Bundle) is the recommended format for Google Play Store.

```bash
cd /Users/jamshid/projects/makler/maklerapp
./gradlew bundleRelease
```

Output location: `android/app/build/outputs/bundle/release/app-release.aab`

### Option 2: Build APK
If you need an APK file instead:

```bash
./gradlew assembleRelease
```

Output location: `android/app/build/outputs/apk/release/app-release.apk`

## Next Steps for Play Store Upload

1. **Create Google Play Developer Account** (if not already done)
   - Visit: https://play.google.com/console
   - Cost: One-time $25 registration fee

2. **Create a New App in Google Play Console**
   - App name: MAKLER
   - Default language: English
   - App type: Application
   - Category: House & Home (or appropriate)
   - Target audience: Appropriate age rating

3. **Upload the AAB**
   - Go to Release > Production
   - Upload the generated `app-release.aab` file
   - Fill in:
     - Release notes
     - Version name (e.g., "1.0")
     - App store listing (title, description, screenshots, etc.)

4. **Complete App Information**
   - App title
   - Short description
   - Full description
   - Screenshots (at least 2)
   - Feature graphic
   - Icon (already set to MAINLOGO.png)

5. **Set Content Rating**
   - Complete the Google Play content rating questionnaire

6. **Review Policies**
   - Ensure app complies with Google Play policies

7. **Submit for Review**
   - Review takes typically 2-3 hours, sometimes up to 24 hours
   - You'll receive approval/rejection email

## Important Notes

⚠️ **Backup Your Keystore!**
Keep the `makler-release.keystore` file safe. You MUST use the same keystore for all future updates.

⚠️ **Version Updates**
To push updates to Play Store, increment `versionCode` in `android/app/build.gradle`:
```groovy
defaultConfig {
    versionCode 2  // Increment this
    versionName "1.1"
}
```

⚠️ **Do Not Share Keystore Password**
Never commit the keystore or passwords to public repositories.

## Troubleshooting

**Build fails with "keystore not found"**
- Ensure you're running commands from the correct directory
- Verify keystore file exists: `ls android/app/makler-release.keystore`

**Build fails with "invalid password"**
- Double-check the password in build.gradle matches keystore creation

**App crashes after release build**
- Check Logcat: `./gradlew logcat`
- Verify Proguard configuration in `android/app/proguard-rules.pro`

## Build Status
Ready to build! Execute the build commands above.
