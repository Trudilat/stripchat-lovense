# Stripchat Lovense Integration

Thanks for checking out my app, if you are interested in what this program does you should check out this [official app made by Lovense](https://www.lovense.com/app/vibemate) that has the same functionality but better.

Unfortunately, for now Lovense's app does not support connecting to all Stripchat livestreams, it only supports a handful. Hence why I made this app which in theory should work on all Stripchat livestreams.

# Warning

When developing this app I only had a **Lovense Edge 2** to test with so it is designed to work with that device. I am fairly certain it will work with all the vibrators but it won't utilize all the features of the male masturbators like the **Max 2**.

# How to set it up

1. Download the installer from the latest release on the [releases](https://github.com/Trudilat/stripchat-lovense/releases) page.
2. Run the installer, you will get a windows warning as I have not taken the time to license it with windows.
3. When you have the app installed and opened, you need the [Lovense Remote](https://www.lovense.com/app/remote) app on a device with bluetooth.   
   It is important the Device running the Lovense Remote app and my app are on the same local network.
4. When you have that, open it and go to **Me** > **Settings** > **Enable Game Mode**, then enter the "Local IP" into the "Lovense IP" field on my app.
5. You can now test the connection to see if it is working.
6. Now you are all set and ready to go. Just enter the username of the Stripchat livestream you want to connect to and enjoy.

# Bugs

If you experience any bugs please open a issue on the [Github Issues tab](https://github.com/Trudilat/stripchat-lovense/issues) or you can fix it yourself and make a pull request.

# Build

```bash
# Download repo
git clone https://github.com/Trudilat/stripchat-lovense
# Install dependencies
npm install
# Run app in developement mode
npm run electron:serve
# Build app
npm run electron:build
```
