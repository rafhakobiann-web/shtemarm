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
        versionCode = 3
        versionName = "0.1.0-beta.1"
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
}
