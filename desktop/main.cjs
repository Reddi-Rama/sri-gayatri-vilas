const { app, BrowserWindow, ipcMain, Notification, shell } = require("electron");
const path = require("path");
const fs = require("fs/promises");
const { safeStorage } = require("electron");
const { createClient } = require("@supabase/supabase-js");
const config = require("./config.local.cjs");

let win;
let supabase;
let orderChannel;

const sessionFile = () => path.join(app.getPath("userData"), "admin-session.bin");

const secureStorage = {
  async getItem() {
    try {
      if (!safeStorage.isAsyncEncryptionAvailable()) return null;
      const encrypted = await fs.readFile(sessionFile());
      return await safeStorage.decryptStringAsync(encrypted);
    } catch {
      return null;
    }
  },
  async setItem(_key, value) {
    if (!safeStorage.isAsyncEncryptionAvailable()) {
      throw new Error("Windows secure storage is unavailable.");
    }
    await fs.mkdir(app.getPath("userData"), { recursive: true });
    await fs.writeFile(sessionFile(), await safeStorage.encryptStringAsync(value));
  },
  async removeItem() {
    await fs.rm(sessionFile(), { force: true });
  }
};

function createSupabase() {
  supabase = createClient(config.supabaseUrl, config.anonKey, {
    auth: {
      storage: secureStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false
    }
  });
}

async function verifyAdmin(userId, accessToken) {
  if (!accessToken) {
    console.error("Missing authenticated access token.");
    return false;
  }

  const authenticatedClient = createClient(
    config.supabaseUrl,
    config.anonKey,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    }
  );

  const { data, error } = await authenticatedClient
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("ADMIN VERIFICATION ERROR:", error);
    return false;
  }

  console.log("ADMIN VERIFICATION SUCCESS:", !!data);
  return !!data;
}

function stopListening() {
  if (orderChannel) {
    supabase.removeChannel(orderChannel);
    orderChannel = null;
  }
}

function startListening() {
  console.log("ORDER LISTENER: Starting...");
  console.log("WINDOW NOTIFICATIONS SUPPORTED:", Notification.isSupported());

  stopListening();

  orderChannel = supabase
    .channel("desktop-new-orders")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "orders"
      },
      (payload) => {
        console.log("NEW ORDER EVENT RECEIVED:", !!payload?.new);

        try {
          if (!Notification.isSupported()) {
            console.error("WINDOW NOTIFICATIONS ARE NOT SUPPORTED.");
            return;
          }

          const notification = new Notification({
            title: "Sri Gayatri Vilas",
            body: "A new customer order has been received."
          });

          notification.on("show", () => {
            console.log("WINDOW NOTIFICATION DISPLAYED.");
          });

          notification.on("failed", (_event, error) => {
            console.error("WINDOW NOTIFICATION FAILED:", error);
          });

          notification.on("click", async () => {
            console.log("Notification clicked. Opening admin portal...");
            try {
              await shell.openExternal("http://localhost:3000/admin?section=Orders");
              console.log("Admin portal opened.");
            } catch (error) {
              console.error("Admin portal opening failed:", error);
            }
          });

          notification.show();
          console.log("NOTIFICATION SHOW REQUEST SENT.");
        } catch (error) {
          console.error("NOTIFICATION CREATION ERROR:", error);
        }
      }
    )
    .subscribe((status, error) => {
      console.log("SUPABASE REALTIME STATUS:", status);

      if (error) {
        console.error("SUPABASE REALTIME ERROR:", error);
      }

      if (win && !win.isDestroyed()) {
        win.webContents.send("orders:connection", status);
      }
    });
}
async function checkExistingSession() {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;

  if (user && await verifyAdmin(user.id, data.session.access_token)) {
    startListening();
    return { loggedIn: true, email: user.email };
  }

  await supabase.auth.signOut();
  return { loggedIn: false };
}

ipcMain.handle("auth:login", async (_event, email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) return { success: false, message: error.message };
    console.log("LOGIN SESSION:", !!data.session);
    console.log("LOGIN USER:", data.user?.id);

    if (!await verifyAdmin(data.user.id, data.session.access_token)) {
      await supabase.auth.signOut();
      return { success: false, message: "This account is not an authorized administrator." };
    }

    startListening();
    return { success: true, email: data.user.email };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle("portal:open", async () => {
  await shell.openExternal("http://localhost:3000/admin?section=Orders");
  return { success: true };
});

ipcMain.handle("auth:logout", async () => {
  stopListening();
  await supabase.auth.signOut();
  return { success: true };
});

ipcMain.handle("auth:status", checkExistingSession);

app.whenReady().then(async () => {
  app.setAppUserModelId("com.srigayatrivilas.desktop");
  if (!safeStorage.isAsyncEncryptionAvailable()) {
    app.quit();
    return;
  }

  createSupabase();

  win = new BrowserWindow({
    width: 430,
    height: 560,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  await win.loadFile(path.join(__dirname, "index.html"));
  await checkExistingSession();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("before-quit", () => stopListening());
app.on("window-all-closed", () => app.quit());















