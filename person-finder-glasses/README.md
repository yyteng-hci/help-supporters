NearbyHelper

Device Portal username: harbour-ceal

Device Portal password: ceal3141

Steps for Building and Running to HoloLens

Connecting the HoloLens to your PC:

1. Follwing Resource 1, enable Devloper Mode on the HoloLens, as well as the Device Portal, both found in Settings -> Update -> For developers. Also, enable Developer Mode on your PC in Settings -> Update and Security -> For developers.
2. Get the IP address of the HoloLens, as this is used for connecting via Wi-Fi. It can be found in Settings -> Network & Internet -> Wi-Fi -> Advanced Options or Settings -> Network & Internet -> Hardware properties.
3. Going to this IP address in your PC's browser, navigate to HoloLens IP address/devicepair.htm and open the node for System -> Preferences, then scroll down to Device Security, select the "Download this device's certificate" button.
4. From the Windows menu, type: Manage Computer Certificates and start the applet. Expand the Trusted Root Certification Authority folder and select the Certificates folder. From the Action menu, select All Tasks -> Import.. and complete the Certificate Import Wizard, using the certificate file you downloaded from the Device Portal.
5. Restart your browser and navigate back to HoloLens IP address. Press the Request Pin button and enter the PIN that shows up on your HoloLens. Additionally, as prompted, create a username and password for logging into the Device Portal (This will be needed when building/running the app in Unity and Visual Studio) and press Pair.

Building the app in Visual Studio:

1. Open the .sln file of your app in Visual Studio, and follwing Resource 4, in the configuration drop-down menus, select Debug or Release and x86, then select Remote Machine in the play button drop-down.
2. Go to Project -> Properties -> Configuration Properties -> Debugging and under Debugging set the Remote Machine feild to HoloLens IP Address, set Authentication Mode to Universal.
3. If prompted for a Pin to pair, go to Settings -> Update -> For developers -> Pair on your HoloLens and type the displayed Pin into Visual Studio. Now you can deploy and debug directly to the HoloLens.





Resources:

1. Pairing Hololens to PC: https://docs.microsoft.com/en-us/windows/mixed-reality/develop/advanced-concepts/using-the-windows-device-portal
2. Setting up Unity project for HoloLens development: https://github.com/MicrosoftDocs/azure-docs/blob/main/articles/spatial-anchors/tutorials/tutorial-new-unity-hololens-app.md
3. Mixed Reality Feature Tool: https://docs.microsoft.com/en-us/windows/mixed-reality/develop/unity/welcome-to-mr-feature-tool
4. Deploying with Visual Studio: https://docs.microsoft.com/en-us/windows/mixed-reality/develop/advanced-concepts/using-visual-studio?tabs=hl
