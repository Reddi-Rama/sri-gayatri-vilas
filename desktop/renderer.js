const loginSection = document.getElementById("login");
const dashboard = document.getElementById("dashboard");
const message = document.getElementById("message");

function showDashboard(email) {
  loginSection.style.display = "none";
  dashboard.style.display = "block";
  document.getElementById("account").textContent = email || "Administrator";
}

document.getElementById("loginButton").addEventListener("click", async () => {
  message.textContent = "Checking administrator account...";
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    message.textContent = "Enter your email and password.";
    return;
  }

  const result = await window.desktopAPI.login(email, password);
  message.textContent = result.success ? "Login successful." : result.message;

  if (result.success) {
    document.getElementById("password").value = "";
    showDashboard(result.email);
  }
});

document.getElementById("logoutButton").addEventListener("click", async () => {
  await window.desktopAPI.logout();
  dashboard.style.display = "none";
  loginSection.style.display = "block";
  message.textContent = "Logged out.";
});

window.desktopAPI.onConnection((status) => {
  document.getElementById("connection").textContent =
    "Order connection: " + status;
});

(async () => {
  const result = await window.desktopAPI.status();
  if (result.loggedIn) showDashboard(result.email);
})();

document.getElementById("openAdminButton").addEventListener("click", async () => {
  await window.desktopAPI.openAdmin();
});
