set PATH=%PATH%;C:\Users\appium\AppData\Roaming\npm

echo %CD%
call node -v
if %ERRORLEVEL% GEQ 1 EXIT /B 1
call npm -v
if %ERRORLEVEL% GEQ 1 EXIT /B 1

call npm install -g gulp rimraf
if %ERRORLEVEL% GEQ 1 EXIT /B 1

call rimraf node_modules
if %ERRORLEVEL% GEQ 1 EXIT /B 1

call npm install
if %ERRORLEVEL% GEQ 1 EXIT /B 1

