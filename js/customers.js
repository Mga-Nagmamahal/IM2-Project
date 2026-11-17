
// Initial seed data matching Figure 9 of Hope, Inc. ERP Student Guide
let customersData = [
  { custNo: 'C-001', custName: 'Acme Corporation', address: '123 Main St, Metro City', payTerms: 'Net 30', status: 'Active', stamp: 'CREATED system 2026-10-01 9:00 AM' },
  { custNo: 'C-002', custName: 'Globex Industries', address: '456 Oak Ave, Harbor Town', payTerms: 'Net 45', status: 'Active', stamp: 'CREATED system 2026-10-02 10:15 AM' },
  { custNo: 'C-003', custName: 'Initech LLC', address: '789 Pine Rd, Silicon Valley', payTerms: 'COD', status: 'Active', stamp: 'EDITED user1 2026-10-13 1:01 PM' },
  { custNo: 'C-004', custName: 'Umbrella Corp', address: '1 Raccoon City Blvd', payTerms: 'Prepaid', status: 'Inactive', stamp: 'DELETED user2 2026-10-13 1:01 PM' },
  { custNo: 'C-005', custName: 'Stark Enterprises', address: '200 Park Avenue, New York', payTerms: 'Net 15', status: 'Active', stamp: 'EDITED user1 2026-10-13 1:01 PM' }
];

let currentFilter = 'Active';
let searchQuery = '';
let editingCustNo = null;

function generateNextCustNo() {
  const maxNum = customersData.reduce((max, c) => {
    const num = parseInt(c.custNo.replace('C-', ''), 10);
    return num > max ? num : max;
  }, 0);
  return `C-${String(maxNum + 1).padStart(3, '0')}`;
}

function renderCustomersTable() {
  const adminView = isAdminOrSuperadmin();

  // 1. Toggle Admin-only UI (Filter tabs & Status/Stamp columns)
  const statusTabs = document.getElementById('status-tabs');
  statusTabs.style.display = adminView ? 'inline-flex' : 'none';

  document.querySelectorAll('.admin-only-col').forEach((el) => {
    el.style.display = adminView ? '' : 'none';
  });

  // Update tab counts
  const activeCount = customersData.filter((c) => c.status === 'Active').length;
  const inactiveCount = customersData.filter((c) => c.status === 'Inactive').length;
  document.getElementById('tab-active').textContent = `Active (${activeCount})`;
  document.getElementById('tab-inactive').textContent = `Inactive (${inactiveCount})`;
  document.getElementById('tab-all').textContent = `All (${customersData.length})`;

  // 2. Filter rows (Users ALWAYS see Active only; Admins follow active tab)
  const effectiveFilter = adminView ? currentFilter : 'Active';
  const filtered = customersData.filter((c) => {
    const matchesStatus = effectiveFilter === 'All' || c.status === effectiveFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      c.custNo.toLowerCase().includes(q) ||
      c.custName.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q) ||
      c.payTerms.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  // 3. Render rows
  const tbody = document.getElementById('customers-tbody');
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="${adminView ? 7 : 5}" style="text-align:center;color:var(--muted);padding:24px;">No matching customer records found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map((c) => {
      const isInactive = c.status === 'Inactive';
      const statusBadge = isInactive
        ? `<span class="badge badge-inactive">Inactive</span>`
        : `<span class="badge badge-active">Active</span>`;

      const actionButtons = isInactive
        ? `<button class="btn btn-restore btn-sm" onclick="restoreCustomer('${c.custNo}')">Restore</button>`
        : `<button class="btn btn-ghost btn-sm" onclick="openEditModal('${c.custNo}')">Edit</button>
           <button class="btn btn-danger btn-sm" onclick="softDeleteCustomer('${c.custNo}')">Delete</button>`;

      return `
        <tr class="${isInactive ? 'row-inactive' : ''}">
          <td><strong>${c.custNo}</strong></td>
          <td>${c.custName}</td>
          <td>${c.address}</td>
          <td>${c.payTerms}</td>
          ${adminView ? `<td>${statusBadge}</td><td class="stamp-text">${c.stamp}</td>` : ''}
          <td><div class="actions-cell">${actionButtons}</div></td>
        </tr>
      `;
    })
    .join('');
}

// CRUD Actions
function openAddModal() {
  editingCustNo = null;
  document.getElementById('modal-title').textContent = 'Add Customer';
  document.getElementById('custNo').value = generateNextCustNo();
  document.getElementById('custName').value = '';
  document.getElementById('address').value = '';
  document.getElementById('payTerms').value = 'Net 30';
  document.getElementById('customer-modal').classList.add('open');
}

function openEditModal(custNo) {
  const customer = customersData.find((c) => c.custNo === custNo);
  if (!customer) return;

  editingCustNo = custNo;
  document.getElementById('modal-title').textContent = `Edit Customer — ${custNo}`;
  document.getElementById('custNo').value = customer.custNo;
  document.getElementById('custName').value = customer.custName;
  document.getElementById('address').value = customer.address;
  document.getElementById('payTerms').value = customer.payTerms;
  document.getElementById('customer-modal').classList.add('open');
}

function closeModal() {
  document.getElementById('customer-modal').classList.remove('open');
}

function softDeleteCustomer(custNo) {
  const customer = customersData.find((c) => c.custNo === custNo);
  if (!customer) return;
  customer.status = 'Inactive';
  customer.stamp = getFormattedStamp('DELETED');
  renderCustomersTable();
}

function restoreCustomer(custNo) {
  const customer = customersData.find((c) => c.custNo === custNo);
  if (!customer) return;
  customer.status = 'Active';
  customer.stamp = getFormattedStamp('RESTORED');
  renderCustomersTable();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initAppShell('customers', renderCustomersTable);
  renderCustomersTable();

  // Filter tabs
  document.querySelectorAll('.filter-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.dataset.filter;
      renderCustomersTable();
    });
  });

  // Search box
  document.getElementById('search-input').addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderCustomersTable();
  });

  // Modal controls
  document.getElementById('btn-add-customer').addEventListener('click', openAddModal);
  document.getElementById('btn-close-modal').addEventListener('click', closeModal);
  document.getElementById('btn-cancel-modal').addEventListener('click', closeModal);

  document.getElementById('customer-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const custNo = document.getElementById('custNo').value;
    const custName = document.getElementById('custName').value.trim();
    const address = document.getElementById('address').value.trim();
    const payTerms = document.getElementById('payTerms').value;

    if (editingCustNo) {
      const target = customersData.find((c) => c.custNo === editingCustNo);
      if (target) {
        target.custName = custName;
        target.address = address;
        target.payTerms = payTerms;
        target.stamp = getFormattedStamp('EDITED');
      }
    } else {
      customersData.push({
        custNo,
        custName,
        address,
        payTerms,
        status: 'Active',
        stamp: getFormattedStamp('CREATED')
      });
    }

    closeModal();
    renderCustomersTable();
  });
});