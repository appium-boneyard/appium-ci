echo "Node.js Version: $(node -v)"
echo "NPM Version: $(npm -v)"

$Env:Path=$Env:Path + ";C:\Users\appium\AppData\Roaming\npm"
echo "PATH: $Env:Path"

npm install -g gulp rimraf
rimraf node_modules
npm install

