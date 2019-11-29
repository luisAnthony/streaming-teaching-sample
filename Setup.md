## Environment Setup
1. Setup Virtualbox HostNetworkManager (File->HostNetworkManager)
    - Select Configure Adapter Manually
    - IPv4 Address: 192.168.1.75
    - IPv4 Network Mask: 255.255.255.0
    - Disable DHCP Server
2. Setup Virtualbox to have 3 LAN Networks (File->Preferces->Network) \
    2.1 SkyNet (10.10.10.0/24) | Enable DHCP \
        - Setup port forwarding for SkyNet \
        <img src="src/assets/Readme images/port_forward.png"> \
    2.2 LandNet-A (192.168.100.0/24) | Enable DHCP \
    2.3 LandNet-B (192.168.110.0/24) | Enable DHCP \
3. Download Kurento Media Server \
    - sudo apt-get install kurento-media-server \
    - add this line to gedit /etc/kurento/modules/kurento/WebRtcEndpoint.conf.ini \
    ```turnURL=rtcuser:rtcpass@192.168.1.75:3478```



## Project Links

**Backend**: https://git.skyland.tw/louiebasay/streaming-teaching-sample-backend \
**Frontend**:  https://git.skyland.tw/ncsist/streaming-teaching-sample 

## Git Clone
### Frontend:
```git clone git@git.skyland.tw:ncsist/streaming-teaching-sample.git```
### Backend:
```git clone git@git.skyland.tw:louiebasay/streaming-teaching-sample-backend.git```

## Dependencies 

### Turn Server (192.168.1.75): 

Downloads: \
[Windows 32 bit](https://github.com/pion/turn/releases/download/1.0.3/simple-turn-windows-386.exe) \
[Windows 64 bit](https://github.com/pion/turn/releases/download/1.0.3/simple-turn-windows-amd64.exe) \
[Linux 32 bit](https://github.com/pion/turn/releases/download/1.0.3/simple-turn-linux-386) \
[Linux 64 bit](https://github.com/pion/turn/releases/download/1.0.3/simple-turn-linux-amd64) 

Setup Windows: 
```bash
$env:USERS = "rtcuser=rtcpass foo=bar" 
$env:REALM = "192.168.1.75" 
$env:UDP_PORT = 3478 
.\simple-turn-windows-amd64 
```

Setup Linux 
```bash
$env:USERS = "rtcuser=rtcpass foo=bar" 
$env:REALM = "192.168.1.75" 
$env:UDP_PORT = 3478 
./simple-turn-windows-amd64 
```

### Stun Server (192.168.1.75): 
TBD

# Frontend Setup
1. Install node 
2. Install npm
3. Install angular cli
- npm install -g @angular/cli
4. Clone [Frontend](###Frontend)
5. cd streaming-teaching-sample/
6. sudo npm install
7. sudo ng serve --host 0.0.0.0
8. Access in [Google chrome](http://192.168.1.75:4200/#/main)
