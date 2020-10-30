# SharedStreets CurbWheel

CurbWheel is an open source data collection tool that can be used to map a city's curb assets and regulations and create a standardized data ([CurbLR](https://www.curblr.org/)) feed. It combines the precision of a measuring wheel with the efficiency of a smartphone app.

CurbWheel is built from a standard digital measuring wheel used by surveyors, which is hardwired to a Raspberry Pi computing device. This lets the wheel connect to a smartphone or computer over Bluetooth in order transmit measurements to a curb surveying app. After completing street surveying with the wheel and the app, users can process the data in a digitizer web app, producing a CurbLR feed.

![](/images/wheel_app_digitizer.png)
*Initial prototype of the wheel, app, and digitizer*

## How it works

To map a street, a user opens the surveying app on his/her phone, where he/she will see a map of the surrounding streets. The user taps to select a block face to map and begins to roll the wheel down the sidewalk -- snapping photos along the way to capture curb cuts, parking signage, fire hydrants, and physical assets that communicate curb regulations.

The CurbWheel app keeps track of the block faces that were surveyed and processes all incoming measurement data; every asset that was marked in the app is geolocated and [linear referenced](https://medium.com/sharedstreets/how-the-sharedstreets-referencing-system-works-2097b0d61b52) to determine its position along the street. From this information, the CurbWheel creates a linear-referenced street segment ("regulatory geometry") for each regulation that was mapped, which is stored alongside the accompanying photographs. The field data creates the geometries and captures a rough categorization for the curb regulation (e.g. "parking zone").

Afterwards, back at the office, the user uploads the field data from the curb wheel accesses it through the "digitizer", a lightweight data entry interface. This lets the user completes the curb inventory data by adding essential details to each regulation (e.g. the zone is in effect from 9am-5pm, Monday to Friday).The digitizer enables the user to iterate through each curb segment mapped, view the associated photographs as a reference, and use this information to populate an attribute form for the curb segment. When this is finished, the user exports the curb inventory as a standardized [CurbLR](https://www.curblr.org/) feed. This feed can be viewed in GIS systems, shared directly with consumers, and/or added into an [interactive map](https://www.curblr.org/).

The curb wheel provides an efficient and accurate pathway for city governments or others looking to collect curb inventory data and share it in a standardized (CurbLR) format.

## Using the CurbWheel

1. Build the wheel. See the [parts list](/PARTS.md) and [set up page](/SETUP.md) for instructions on how to build your own CurbWheel and load it with the necessary software. Reach out to [SharedStreets](mailto:info@sharedstreets.io) if you work for a government agency and you may need some help with this.

2. Download the app. Once the wheel is ready, you will download an Android or iOS app onto your phone and then go forth and survey your streets.

3. Use the CurbWheel to survey streets. Instructions, tips, and tricks for how to use the app are [here](HOWTOMAP.md).

4. Create a CurbLR feed from your survey data. To do this, we've created a lightweight data entry interface. Instructions and tips for using it are [here](HOWTODIGITIZE.md).

### Current software versions

- Raspberry Pi software is [here](https://curblr-www.s3.amazonaws.com/wheel/images/curbwheel_image_bleno_r1.img.gz). The code used to create this image lives [here](https://github.com/sharedstreets/curb-wheel-ble).
- Android and iOS app source code lives [here](https://github.com/sharedstreets/curb-wheel/tree/cordova-backend-switch).
- Digitizer source code lives [here](https://github.com/sharedstreets/curbwheel-digitizer).


## Development

Prebuilt APKs and iOS releases will be distributed via the Google Play Store and Test Flight but if you wish to build the app locally you can follow the guide below.

### Requirements

* Node.js
* npm
* Cordova ```npm install -g cordova```
* Platform specifics

    * Android

        * Android Studio _or_ Android SDK, installing Android Studio will include Android SDK and is likely a more straightforward process

    * iOS

        * OS X operating system
        * XCode 
            * ```xcode-select --install ```
        * ```npm install -g ios-deploy```


### Installation


1. Clone this repo ```git clone https://github.com/sharedstreets/curb-wheel```

    a. Checkout ```cordova``` branch ```git checkout cordova```


2. Add each platform you wish to build. 
    * Android: ```sh cordova platform add android ```
    * iOS: ```sh cordova platform add ios ```

    a. check that you have the requirements for each platform ```cordova requirements```


### Building the app

#### Android

_Note: If you have a device connected to your computer via USB Cordova _should_ auto-detect it a deploy to the device, otherwise it will default to the Android emulator_

* Local Development

    * ```npm run local-android```

    If you have a device connected to your computer via USB Cordova _should_ auto-detect it a deploy to the device, otherwise it will default to the Android emulator

* Production Build

    * ```npm run build-android```

    * The APK will be available in the project directory under ``` ./platforms/android/build/outputs/apk/debug/app-debug.apk ```
    
    * If you already have a build and want to create a new one with updated code, run ```sh cordova clean ``` and then ``` npm run build-android ```. The clean command clears out the previous version to ensure that the updates are included.


#### iOS

__//TODO__


------

## Acknowledgements

Thanks to Kuan Butts for suggesting the wheel + API idea. We were also inspired by [TreeKit](http://treekit.org/)'s approach to mapping street trees in NYC.



