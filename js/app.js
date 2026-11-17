const ROLE_PROFILES = {
  Superadmin: {
    name: 'Michael',
    badgeClass: 'badge-superadmin',
    modules: ['dashboard', 'customers', 'products', 'hr', 'sales', 'reports'],
    adminModules: ['users', 'settings']
  },
  Admin: {
    name: 'Lisa',
    badgeClass: 'badge-admin',
    modules: ['dashboard', 'customers', 'products', 'hr', 'sales', 'reports'],
    adminModules: ['users']
  },
  User: {
    name: 'Alex',
    badgeClass: 'badge-user',
    modules: ['dashboard', 'customers', 'products', 'sales'],
    adminModules: []
  }
};

const NAV_ITEMS = {
  dashboard: { label: 'Dashboard', href: 'dashboard.html' },
  customers: { label: 'Customers', href: 'customers.html' },
  products: { label: 'Products', href: 'products.html' },
  hr: { label: 'Human Resources', href: 'hr.html' },
  sales: { label: 'Sales', href: 'sales.html' },
  reports: { label: 'Reports', href: 'reports.html' },
  users: { label: 'User Management', href: 'users.html' },
  settings: { label: 'System Settings', href: 'settings.html' }
};

function getCurrentRole() {
  return localStorage.getItem('hope_erp_role') || 'Superadmin';
}

function isAdminOrSuperadmin() {
  const role = getCurrentRole();
  return role === 'Superadmin' || role === 'Admin';
}

function getFormattedStamp(action) {
  const role = getCurrentRole().toLowerCase();
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${action} ${role} ${dateStr} ${timeStr}`;
}

function initAppShell(activeKey, onRoleChangeCallback) {
  const roleKey = getCurrentRole();
  const profile = ROLE_PROFILES[roleKey] || ROLE_PROFILES.Superadmin;

  // 1. Update Topbar Badge
  const badge = document.getElementById('role-badge');
  if (badge) {
    badge.textContent = roleKey.toUpperCase();
    badge.className = `role-badge ${roleKey.toLowerCase()}`;
  }

  // 2. Render Sidebar Navigation
  const sidebarNav = document.getElementById('sidebar-nav');
  if (sidebarNav) {
    let navHTML = `<a href="${NAV_ITEMS.dashboard.href}" class="nav-item ${activeKey === 'dashboard' ? 'active' : ''}">${NAV_ITEMS.dashboard.label}</a>`;
    navHTML += `<div class="nav-section-label">Modules</div>`;

    profile.modules
      .filter((key) => key !== 'dashboard')
      .forEach((key) => {
        const item = NAV_ITEMS[key];
        navHTML += `<a href="${item.href}" class="nav-item ${activeKey === key ? 'active' : ''}">${item.label}</a>`;
      });

    if (profile.adminModules.length > 0) {
      navHTML += `<div class="nav-section-label">Administration</div>`;
      profile.adminModules.forEach((key) => {
        const item = NAV_ITEMS[key];
        navHTML += `<a href="${item.href}" class="nav-item ${activeKey === key ? 'active' : ''}">${item.label}</a>`;
      });
    }
    sidebarNav.innerHTML = navHTML;
  }

  // 3. Wire Role Switcher & Sign Out
  const roleSwitcher = document.getElementById('role-switcher');
  if (roleSwitcher) {
    roleSwitcher.value = roleKey;
    roleSwitcher.onchange = (e) => {
      localStorage.setItem('hope_erp_role', e.target.value);
      initAppShell(activeKey, onRoleChangeCallback);
      if (typeof onRoleChangeCallback === 'function') onRoleChangeCallback();
    };
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      localStorage.removeItem('hope_erp_role');
      window.location.href = 'login.html';
    };
  }
}