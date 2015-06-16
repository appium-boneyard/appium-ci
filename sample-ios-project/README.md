sample-ios-project
===================

Sample project showing how to configure the ios CI

# Boilerplate config

All you need to do is modifying the `e2eTest` configuration as in the file below. You may also want
to use the yargs package to configure the ios emulator using command line parameters.

[gulpfile.js](https://github.com/appium/appium-ci/blob/master/sample-ios-project/gulpfile.js)

# Jenkins setup

- Create a new job, copying the [sample-ios-project](https://team-appium.ci.cloudbees.com/view/Appium%20Libs/job/sample-ios-project/)
- Modify the git section to point to your package.
- Make sure th test is running on the `yosemite` label.
- Modify the `Execute shell` as needed, the `setup` line configure the testrunner. The `e2e-test` launch the e2e tests.

```
#!/bin/bash -le
rm -f setup && wget https://raw.githubusercontent.com/appium/appium-ci/master/setup && source setup
gulp test
gulp e2e-test --xcode-versiom=6.1.1
```

## Watch

```
npm run watch
```

## Test

```
npm test
```
