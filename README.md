# Cordova app template

A template to create Cordova apps with live reloading and a good setup for teams.

## Setup

1. Install newest cordova (5.0+)by doing `npm install -g cordova`
2. Create empty www directory.
3. Run `npm run setup`
4. If you encounter an error about `cordova-plugin-whitelist`, try to install it manually via `cordova plugin add cordova-plugin-whitelist`

## Running

The template works on both the device and web. To start, use one of the following commands: 

* `npm run dev:cordova` to create the files needed for the device and watch for changes in HTML/JS/SCSS.
* `npm run dev:web` to start a web server and watch for changes in HTML/JS/SCSS.
* `npm run dev` to start a web server and create the files for the device and watch for changes in HTML/JS/SCSS.

If you want to test on an android device, you also need to run this command:

```
cordova run android --device && cordova serve
```

To test on iOS device run this two commands in two separate terminals:

```
cordova run ios --device
cordova serve
```