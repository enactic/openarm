# Motor Setup Quick Partial Guide
Excerpted from: https://wiki.seeedstudio.com/damiao_series/

In Windows:  
Download the [Damiao Debugging Tools](https://files.seeedstudio.com/wiki/robotics/Actuator/damiao/Debugging_Tools_v.1.6.8.8.exe)  
  
<img width="241" height="46" alt="image" src="https://github.com/user-attachments/assets/c47076fa-39b6-4647-bb1d-3ac0653b70db" />  

If Windows Defender Blocks It:  
Head to Windows Security -> Virus & Threat Protection -> Protection History -> Select this file -> Actions -> Allow  

Running it should open a window like so:
<img width="624" height="506" alt="image" src="https://github.com/user-attachments/assets/25991adf-1779-4394-bde4-5a1c10e13b41" />  
Toggle English with the green/red toggle button at the bottom left

The tool will be mainly used for two tasks:  
Configuring IDs + quick calibrate to test if the motor runs

Make sure your hardware is set up correctly by following the guide at the bottom  

Open the port:
(If it does not detect the correct serial port, it's usually the last one in the drop-down list)
<img width="186" height="217" alt="image" src="https://github.com/user-attachments/assets/80196185-8345-4d26-b4c7-ca85d7f036b9" />

You can see the motor info on initial boot:  
<img width="336" height="571" alt="image" src="https://github.com/user-attachments/assets/2f02dd16-84ea-47af-8014-aaedc9dbc00d" />

Config motor IDs:
1. Read parameters from the motor
2. Set the CAN ID using the ID table from the setup guide
3. Set the Master ID using the ID table from the setup guide
4. Write the new settings to the motor  
<img width="925" height="259" alt="image" src="https://github.com/user-attachments/assets/b961beca-c1e7-4d92-aec5-44b8ccd45430" />  

Simple test if the motor works:  
Hit calibrate, and the motor should start moving  
(No need to save calibration after)  
<img width="187" height="94" alt="image" src="https://github.com/user-attachments/assets/0d1ba330-8f1a-4b06-9539-a27d2b8fbdfc" />


## Hardware Setup:
<img width="1320" height="899" alt="image" src="https://github.com/user-attachments/assets/e482c1f9-efd8-496b-a1b6-6baa7bfc9fae" />

*Comes with only one end (like the above), will need to solder another male end:  
<img width="392" height="317" alt="image" src="https://github.com/user-attachments/assets/98196bf3-aec8-4fd3-9a08-bd0c480ddf49" />  
**Use an XT30U-M or split a M/F cable and solder the ends to connect with a 24V psu:  
<img width="533" height="151" alt="image" src="https://github.com/user-attachments/assets/3f07cada-b93c-491b-9b43-c61359ce483d" />  

