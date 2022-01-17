# Azure servicebus Error Handling causes high CPU usage

This is a demo project to show that the Microsoft library `@azure/service-bus` can cause big problems when a servicebus
error occurs.

## Steps to reproduce

- install all dependencies: `yarn install`
- configure the application for an Azure servicebus using the file .env.local
- start the application: `yarn electron:serve`
- wait until the electron window appears
- Cut all network connections
- after 40 to 60 seconds `@azure/service-bus` recognises the missing network connection

## Log example

```
2022-01-17 21:10:51.984 [DEBUG] subscribe to service bus
2022-01-17 21:10:51.986 [DEBUG] connection string: Endpoint=sb://comstar-dev.servicebus.windows.net/;SharedAccessKeyName=ComSTAR-Client;SharedAccessKey=...
2022-01-17 21:10:51.986 [DEBUG] subscription: MBUR-Test-Subscription
2022-01-17 21:10:51.986 [DEBUG] topic: client_notification_umm
2022-01-17 21:11:53.793 [ERROR] call count: 1 - servicebus error: GeneralError: ENOTFOUND: getaddrinfo ENOTFOUND comstar-dev.servicebus.windows.net
2022-01-17 21:11:54.000 [ERROR] call count: 263 - servicebus error: GeneralError: ENOTFOUND: getaddrinfo ENOTFOUND comstar-dev.servicebus.windows.net
2022-01-17 21:11:55.000 [ERROR] call count: 1542 - servicebus error: GeneralError: ENOTFOUND: getaddrinfo ENOTFOUND comstar-dev.servicebus.windows.net
2022-01-17 21:11:56.000 [ERROR] call count: 1803 - servicebus error: GeneralError: ENOTFOUND: getaddrinfo ENOTFOUND comstar-dev.servicebus.windows.net
2022-01-17 21:11:57.000 [ERROR] call count: 1868 - servicebus error: GeneralError: ENOTFOUND: getaddrinfo ENOTFOUND comstar-dev.servicebus.windows.net
2022-01-17 21:11:58.000 [ERROR] call count: 1883 - servicebus error: GeneralError: ENOTFOUND: getaddrinfo ENOTFOUND comstar-dev.servicebus.windows.net
2022-01-17 21:11:59.000 [ERROR] call count: 1894 - servicebus error: GeneralError: ENOTFOUND: getaddrinfo ENOTFOUND comstar-dev.servicebus.windows.net
2022-01-17 21:12:00.000 [ERROR] call count: 1912 - servicebus error: GeneralError: ENOTFOUND: getaddrinfo ENOTFOUND comstar-dev.servicebus.windows.net
2022-01-17 21:12:01.000 [ERROR] call count: 1920 - servicebus error: GeneralError: ENOTFOUND: getaddrinfo ENOTFOUND comstar-dev.servicebus.windows.net
2022-01-17 21:12:02.000 [ERROR] call count: 1915 - servicebus error: GeneralError: ENOTFOUND: getaddrinfo ENOTFOUND comstar-dev.servicebus.windows.net
2022-01-17 21:12:03.000 [ERROR] call count: 1878 - servicebus error: GeneralError: ENOTFOUND: getaddrinfo ENOTFOUND comstar-dev.servicebus.windows.net
2022-01-17 21:12:04.000 [ERROR] call count: 1903 - servicebus error: GeneralError: ENOTFOUND: getaddrinfo ENOTFOUND comstar-dev.servicebus.windows.net
2022-01-17 21:12:05.000 [ERROR] call count: 1911 - servicebus error: GeneralError: ENOTFOUND: getaddrinfo ENOTFOUND comstar-dev.servicebus.windows.net
2022-01-17 21:12:06.000 [ERROR] call count: 1926 - servicebus error: GeneralError: ENOTFOUND: getaddrinfo ENOTFOUND comstar-dev.servicebus.windows.net
2022-01-17 21:12:07.000 [ERROR] call count: 1922 - servicebus error: GeneralError: ENOTFOUND: getaddrinfo ENOTFOUND comstar-dev.servicebus.windows.net
2022-01-17 21:12:08.000 [ERROR] call count: 1884 - servicebus error: GeneralError: ENOTFOUND: getaddrinfo ENOTFOUND comstar-dev.servicebus.windows.net
2022-01-17 21:12:09.000 [ERROR] call count: 1901 - servicebus error: GeneralError: ENOTFOUND: getaddrinfo ENOTFOUND comstar-dev.servicebus.windows.net
2022-01-17 21:12:10.000 [ERROR] call count: 1896 - servicebus error: GeneralError: ENOTFOUND: getaddrinfo ENOTFOUND comstar-dev.servicebus.windows.net
2022-01-17 21:12:11.000 [ERROR] call count: 1901 - servicebus error: GeneralError: ENOTFOUND: getaddrinfo ENOTFOUND comstar-dev.servicebus.windows.net
2022-01-17 21:12:12.000 [ERROR] call count: 1880 - servicebus error: GeneralError: ENOTFOUND: getaddrinfo ENOTFOUND comstar-dev.servicebus.windows.net
2022-01-17 21:12:13.000 [ERROR] call count: 1891 - servicebus error: GeneralError: ENOTFOUND: getaddrinfo ENOTFOUND comstar-dev.servicebus.windows.net
2022-01-17 21:12:14.000 [ERROR] call count: 1905 - servicebus error: GeneralError: ENOTFOUND: getaddrinfo ENOTFOUND comstar-dev.servicebus.windows.net
2022-01-17 21:12:15.000 [ERROR] call count: 1906 - servicebus error: GeneralError: ENOTFOUND: getaddrinfo ENOTFOUND comstar-dev.servicebus.windows.net
2022-01-17 21:12:16.000 [ERROR] call count: 1925 - servicebus error: GeneralError: ENOTFOUND: getaddrinfo ENOTFOUND comstar-dev.servicebus.windows.net
2022-01-17 21:12:17.000 [ERROR] call count: 1908 - servicebus error: GeneralError: ENOTFOUND: getaddrinfo ENOTFOUND comstar-dev.servicebus.windows.net
2022-01-17 21:12:18.000 [ERROR] call count: 1892 - servicebus error: GeneralError: ENOTFOUND: getaddrinfo ENOTFOUND comstar-dev.servicebus.windows.net
2022-01-17 21:12:19.000 [ERROR] call count: 1826 - servicebus error: GeneralError: ENOTFOUND: getaddrinfo ENOTFOUND comstar-dev.servicebus.windows.net
```

## What is the problem?

You can see very clearly that the `processError` handler for `receiver.subscribe` is triggered far too often.

After a ramp-up phase, it is triggered almost 2000 times per second on my computer.

This not only leads to a high CPU load.

If you imagine that this error would be written into a log file, then it would very quickly become extremely large.

In a company where you disconnect your computer from the network to go to a meeting room, the temporary unavailability of the network is a normal use case.

`processError` should be triggered significantly more rarely.
