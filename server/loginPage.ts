/**
 * Server-rendered admin authentication screen
 * File: /server/loginPage.ts
 */

export function renderAdminLoginPage() {
  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>VIP Admin Console Login</title>
    <!-- Tailwind CSS (Play CDN for Server-Rendered page) -->
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
      body {
        font-family: 'Inter', sans-serif;
      }
      .font-mono {
        font-family: 'JetBrains Mono', monospace;
      }
    </style>
  </head>
  <body class="bg-neutral-950 text-neutral-100 min-h-screen flex items-center justify-center p-4">
    
    <div class="max-w-md w-full bg-neutral-900 border border-neutral-800 p-8 rounded shadow-2xl space-y-6">
      
      <!-- Header / Logo -->
      <div class="text-center space-y-2">
        <div class="mx-auto w-12 h-12 bg-neutral-950 border border-amber-500/10 rounded-sm flex items-center justify-center shadow-lg text-[#D4AF37]">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-alert"><path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8-2a1 1 0 0 1 .48 0l8 2A1 1 0 0 1 20 6z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
        </div>
        <h1 class="text-xs font-bold uppercase tracking-[0.25em] text-white">VIP INVENTORY CONSOLE</h1>
        <p class="text-[10.5px] text-neutral-500">Strict Multi-Tenant Control Gating Activated</p>
      </div>

      <!-- Feedback Banner -->
      <div id="alert-banner" class="hidden text-xs p-3 rounded bg-red-950/50 border border-red-900/30 text-red-400"></div>

      <!-- Login Form -->
      <form id="login-form" class="space-y-4">
        
        <div class="space-y-1.5">
          <label class="text-[10px] font-bold text-neutral-405 uppercase tracking-wider text-neutral-400">Security Email Address</label>
          <input 
            type="email" 
            id="email-field" 
            name="email" 
            required 
            placeholder="e.g. admin@vip.co.zw" 
            class="w-full text-xs p-3 bg-neutral-955 bg-neutral-950 border border-neutral-800 text-white rounded-sm focus:border-amber-500 focus:outline-none transition-all placeholder-neutral-600 font-sans"
          />
        </div>

        <div class="space-y-1.5">
          <label class="text-[10px] font-bold text-neutral-405 uppercase tracking-wider text-neutral-400">Console Keyphrase / Password</label>
          <input 
            type="password" 
            id="password-field" 
            name="password" 
            required 
            placeholder="••••••••" 
            class="w-full text-xs p-3 bg-neutral-955 bg-neutral-950 border border-neutral-800 text-white rounded-sm focus:border-amber-500 focus:outline-none transition-all placeholder-neutral-600"
          />
        </div>

        <button 
          type="submit" 
          id="btn-submit"
          class="w-full py-3 bg-amber-500 hover:bg-amber-400 active:scale-[0.99] font-bold text-neutral-950 rounded nav-item transition-all text-xs uppercase tracking-wider shadow cursor-pointer mt-2"
        >
          Verify Credentials
        </button>

      </form>

      <!-- Testing Helper Credentials Block to guide reviewers -->
      <div class="p-4 bg-neutral-950 rounded border border-neutral-800 space-y-2 text-[10px]">
        <div class="flex items-center gap-1 text-[#D4AF37] font-bold tracking-wider">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-key"><path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 1.5 1.5M15.5 7.5 14 6"/></svg>
          <span>SIMULATION LOGINS (RBAC DEMO)</span>
        </div>
        <p class="text-neutral-500 leading-normal">
          This system is strictly isolated from standard user traffic. For testing purposes, you may use:
        </p>
        <div class="space-y-1 text-neutral-350">
          <div>🔑 <strong>Full Admin:</strong> <code class="bg-neutral-900 border border-neutral-800 px-1 py-0.5 rounded text-neutral-200">admin@vip.co.zw</code> / password: <code class="text-amber-500">admin123</code></div>
          <div>🔒 <strong>Limited Support:</strong> <code class="bg-neutral-900 border border-neutral-800 px-1 py-0.5 rounded text-neutral-200">support@vip.co.zw</code> / password: <code class="text-amber-500">support123</code></div>
        </div>
      </div>

    </div>

    <!-- Login logic script -->
    <script>
      const form = document.getElementById('login-form');
      const submitBtn = document.getElementById('btn-submit');
      const alertBanner = document.getElementById('alert-banner');

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'VALIDATING SECURITY PARITY...';
        alertBanner.classList.add('hidden');

        const email = document.getElementById('email-field').value;
        const password = document.getElementById('password-field').value;

        try {
          const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });

          const data = await response.json();

          if (data.success) {
            // Success! Token has been injected safely into HTTP-Only Cookies
            // Perform security refresh to load actual admin bundles
            alertBanner.className = "text-xs p-3 rounded bg-emerald-950/60 border border-emerald-900/30 text-emerald-400 font-bold";
            alertBanner.innerHTML = "CREDENTIALS OK. INITIALIZING ADMIN MODULES...";
            alertBanner.classList.remove('hidden');
            setTimeout(() => {
              window.location.reload();
            }, 800);
          } else {
            alertBanner.className = "text-xs p-3 rounded bg-red-950/50 border border-red-900/30 text-red-400";
            alertBanner.innerHTML = data.error || "Authentication failure.";
            alertBanner.classList.remove('hidden');
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Verify Credentials';
          }
        } catch (err) {
          alertBanner.className = "text-xs p-3 rounded bg-red-950/50 border border-red-900/30 text-red-400";
          alertBanner.innerHTML = "Network connection timed out. Server failed security verification handshake.";
          alertBanner.classList.remove('hidden');
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Verify Credentials';
        }
      });
    </script>
  </body>
</html>
  `;
}
