$Env:Path=$Env:Path + ";C:\Users\appium\AppData\Roaming\npm"
npm config set color false

echo "Node.js Version: $(node -v)"
echo "NPM Version: $(npm -v)"

echo "Global npm install..."
npm --no-color install -g gulp rimraf

echo "Deleting node_modules..."
rimraf node_modules

echo "Installing packages..."
npm --no-color install
