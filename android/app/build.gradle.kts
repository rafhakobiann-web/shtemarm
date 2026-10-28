plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}
android {
    namespace = "am.shtemarm.app"
    compileSdk = 35
    defaultConfig {
        applicationId = "am.shtemarm.app"
        minSdk = 24
        targetSdk = 35
        versionCode = providers.gradleProperty("shtemarm.versionCode").orNull?.toIntOrNull() ?: 4
        versionName = providers.gradleProperty("shtemarm.versionName").orNull ?: "0.1.1-beta.1"
    }
    // Release signing is configured ONLY when a secure CI keystore is supplied.
    // No keystore or password is ever committed to this repository.
    val releaseStore = System.getenv("ANDROID_SIGNING_STORE_FILE")
    if (!releaseStore.isNullOrBlank()) {
        signingConfigs {
            create("production") {
                storeFile = file(releaseStore)
                storePassword = System.getenv("ANDROID_SIGNING_STORE_PASSWORD")
                keyAlias = System.getenv("ANDROID_SIGNING_KEY_ALIAS")
                keyPassword = System.getenv("ANDROID_SIGNING_KEY_PASSWORD")
            }
        }
        buildTypes.getByName("release").signingConfig = signingConfigs.getByName("production")
    }
    buildFeatures { compose = true }
    sourceSets.getByName("main").assets.srcDir(file("../../public/data"))
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
}
dependencies {
    val composeBom = platform("androidx.compose:compose-bom:2024.12.01")
    implementation(composeBom)
    implementation("androidx.activity:activity-compose:1.9.3")
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.foundation:foundation")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    testImplementation("junit:junit:4.13.2")
}
