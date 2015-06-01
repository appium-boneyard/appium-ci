sample-android-project
===================

Sample project showing how to configure the Android CI

# Boilerplate config

All you need to do is modifying the `e2eTest` configuration as in the file below. You may also want
to use the yargs package to configure the android emulator using command line parameters.

[gulpfile.js](https://github.com/appium/appium-ci/blob/master/sample-android-project/gulpfile.js)

# Jenkins setup

- Create a new job, copying the [sample-android-project](https://team-appium.ci.cloudbees.com/view/Appium%20Libs/job/sample-android-project/)
- Modify the git section to point to your package.
- Make sure th test is running on the `android-linux` label.
- Modify the `Execute shell` as needed, the `setup` line configure the testrunner. The `e2e-test` launch the e2e tests using the avd as parameter.

```
#!/bin/bash -le
rm setup && wget https://raw.githubusercontent.com/appium/appium-ci/master/setup && source setup
gulp test
gulp e2e-test --emu --avd=NEXUS_S_18_X86
```

## Watch

```
npm run watch
```

## Test

```
npm test
```
