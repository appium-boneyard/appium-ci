// transpile:main

import * as android from './lib/android-tools';
import * as iosTools from './lib/ios-tools';


const { Emulator: AndroidEmulator, androidTools } = android;

export { AndroidEmulator, androidTools, iosTools };
