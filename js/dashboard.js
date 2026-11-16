// Role configurations matching Figures 6, 7, and 8 in the Hope, Inc. ERP Student Guide
const ROLE_PROFILES = {
  Superadmin: {
    name: 'Michael',
    badgeClass: '',
    subtext: 'You have full system access. You can manage all modules and assign roles to any user.',
    modules: ['dashboard', 'customers', 'products', 'hr', 'sales', 'reports'],
    adminModules: ['users', 'settings'],
    quickActions: [
      { label: 'View Customers', href: 'customers.html', enabled: true },
      { label: 'Manage Products', href: 'products.html', enabled: true },
      { label: 'Human Resources', href: 'hr.html', enabled: true },
      { label: 'Sales Pipeline', href: 'sales.html', enabled: true },
      { label: 'Manage Users', href: 'users.html', enabled: true },
      { label: 'System Settings', href: 'settings.html', enabled: true }
    ]
  },
  Admin: {
    name: 'Lisa',
    badgeClass: 'admin',
    subtext: 'You can manage most modules and user rights (except Superadmin accounts).',
    modules: ['dashboard', 'customers', 'products', 'hr', 'sales', 'reports'],
    adminModules: ['users'],
    quickActions: [
      { label: 'View Customers', href: 'customers.html', enabled: true },
      { label: 'Manage Products', href: 'products.html', enabled: true },
      { label: 'Human Resources', href: 'hr.html', enabled: true },
      { label: 'Sales Pipeline', href: 'sales.html', enabled: true },
      { label: 'Manage Users', href: 'users.html', enabled: true }
    ]
  },
  User: {
    name: 'Alex',
    badgeClass: 'user',
    subtext: 'You have access to the core modules assigned to you. Contact an Admin for elevated permissions.',
    // Simulates Alex's granted rights (HR is ungranted)
    modules: ['dashboard', 'customers', 'products', 'sales'],
    adminModules: [],
    quickActions: [
      { label: 'View Customers', href: 'customers.html', enabled: true },
      { label: 'Manage Products', href: 'products.html', enabled: true },
      { label: 'Human Resources 🔒', href: '#', enabled: false },
      { label: 'Sales Pipeline', href: 'sales.html', enabled: true }
    ]
  }
};

const NAV_ITEMS = {
  dashboard: { label: 'Dashboard', href: 'dashboard.html', active: true },
  customers: { label: 'Customers', href: 'customers.html' },
  products: { label: 'Products', href: 'products.html' },
  hr: { label: 'Human Resources', href: 'hr.html' },
  sales: { label: 'Sales', href: 'sales.html' },
  reports: { label: 'Reports', href: 'reports.html' },
  users: { label: 'User Management', href: 'users.html' },
  settings: { label: 'System Settings', href: 'settings.html' }
};

function renderDashboard(roleKey) {
  const profile = ROLE_PROFILES[roleKey] || ROLE_PROFILES.Superadmin;

  // 1. Update Top Badge & Banner
  const badge = document.getElementById('role-badge');
  badge.textContent = roleKey.toUpperCase();
  badge.className = `role-badge ${profile.badgeClass}`;

  document.getElementById('welcome-heading').textContent = `Welcome back, ${profile.name}!`;
  document.getElementById('welcome-subtext').textContent = profile.subtext;

  // 2. Render Sidebar
  const sidebarNav = document.getElementById('sidebar-nav');
  let navHTML = '';

  // Dashboard link
  navHTML += `<a href="${NAV_ITEMS.dashboard.href}" class="nav-item active">${NAV_ITEMS.dashboard.label}</a>`;

  // Core Modules
  navHTML += `<div class="nav-section-label">Modules</div>`;
  profile.modules
    .filter((key) => key !== 'dashboard')
    .forEach((key) => {
      const item = NAV_ITEMS[key];
      navHTML += `<a href="${item.href}" class="nav-item">${item.label}</a>`;
    });

  // Administration Section (Only if Admin or Superadmin)
  if (profile.adminModules.length > 0) {
    navHTML += `<div class="nav-section-label">Administration</div>`;
    profile.adminModules.forEach((key) => {
      const item = NAV_ITEMS[key];
      navHTML += `<a href="${item.href}" class="nav-item">${item.label}</a>`;
    });
  }

  sidebarNav.innerHTML = navHTML;

  // 3. Render Quick Actions
  const quickActionsGrid = document.getElementById('quick-actions-grid');
  quickActionsGrid.innerHTML = profile.quickActions
    .map(
      (action) => `
      <a href="${action.href}" class="action-card ${action.enabled ? '' : 'disabled'}">
        ${action.label}
      </a>
    `
    )
    .join('');
}

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
  const roleSwitcher = document.getElementById('role-switcher');
  const savedRole = localStorage.getItem('hope_erp_role') || 'Superadmin';

  roleSwitcher.value = savedRole;
  renderDashboard(savedRole);

  roleSwitcher.addEventListener('change', (e) => {
    const selectedRole = e.target.value;
    localStorage.setItem('hope_erp_role', selectedRole);
    renderDashboard(selectedRole);
  });

  document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('hope_erp_role');
    window.location.href = 'login.html';
  });
});