// Seed data matching Figures 11-14 of Hope, Inc. ERP Student Guide
let productsData = [
  { prodCode: 'P-001', description: 'Industrial Widget A', unit: 'pcs', status: 'Active', stamp: 'CREATED system 2026-10-01 9:00 AM' },
  { prodCode: 'P-002', description: 'Steel Bracket Heavy', unit: 'pcs', status: 'Active', stamp: 'CREATED system 2026-10-02 10:00 AM' },
  { prodCode: 'P-003', description: 'Lubricant Oil 5L', unit: 'can', status: 'Active', stamp: 'EDITED user1 2026-10-13 1:01 PM' },
  { prodCode: 'P-004', description: 'Safety Gloves XL', unit: 'pair', status: 'Inactive', stamp: 'DELETED user2 2026-10-13 1:01 PM' },
  { prodCode: 'P-005', description: 'Copper Wire 2.5mm', unit: 'meter', status: 'Active', stamp: 'CREATED system 2026-10-05 3:00 PM' }
];

let priceHistData = [
  { id: 1, prodCode: 'P-001', effDate: '2026-01-15', unitPrice: 12.50, status: 'Active', stamp: 'CREATED system 2026-01-15 9:00 AM' },
  { id: 2, prodCode: 'P-001', effDate: '2026-10-01', unitPrice: 13.75, status: 'Active', stamp: 'CREATED system 2026-10-01 9:00 AM' },
  { id: 3, prodCode: 'P-002', effDate: '2026-10-02', unitPrice: 48.50, status: 'Active', stamp: 'CREATED system 2026-10-02 10:00 AM' },
  { id: 4, prodCode: 'P-003', effDate: '2026-02-01', unitPrice: 28.00, status: 'Active', stamp: 'CREATED system 2026-02-01 10:00 AM' },
  { id: 5, prodCode: 'P-005', effDate: '2026-10-05', unitPrice: 2.35, status: 'Active', stamp: 'CREATED system 2026-10-05 3:00 PM' }
];

let prodFilter = 'Active';
let prodSearch = '';
let editingProdCode = null;

// Price History Modal State
let activePriceProdCode = null;
let priceFilter = 'Active';
let editingPriceId = null;

// Derived value: latest Active price whose effDate <= today (Section 3.4)
function getCurrentPrice(prodCode) {
  const today = new Date().toISOString().split('T')[0];
  const validPrices = priceHistData
    .filter((p) => p.prodCode === prodCode && p.status === 'Active' && p.effDate <= today)
    .sort((a, b) => b.effDate.localeCompare(a.effDate));

  return validPrices.length > 0 ? `$${validPrices[0].unitPrice.toFixed(2)}` : '—';
}

function generateNextProdCode() {
  const maxNum = productsData.reduce((max, p) => {
    const num = parseInt(p.prodCode.replace('P-', ''), 10);
    return num > max ? num : max;
  }, 0);
  return `P-${String(maxNum + 1).padStart(3, '0')}`;
}

