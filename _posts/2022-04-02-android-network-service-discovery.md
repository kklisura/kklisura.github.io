---
layout: post
title: Android network service discovery
tags:
  - android
  - java
  - bonjour
  - nsd
  - nodejs
---

I had troubles setting up [network service discovery](https://developer.android.com/training/connect-devices-wirelessly/nsd) on Android and using [bonjour](https://github.com/watson/bonjour) (or [bonjour-service](https://www.npmjs.com/package/bonjour-service)) on nodejs server. I had troubles setting up just a basic usage, following android documentation and npm package documentation.

After lots of debugging and eventually diffing the network packets of npm packages and [mDNS/DNS-SD](https://github.com/mjansson/mdns) (a tool which worked) using [Wireshark](https://www.wireshark.org/), I was able to figure out what's the problem. The [bonjour](https://github.com/watson/bonjour) and [bonjour-service](https://www.npmjs.com/package/bonjour-service) are missing `host` field when registring/publishing your service!

I'm now sharing my code to get you up to start if you're having problems or starting up with network service discovery (NSD) on android.

## On the server

_package.json_
```json
{
  "name": "nsd-server",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "bonjour-service": "^1.0.11"
  }
}
```
...or just use `npm install bonjour-service`.

_index.js_
```js
const { Bonjour } = require('bonjour-service');
 
const bonjour = new Bonjour();

bonjour.publish({
  name: 'NsdChatServer',
  type: 'nsdchat',
  host: 'NsdChatServer.local',
  protocol: 'tcp',
  port: 3000,
});
```
Don't forget the `host` property!

## On the Android app

_AbstractServiceDiscovery.java_

```java
import android.net.nsd.NsdManager;
import android.net.nsd.NsdServiceInfo;
import android.util.Log;

import java.net.InetAddress;

public abstract class AbstractServiceDiscovery {
    private static final String TAG = "AbstractServiceDiscovery";

    private final NsdManager nsdManager;
    private final String serviceType;
    private final String serviceName;

    private final NsdManager.DiscoveryListener discoveryListener;
    private final NsdManager.ResolveListener resolveListener;

    public AbstractServiceDiscovery(NsdManager nsdManager, String serviceType, String serviceName) {
        this.nsdManager = nsdManager;
        this.serviceType = serviceType;
        this.serviceName = serviceName;
        this.discoveryListener = new DiscoveryListener();
        this.resolveListener = new ResolveListener();
    }

    /**
     * Starts discovering services.
     *
     * When service has been successfully found, {@link #onServiceDiscovered(InetAddress, int)} will
     * be called with appropriate host and port information.
     *
     * If there is any issue during discovery, {@link #onServiceDiscoveryFailed()} will be called.
     */
    public void startDiscoveringServices() {
        nsdManager.discoverServices(serviceType, NsdManager.PROTOCOL_DNS_SD, this.discoveryListener);
    }

    /**
     * Stops the service discovery.
     */
    public void stopDiscoveringServices() {
        nsdManager.stopServiceDiscovery(this.discoveryListener);
    }

    /**
     * Called when service has been discovered.
     *
     * @param address Host address of remote server
     * @param port Host port of remote server
     */
    protected abstract void onServiceDiscovered(InetAddress address, int port);

    /**
     * Called when service discovery has been started.
     *
     */
    protected abstract void onServiceDiscoveryStarted();

    /**
     * Called when discovery fails for any reason.
     */
    protected abstract void onServiceDiscoveryFailed();

    public class ResolveListener implements NsdManager.ResolveListener {
        @Override
        public void onResolveFailed(NsdServiceInfo service, int errorCode) {
            Log.e(TAG, "Failed resolving remote service. Error code: " + errorCode);
            AbstractServiceDiscovery.this.onServiceDiscoveryFailed();
        }

        @Override
        public void onServiceResolved(NsdServiceInfo service) {
            Log.d(TAG, "Remote service successfully resolved. Host: " + service.getHost().toString() + " port: " + service.getPort());
            AbstractServiceDiscovery.this.onServiceDiscovered(service.getHost(), service.getPort());
        }
    };

    public class DiscoveryListener implements NsdManager.DiscoveryListener {
        @Override
        public void onStartDiscoveryFailed(String serviceType, int errorCode) {
            Log.e(TAG, "Failed discovering remote services. Error code: " + errorCode);
            AbstractServiceDiscovery.this.onServiceDiscoveryFailed();
        }

        @Override
        public void onStopDiscoveryFailed(String serviceType, int errorCode) {
            Log.e(TAG, "Failed discovering remote services. Error code: " + errorCode);
            nsdManager.stopServiceDiscovery(AbstractServiceDiscovery.this.discoveryListener);
            AbstractServiceDiscovery.this.onServiceDiscoveryFailed();
        }

        @Override
        public void onDiscoveryStarted(String s) {
            Log.d(TAG, "Started discovering remote service...");
            AbstractServiceDiscovery.this.onServiceDiscoveryStarted();
        }

        @Override
        public void onDiscoveryStopped(String serviceType) {
            Log.d(TAG, "Discovering remote service stopped");
        }

        @Override
        public void onServiceFound(NsdServiceInfo service) {
            Log.d(TAG, "Discovered remote service with service type " + service.getServiceType() + " and name " + service.getServiceName());

            if (service.getServiceType().equals(serviceType)) {
                Log.d(TAG, "Resolving service...");
                nsdManager.resolveService(service, resolveListener);
            }
        }

        @Override
        public void onServiceLost(NsdServiceInfo service) {
            Log.d(TAG, "Service lost while discovering remote service");
        }
    }
}
```


_ServerDiscovery.java_

```java
import android.net.nsd.NsdManager;

import com.github.kklisura.android.sensor.client.network.AbstractServiceDiscovery;

import java.net.InetAddress;

public class ServerDiscovery extends AbstractServiceDiscovery {

    public ServerDiscovery(NsdManager nsdManager) {
        super(nsdManager, "_nsdchat._tcp.", "NsdChatServer");
    }

    @Override
    protected void onServiceDiscovered(InetAddress address, int port) {
      // We got our service!
    }

    @Override
    protected void onServiceDiscoveryStarted() {
        // Started discovery...
    }

    @Override
    protected void onServiceDiscoveryFailed() {
        // Discovery failed for some reason
    }
}
```

And you would use it like this in some activity:

```java
ServerDiscovery serverDiscovery = new ServerDiscovery((NsdManager) getSystemService(Context.NSD_SERVICE));
serverDiscovery.startDiscoveringServices();
// serverDiscovery.stopDiscoveringServices();
```
