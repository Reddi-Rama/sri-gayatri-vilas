const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("desktopAPI", {
  login: (email, password) => ipcRenderer.invoke("auth:login", email, password),
  logout: () => ipcRenderer.invoke("auth:logout"),
  openAdmin: () => ipcRenderer.invoke("portal:open"),
  status: () => ipcRenderer.invoke("auth:status"),
  onConnection: (callback) =>
    ipcRenderer.on("orders:connection", (_event, status) => callback(status))
});