function renderProductsTable() {
  const adminView = isAdminOrSuperadmin();

  document.getElementById('prod-status-tabs').style.display = adminView ? 'inline-flex' : 'none';
  document.querySelectorAll('.admin-only-col').forEach((el) => {
    el.style.display = adminView ? '' : 'none';
  });

  const activeCount = productsData.filter((p) => p.status === 'Active').length;
  const inactiveCount = productsData.filter((p) => p.status === 'Inactive').length;
  document.getElementById('prod-tab-active').textContent = `Active (${activeCount})`;
  document.getElementById('prod-tab-inactive').textContent = `Inactive (${inactiveCount})`;
  document.getElementById('prod-tab-all').textContent = `All (${productsData.length})`;

  const effectiveFilter = adminView ? prodFilter : 'Active';
  const filtered = productsData.filter((p) => {
    const matchesStatus = effectiveFilter === 'All' || p.status === effectiveFilter;
    const q = prodSearch.toLowerCase();
    const matchesSearch =
      p.prodCode.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.unit.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const tbody = document.getElementById('products-tbody');
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="${adminView ? 7 : 5}" style="text-align:center;color:var(--muted);padding:24px;">No matching product records found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map((p) => {
      const isInactive = p.status === 'Inactive';
      const currentPrice = getCurrentPrice(p.prodCode);
      const statusBadge = isInactive
        ? `<span class="badge badge-inactive">Inactive</span>`
        : `<span class="badge badge-active">Active</span>`;

      const actionButtons = isInactive
        ? `<button class="btn btn-restore btn-sm" onclick="restoreProduct('${p.prodCode}')">Restore</button>`
        : `<button class="btn btn-ghost btn-sm" onclick="openPriceModal('${p.prodCode}')">Prices</button>
           <button class="btn btn-ghost btn-sm" onclick="openEditProductModal('${p.prodCode}')">Edit</button>
           <button class="btn btn-danger btn-sm" onclick="softDeleteProduct('${p.prodCode}')">Delete</button>`;

      return `
        <tr class="${isInactive ? 'row-inactive' : ''}">
          <td><strong>${p.prodCode}</strong></td>
          <td>${p.description}</td>
          <td>${p.unit}</td>
          <td><strong>${currentPrice}</strong></td>
          ${adminView ? `<td>${statusBadge}</td><td class="stamp-text">${p.stamp}</td>` : ''}
          <td><div class="actions-cell">${actionButtons}</div></td>
        </tr>
      `;
    })
    .join('');

  if (activePriceProdCode) renderPriceTable();
}

// Product CRUD
function openAddProductModal() {
  editingProdCode = null;
  document.getElementById('prod-modal-title').textContent = 'Add Product';
  document.getElementById('prodCode').value = generateNextProdCode();
  document.getElementById('prodDesc').value = '';
  document.getElementById('prodUnit').value = 'pcs';
  document.getElementById('product-modal').classList.add('open');
}

function openEditProductModal(prodCode) {
  const prod = productsData.find((p) => p.prodCode === prodCode);
  if (!prod) return;
  editingProdCode = prodCode;
  document.getElementById('prod-modal-title').textContent = `Edit Product — ${prodCode}`;
  document.getElementById('prodCode').value = prod.prodCode;
  document.getElementById('prodDesc').value = prod.description;
  document.getElementById('prodUnit').value = prod.unit;
  document.getElementById('product-modal').classList.add('open');
}

function softDeleteProduct(prodCode) {
  const prod = productsData.find((p) => p.prodCode === prodCode);
  if (!prod) return;
  prod.status = 'Inactive';
  prod.stamp = getFormattedStamp('DELETED');
  renderProductsTable();
}

function restoreProduct(prodCode) {
  const prod = productsData.find((p) => p.prodCode === prodCode);
  if (!prod) return;
  prod.status = 'Active';
  prod.stamp = getFormattedStamp('RESTORED');
  renderProductsTable();
}

// Price History Modal & CRUD
function openPriceModal(prodCode) {
  const prod = productsData.find((p) => p.prodCode === prodCode);
  if (!prod) return;
  activePriceProdCode = prodCode;
  priceFilter = 'Active';
  editingPriceId = null;

  document.getElementById('price-modal-title').textContent = `Price History — ${prod.prodCode}`;
  document.getElementById('price-modal-subtitle').textContent = `${prod.description} · Unit: ${prod.unit}`;
  document.getElementById('price-entry-form').style.display = 'none';

  document.querySelectorAll('#price-status-tabs .filter-tab').forEach((t) => {
    t.classList.toggle('active', t.dataset.pfilter === 'Active');
  });

  renderPriceTable();
  document.getElementById('price-modal').classList.add('open');
}

function renderPriceTable() {
  const adminView = isAdminOrSuperadmin();
  document.getElementById('price-status-tabs').style.display = adminView ? 'inline-flex' : 'none';

  const effectiveFilter = adminView ? priceFilter : 'Active';
  const rows = priceHistData
    .filter((p) => p.prodCode === activePriceProdCode && (effectiveFilter === 'All' || p.status === effectiveFilter))
    .sort((a, b) => b.effDate.localeCompare(a.effDate));

  const tbody = document.getElementById('price-tbody');
  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="${adminView ? 5 : 3}" style="text-align:center;color:var(--muted);padding:20px;">No price records found.</td></tr>`;
    return;
  }

  tbody.innerHTML = rows
    .map((r) => {
      const isInactive = r.status === 'Inactive';
      const statusBadge = isInactive
        ? `<span class="badge badge-inactive">Inactive</span>`
        : `<span class="badge badge-active">Active</span>`;

      const actions = isInactive
        ? `<button class="btn btn-restore btn-sm" onclick="restorePrice(${r.id})">Restore</button>`
        : `<button class="btn btn-ghost btn-sm" onclick="editPrice(${r.id})">Edit</button>
           <button class="btn btn-danger btn-sm" onclick="deletePrice(${r.id})">Delete</button>`;

      return `
        <tr class="${isInactive ? 'row-inactive' : ''}">
          <td>${r.effDate}</td>
          <td><strong>$${r.unitPrice.toFixed(2)}</strong></td>
          ${adminView ? `<td>${statusBadge}</td><td class="stamp-text">${r.stamp}</td>` : ''}
          <td><div class="actions-cell">${actions}</div></td>
        </tr>
      `;
    })
    .join('');
}

function editPrice(id) {
  const row = priceHistData.find((p) => p.id === id);
  if (!row) return;
  editingPriceId = id;
  document.getElementById('priceEffDate').value = row.effDate;
  document.getElementById('priceAmount').value = row.unitPrice;
  document.getElementById('price-entry-form').style.display = 'block';
}

function deletePrice(id) {
  const row = priceHistData.find((p) => p.id === id);
  if (!row) return;
  row.status = 'Inactive';
  row.stamp = getFormattedStamp('DELETED');
  renderProductsTable();
}

function restorePrice(id) {
  const row = priceHistData.find((p) => p.id === id);
  if (!row) return;
  row.status = 'Active';
  row.stamp = getFormattedStamp('RESTORED');
  renderProductsTable();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  initAppShell('products', renderProductsTable);
  renderProductsTable();

  document.querySelectorAll('#prod-status-tabs .filter-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#prod-status-tabs .filter-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      prodFilter = tab.dataset.filter;
      renderProductsTable();
    });
  });

  document.getElementById('prod-search').addEventListener('input', (e) => {
    prodSearch = e.target.value;
    renderProductsTable();
  });

  // Product Modal
  document.getElementById('btn-add-product').addEventListener('click', openAddProductModal);
  document.getElementById('btn-close-prod-modal').addEventListener('click', () => document.getElementById('product-modal').classList.remove('open'));
  document.getElementById('btn-cancel-prod-modal').addEventListener('click', () => document.getElementById('product-modal').classList.remove('open'));

  document.getElementById('product-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const prodCode = document.getElementById('prodCode').value;
    const description = document.getElementById('prodDesc').value.trim();
    const unit = document.getElementById('prodUnit').value;

    if (editingProdCode) {
      const target = productsData.find((p) => p.prodCode === editingProdCode);
      if (target) {
        target.description = description;
        target.unit = unit;
        target.stamp = getFormattedStamp('EDITED');
      }
    } else {
      productsData.push({ prodCode, description, unit, status: 'Active', stamp: getFormattedStamp('CREATED') });
    }
    document.getElementById('product-modal').classList.remove('open');
    renderProductsTable();
  });

  // Price History Modal Controls
  document.getElementById('btn-close-price-modal').addEventListener('click', () => {
    activePriceProdCode = null;
    document.getElementById('price-modal').classList.remove('open');
  });

  document.querySelectorAll('#price-status-tabs .filter-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#price-status-tabs .filter-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      priceFilter = tab.dataset.pfilter;
      renderPriceTable();
    });
  });

  document.getElementById('btn-toggle-price-form').addEventListener('click', () => {
    editingPriceId = null;
    document.getElementById('priceEffDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('priceAmount').value = '';
    document.getElementById('price-entry-form').style.display = 'block';
  });

  document.getElementById('btn-cancel-price-entry').addEventListener('click', () => {
    document.getElementById('price-entry-form').style.display = 'none';
  });

  document.getElementById('price-entry-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const effDate = document.getElementById('priceEffDate').value;
    const unitPrice = parseFloat(document.getElementById('priceAmount').value);

    if (editingPriceId) {
      const target = priceHistData.find((p) => p.id === editingPriceId);
      if (target) {
        target.effDate = effDate;
        target.unitPrice = unitPrice;
        target.stamp = getFormattedStamp('EDITED');
      }
    } else {
      const nextId = priceHistData.reduce((max, p) => (p.id > max ? p.id : max), 0) + 1;
      priceHistData.push({
        id: nextId,
        prodCode: activePriceProdCode,
        effDate,
        unitPrice,
        status: 'Active',
        stamp: getFormattedStamp('CREATED')
      });
    }

    document.getElementById('price-entry-form').style.display = 'none';
    renderProductsTable();
  });
});