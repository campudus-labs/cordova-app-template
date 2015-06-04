# Cordova app template

A template to create Cordova apps with live reloading and a good setup for teams.

## Setup

After cloning this repository, use `npm setup` to install all necessary modules and cordova plugins.

## Running

The template works on both the device and web. To start, use one of the following commands: 
* `npm run dev:cordova` to create the files needed for the device and watch for changes in HTML/JS/SCSS.
* `npm run dev:web` to start a web server and watch for changes in HTML/JS/SCSS.
* `npm run dev` to start a web server and create the files for the device and watch for changes in HTML/JS/SCSS.

If you want to test on an android device, you also need to run this command:

`cordova run android --device && cordova serve`