$Env:Path=$Env:Path + ";C:\Users\appium\AppData\Roaming\npm"

echo "Node.js Version: $(node -v)"
echo "NPM Version: $(npm -v)"

echo "Global npm install..."
npm --no-color --silent install -g gulp rimraf
if ($LastExitCode -ne 0) { Exit 1 }

echo "Deleting node_modules..."
rimraf node_modules
if ($LastExitCode -ne 0) { Exit 1 }

echo "Installing packages..."
npm --no-color --silent install
if ($LastExitCode -ne 0) { Exit 1 }

