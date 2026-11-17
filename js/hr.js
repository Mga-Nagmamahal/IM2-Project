// Seed data matching Figures 15-22 of Hope, Inc. ERP Student Guide
let employeesData = [
  { empNo: 'E-001', lastName: 'Santos', firstName: 'Maria', gender: 'F', birthDate: '1990-05-12', hireDate: '2020-03-01', sepDate: '', status: 'Active', stamp: 'CREATED system 2026-01-15 10:00 AM' },
  { empNo: 'E-002', lastName: 'Reyes', firstName: 'Juan', gender: 'M', birthDate: '1988-11-03', hireDate: '2019-07-15', sepDate: '', status: 'Active', stamp: 'EDITED user1 2026-10-13 1:01 PM' },
  { empNo: 'E-003', lastName: 'Cruz', firstName: 'Ana', gender: 'F', birthDate: '1995-02-20', hireDate: '2021-01-10', sepDate: '', status: 'Active', stamp: 'CREATED system 2026-02-01 9:00 AM' },
  { empNo: 'E-004', lastName: 'Garcia', firstName: 'Pedro', gender: 'M', birthDate: '1985-08-30', hireDate: '2018-05-01', sepDate: '2025-12-31', status: 'Inactive', stamp: 'DELETED user2 2026-10-13 1:01 PM' }
];

let jobsData = [
  { jobCode: 'J-001', jobDesc: 'Software Engineer', status: 'Active', stamp: 'CREATED system 2026-01-01 9:00 AM' },
  { jobCode: 'J-002', jobDesc: 'Sales Manager', status: 'Active', stamp: 'CREATED system 2026-01-01 9:00 AM' },
  { jobCode: 'J-003', jobDesc: 'HR Specialist', status: 'Active', stamp: 'EDITED user1 2026-10-13 1:01 PM' },
  { jobCode: 'J-004', jobDesc: 'Accountant', status: 'Inactive', stamp: 'DELETED user2 2026-10-13 1:01 PM' }
];

let deptsData = [
  { deptCode: 'D-001', deptName: 'Engineering', status: 'Active', stamp: 'CREATED system 2026-01-01 9:00 AM' },
  { deptCode: 'D-002', deptName: 'Sales', status: 'Active', stamp: 'CREATED system 2026-01-01 9:00 AM' },
  { deptCode: 'D-003', deptName: 'Human Resources', status: 'Active', stamp: 'CREATED system 2026-01-01 9:00 AM' },
  { deptCode: 'D-004', deptName: 'Finance', status: 'Inactive', stamp: 'DELETED user2 2026-10-13 1:01 PM' }
];

let jobHistoryData = [
  { id: 1, empNo: 'E-001', effDate: '2023-01-01', jobCode: 'J-001', deptCode: 'D-001', salary: 52000, status: 'Active', stamp: 'EDITED user1 2026-10-13 1:01 PM' },
  { id: 2, empNo: 'E-001', effDate: '2020-03-01', jobCode: 'J-001', deptCode: 'D-001', salary: 45000, status: 'Active', stamp: 'CREATED system 2020-03-01 9:00 AM' },
  { id: 3, empNo: 'E-002', effDate: '2019-07-15', jobCode: 'J-002', deptCode: 'D-002', salary: 48000, status: 'Active', stamp: 'CREATED system 2019-07-15 9:00 AM' },
  { id: 4, empNo: 'E-003', effDate: '2021-01-10', jobCode: 'J-003', deptCode: 'D-003', salary: 40000, status: 'Active', stamp: 'CREATED system 2021-01-10 9:00 AM' }
];

// Filter & Modal States
let empFilter = 'Active', empSearch = '', editingEmpNo = null;
let jobFilter = 'Active', jobSearch = '';
let deptFilter = 'Active', deptSearch = '';
let lookupMode = null, editingLookupCode = null;
let activeHistEmpNo = null, histFilter = 'Active', editingHistId = null;

function nextId(arr, key, prefix) {
  const max = arr.reduce((m, item) => {
    const n = parseInt(item[key].replace(prefix, ''), 10);
    return n > m ? n : m;
  }, 0);
  return `${prefix}${String(max + 1).padStart(3, '0')}`;
}

function renderAllHR() {
  const adminView = isAdminOrSuperadmin();
  document.querySelectorAll('.admin-only-col').forEach((el) => (el.style.display = adminView ? '' : 'none'));
  ['emp-status-tabs', 'job-status-tabs', 'dept-status-tabs', 'hist-status-tabs'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = adminView ? 'inline-flex' : 'none';
  });

  renderEmployees(adminView);
  renderJobs(adminView);
  renderDepartments(adminView);
  if (activeHistEmpNo) renderHistoryTable(adminView);
}

// 1. RENDER EMPLOYEES
function renderEmployees(adminView) {
  document.getElementById('etab-active').textContent = `Active (${employeesData.filter((e) => e.status === 'Active').length})`;
  document.getElementById('etab-inactive').textContent = `Inactive (${employeesData.filter((e) => e.status === 'Inactive').length})`;
  document.getElementById('etab-all').textContent = `All (${employeesData.length})`;

  const filter = adminView ? empFilter : 'Active';
  const q = empSearch.toLowerCase();
  const rows = employeesData.filter((e) => {
    const matchStatus = filter === 'All' || e.status === filter;
    const matchQ = `${e.empNo} ${e.lastName} ${e.firstName}`.toLowerCase().includes(q);
    return matchStatus && matchQ;
  });

  const tbody = document.getElementById('emp-tbody');
  tbody.innerHTML = rows.length
    ? rows
        .map((e) => {
          const inactive = e.status === 'Inactive';
          const badge = inactive ? `<span class="badge badge-inactive">Inactive</span>` : `<span class="badge badge-active">Active</span>`;
          const actions = inactive
            ? `<button class="btn btn-restore btn-sm" onclick="toggleStatus('emp','${e.empNo}','Active')">Restore</button>`
            : `<button class="btn btn-ghost btn-sm" onclick="openHistoryModal('${e.empNo}')">History</button>
               <button class="btn btn-ghost btn-sm" onclick="openEmpModal('${e.empNo}')">Edit</button>
               <button class="btn btn-danger btn-sm" onclick="toggleStatus('emp','${e.empNo}','Inactive')">Delete</button>`;

          return `
            <tr class="${inactive ? 'row-inactive' : ''}">
              <td><strong>${e.empNo}</strong></td>
              <td>${e.lastName}</td>
              <td>${e.firstName}</td>
              <td>${e.gender}</td>
              <td>${e.birthDate}</td>
              <td>${e.hireDate}</td>
              <td>${e.sepDate || '—'}</td>
              ${adminView ? `<td>${badge}</td><td class="stamp-text">${e.stamp}</td>` : ''}
              <td><div class="actions-cell">${actions}</div></td>
            </tr>`;
        })
        .join('')
    : `<tr><td colspan="${adminView ? 10 : 8}" style="text-align:center;color:var(--muted);padding:24px;">No employees found.</td></tr>`;
}

// 2. RENDER JOBS
function renderJobs(adminView) {
  document.getElementById('jtab-active').textContent = `Active (${jobsData.filter((j) => j.status === 'Active').length})`;
  document.getElementById('jtab-inactive').textContent = `Inactive (${jobsData.filter((j) => j.status === 'Inactive').length})`;
  document.getElementById('jtab-all').textContent = `All (${jobsData.length})`;

  const filter = adminView ? jobFilter : 'Active';
  const q = jobSearch.toLowerCase();
  const rows = jobsData.filter((j) => (filter === 'All' || j.status === filter) && `${j.jobCode} ${j.jobDesc}`.toLowerCase().includes(q));

  document.getElementById('job-tbody').innerHTML = rows.length
    ? rows
        .map((j) => {
          const inactive = j.status === 'Inactive';
          const badge = inactive ? `<span class="badge badge-inactive">Inactive</span>` : `<span class="badge badge-active">Active</span>`;
          const actions = inactive
            ? `<button class="btn btn-restore btn-sm" onclick="toggleStatus('job','${j.jobCode}','Active')">Restore</button>`
            : `<button class="btn btn-ghost btn-sm" onclick="openLookupModal('job','${j.jobCode}')">Edit</button>
               <button class="btn btn-danger btn-sm" onclick="toggleStatus('job','${j.jobCode}','Inactive')">Delete</button>`;
          return `
            <tr class="${inactive ? 'row-inactive' : ''}">
              <td><strong>${j.jobCode}</strong></td>
              <td>${j.jobDesc}</td>
              ${adminView ? `<td>${badge}</td><td class="stamp-text">${j.stamp}</td>` : ''}
              <td><div class="actions-cell">${actions}</div></td>
            </tr>`;
        })
        .join('')
    : `<tr><td colspan="${adminView ? 5 : 3}" style="text-align:center;color:var(--muted);padding:24px;">No jobs found.</td></tr>`;
}

// 3. RENDER DEPARTMENTS
function renderDepartments(adminView) {
  document.getElementById('dtab-active').textContent = `Active (${deptsData.filter((d) => d.status === 'Active').length})`;
  document.getElementById('dtab-inactive').textContent = `Inactive (${deptsData.filter((d) => d.status === 'Inactive').length})`;
  document.getElementById('dtab-all').textContent = `All (${deptsData.length})`;

  const filter = adminView ? deptFilter : 'Active';
  const q = deptSearch.toLowerCase();
  const rows = deptsData.filter((d) => (filter === 'All' || d.status === filter) && `${d.deptCode} ${d.deptName}`.toLowerCase().includes(q));

  document.getElementById('dept-tbody').innerHTML = rows.length
    ? rows
        .map((d) => {
          const inactive = d.status === 'Inactive';
          const badge = inactive ? `<span class="badge badge-inactive">Inactive</span>` : `<span class="badge badge-active">Active</span>`;
          const actions = inactive
            ? `<button class="btn btn-restore btn-sm" onclick="toggleStatus('dept','${d.deptCode}','Active')">Restore</button>`
            : `<button class="btn btn-ghost btn-sm" onclick="openLookupModal('dept','${d.deptCode}')">Edit</button>
               <button class="btn btn-danger btn-sm" onclick="toggleStatus('dept','${d.deptCode}','Inactive')">Delete</button>`;
          return `
            <tr class="${inactive ? 'row-inactive' : ''}">
              <td><strong>${d.deptCode}</strong></td>
              <td>${d.deptName}</td>
              ${adminView ? `<td>${badge}</td><td class="stamp-text">${d.stamp}</td>` : ''}
              <td><div class="actions-cell">${actions}</div></td>
            </tr>`;
        })
        .join('')
    : `<tr><td colspan="${adminView ? 5 : 3}" style="text-align:center;color:var(--muted);padding:24px;">No departments found.</td></tr>`;
}

function toggleStatus(type, code, newStatus) {
  const map = {
    emp: [employeesData, 'empNo'],
    job: [jobsData, 'jobCode'],
    dept: [deptsData, 'deptCode']
  };
  const [arr, key] = map[type];
  const item = arr.find((x) => x[key] === code);
  if (!item) return;
  item.status = newStatus;
  item.stamp = getFormattedStamp(newStatus === 'Inactive' ? 'DELETED' : 'RESTORED');
  renderAllHR();
}

// EMPLOYEE MODAL
function openEmpModal(empNo = null) {
  editingEmpNo = empNo;
  document.getElementById('emp-date-error').textContent = '';
  if (empNo) {
    const e = employeesData.find((x) => x.empNo === empNo);
    document.getElementById('emp-modal-title').textContent = `Edit Employee — ${empNo}`;
    document.getElementById('empNo').value = e.empNo;
    document.getElementById('empFirstName').value = e.firstName;
    document.getElementById('empLastName').value = e.lastName;
    document.getElementById('empGender').value = e.gender;
    document.getElementById('empBirthDate').value = e.birthDate;
    document.getElementById('empHireDate').value = e.hireDate;
    document.getElementById('empSepDate').value = e.sepDate;
  } else {
    document.getElementById('emp-modal-title').textContent = 'Add Employee';
    document.getElementById('empNo').value = nextId(employeesData, 'empNo', 'E-');
    document.getElementById('emp-form').reset();
    document.getElementById('empNo').value = nextId(employeesData, 'empNo', 'E-');
  }
  document.getElementById('emp-modal').classList.add('open');
}

// LOOKUP MODAL (JOB / DEPT)
function openLookupModal(mode, code = null) {
  lookupMode = mode;
  editingLookupCode = code;
  const isJob = mode === 'job';
  document.getElementById('lookup-code-label').textContent = isJob ? 'Job Code' : 'Department Code';
  document.getElementById('lookup-name-label').textContent = isJob ? 'Description' : 'Department Name';

  if (code) {
    const item = isJob ? jobsData.find((j) => j.jobCode === code) : deptsData.find((d) => d.deptCode === code);
    document.getElementById('lookup-modal-title').textContent = `Edit ${isJob ? 'Job' : 'Department'} — ${code}`;
    document.getElementById('lookupCode').value = code;
    document.getElementById('lookupName').value = isJob ? item.jobDesc : item.deptName;
  } else {
    document.getElementById('lookup-modal-title').textContent = `Add ${isJob ? 'Job' : 'Department'}`;
    document.getElementById('lookupCode').value = isJob ? nextId(jobsData, 'jobCode', 'J-') : nextId(deptsData, 'deptCode', 'D-');
    document.getElementById('lookupName').value = '';
  }
  document.getElementById('lookup-modal').classList.add('open');
}

// JOB HISTORY MODAL
function openHistoryModal(empNo) {
  const emp = employeesData.find((e) => e.empNo === empNo);
  if (!emp) return;
  activeHistEmpNo = empNo;
  histFilter = 'Active';
  editingHistId = null;

  document.getElementById('hist-modal-title').textContent = `Job History — ${emp.empNo}`;
  document.getElementById('hist-modal-subtitle').textContent = `${emp.firstName} ${emp.lastName}`;
  document.getElementById('hist-entry-form').style.display = 'none';

  // Populate active Jobs & Departments dropdowns
  document.getElementById('histJobCode').innerHTML = jobsData
    .filter((j) => j.status === 'Active')
    .map((j) => `<option value="${j.jobCode}">${j.jobCode} — ${j.jobDesc}</option>`)
    .join('');

  document.getElementById('histDeptCode').innerHTML = deptsData
    .filter((d) => d.status === 'Active')
    .map((d) => `<option value="${d.deptCode}">${d.deptCode} — ${d.deptName}</option>`)
    .join('');

  renderHistoryTable(isAdminOrSuperadmin());
  document.getElementById('history-modal').classList.add('open');
}

function renderHistoryTable(adminView) {
  const filter = adminView ? histFilter : 'Active';
  const rows = jobHistoryData
    .filter((h) => h.empNo === activeHistEmpNo && (filter === 'All' || h.status === filter))
    .sort((a, b) => b.effDate.localeCompare(a.effDate));

  document.getElementById('hist-tbody').innerHTML = rows.length
    ? rows
        .map((h) => {
          const job = jobsData.find((j) => j.jobCode === h.jobCode);
          const dept = deptsData.find((d) => d.deptCode === h.deptCode);
          const inactive = h.status === 'Inactive';
          const badge = inactive ? `<span class="badge badge-inactive">Inactive</span>` : `<span class="badge badge-active">Active</span>`;
          const actions = inactive
            ? `<button class="btn btn-restore btn-sm" onclick="toggleHistStatus(${h.id},'Active')">Restore</button>`
            : `<button class="btn btn-ghost btn-sm" onclick="editHistory(${h.id})">Edit</button>
               <button class="btn btn-danger btn-sm" onclick="toggleHistStatus(${h.id},'Inactive')">Delete</button>`;

          return `
            <tr class="${inactive ? 'row-inactive' : ''}">
              <td>${h.effDate}</td>
              <td>${h.jobCode} — ${job ? job.jobDesc : ''}</td>
              <td>${h.deptCode} — ${dept ? dept.deptName : ''}</td>
              <td><strong>$${Number(h.salary).toLocaleString()}</strong></td>
              ${adminView ? `<td>${badge}</td><td class="stamp-text">${h.stamp}</td>` : ''}
              <td><div class="actions-cell">${actions}</div></td>
            </tr>`;
        })
        .join('')
    : `<tr><td colspan="${adminView ? 7 : 5}" style="text-align:center;color:var(--muted);padding:20px;">No job history records.</td></tr>`;
}

function editHistory(id) {
  const row = jobHistoryData.find((h) => h.id === id);
  if (!row) return;
  editingHistId = id;
  document.getElementById('histEffDate').value = row.effDate;
  document.getElementById('histSalary').value = row.salary;
  document.getElementById('histJobCode').value = row.jobCode;
  document.getElementById('histDeptCode').value = row.deptCode;
  document.getElementById('hist-entry-form').style.display = 'block';
}

function toggleHistStatus(id, newStatus) {
  const row = jobHistoryData.find((h) => h.id === id);
  if (!row) return;
  row.status = newStatus;
  row.stamp = getFormattedStamp(newStatus === 'Inactive' ? 'DELETED' : 'RESTORED');
  renderHistoryTable(isAdminOrSuperadmin());
}

// INIT & LISTENERS
document.addEventListener('DOMContentLoaded', () => {
  initAppShell('hr', renderAllHR);
  renderAllHR();

  // Sub-tabs switcher
  document.querySelectorAll('.subtab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.subtab-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.hr-panel').forEach((p) => (p.style.display = 'none'));
      document.getElementById(`panel-${btn.dataset.hrtab}`).style.display = 'block';
    });
  });

  // Status filter tabs
  document.querySelectorAll('[data-efilter]').forEach((t) =>
    t.addEventListener('click', () => {
      document.querySelectorAll('[data-efilter]').forEach((x) => x.classList.remove('active'));
      t.classList.add('active');
      empFilter = t.dataset.efilter;
      renderAllHR();
    })
  );
  document.querySelectorAll('[data-jfilter]').forEach((t) =>
    t.addEventListener('click', () => {
      document.querySelectorAll('[data-jfilter]').forEach((x) => x.classList.remove('active'));
      t.classList.add('active');
      jobFilter = t.dataset.jfilter;
      renderAllHR();
    })
  );
  document.querySelectorAll('[data-dfilter]').forEach((t) =>
    t.addEventListener('click', () => {
      document.querySelectorAll('[data-dfilter]').forEach((x) => x.classList.remove('active'));
      t.classList.add('active');
      deptFilter = t.dataset.dfilter;
      renderAllHR();
    })
  );
  document.querySelectorAll('[data-hfilter]').forEach((t) =>
    t.addEventListener('click', () => {
      document.querySelectorAll('[data-hfilter]').forEach((x) => x.classList.remove('active'));
      t.classList.add('active');
      histFilter = t.dataset.hfilter;
      renderHistoryTable(isAdminOrSuperadmin());
    })
  );

  // Searches
  document.getElementById('emp-search').addEventListener('input', (e) => { empSearch = e.target.value; renderAllHR(); });
  document.getElementById('job-search').addEventListener('input', (e) => { jobSearch = e.target.value; renderAllHR(); });
  document.getElementById('dept-search').addEventListener('input', (e) => { deptSearch = e.target.value; renderAllHR(); });

  // Employee Form Submit (Enforces sepDate >= hireDate per Guide §4.2)
  document.getElementById('btn-add-emp').addEventListener('click', () => openEmpModal());
  document.getElementById('btn-close-emp-modal').addEventListener('click', () => document.getElementById('emp-modal').classList.remove('open'));
  document.getElementById('btn-cancel-emp-modal').addEventListener('click', () => document.getElementById('emp-modal').classList.remove('open'));

  document.getElementById('emp-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const hireDate = document.getElementById('empHireDate').value;
    const sepDate = document.getElementById('empSepDate').value;
    if (sepDate && sepDate < hireDate) {
      document.getElementById('emp-date-error').textContent = 'Separation date cannot be earlier than hire date.';
      return;
    }

    const payload = {
      empNo: document.getElementById('empNo').value,
      firstName: document.getElementById('empFirstName').value.trim(),
      lastName: document.getElementById('empLastName').value.trim(),
      gender: document.getElementById('empGender').value,
      birthDate: document.getElementById('empBirthDate').value,
      hireDate,
      sepDate
    };

    if (editingEmpNo) {
      const target = employeesData.find((x) => x.empNo === editingEmpNo);
      Object.assign(target, payload, { stamp: getFormattedStamp('EDITED') });
    } else {
      employeesData.push({ ...payload, status: 'Active', stamp: getFormattedStamp('CREATED') });
    }
    document.getElementById('emp-modal').classList.remove('open');
    renderAllHR();
  });

  // Lookup Form Submit (Jobs & Departments)
  document.getElementById('btn-add-job').addEventListener('click', () => openLookupModal('job'));
  document.getElementById('btn-add-dept').addEventListener('click', () => openLookupModal('dept'));
  document.getElementById('btn-close-lookup-modal').addEventListener('click', () => document.getElementById('lookup-modal').classList.remove('open'));
  document.getElementById('btn-cancel-lookup-modal').addEventListener('click', () => document.getElementById('lookup-modal').classList.remove('open'));

  document.getElementById('lookup-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const code = document.getElementById('lookupCode').value;
    const val = document.getElementById('lookupName').value.trim();

    if (lookupMode === 'job') {
      if (editingLookupCode) {
        const j = jobsData.find((x) => x.jobCode === editingLookupCode);
        j.jobDesc = val;
        j.stamp = getFormattedStamp('EDITED');
      } else {
        jobsData.push({ jobCode: code, jobDesc: val, status: 'Active', stamp: getFormattedStamp('CREATED') });
      }
    } else {
      if (editingLookupCode) {
        const d = deptsData.find((x) => x.deptCode === editingLookupCode);
        d.deptName = val;
        d.stamp = getFormattedStamp('EDITED');
      } else {
        deptsData.push({ deptCode: code, deptName: val, status: 'Active', stamp: getFormattedStamp('CREATED') });
      }
    }
    document.getElementById('lookup-modal').classList.remove('open');
    renderAllHR();
  });

  // Job History Form Submit
  document.getElementById('btn-close-hist-modal').addEventListener('click', () => {
    activeHistEmpNo = null;
    document.getElementById('history-modal').classList.remove('open');
  });
  document.getElementById('btn-toggle-hist-form').addEventListener('click', () => {
    editingHistId = null;
    document.getElementById('histEffDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('histSalary').value = '';
    document.getElementById('hist-entry-form').style.display = 'block';
  });
  document.getElementById('btn-cancel-hist-entry').addEventListener('click', () => {
    document.getElementById('hist-entry-form').style.display = 'none';
  });

  document.getElementById('hist-entry-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const effDate = document.getElementById('histEffDate').value;
    const salary = parseFloat(document.getElementById('histSalary').value);
    const jobCode = document.getElementById('histJobCode').value;
    const deptCode = document.getElementById('histDeptCode').value;

    if (editingHistId) {
      const target = jobHistoryData.find((h) => h.id === editingHistId);
      Object.assign(target, { effDate, salary, jobCode, deptCode, stamp: getFormattedStamp('EDITED') });
    } else {
      const id = jobHistoryData.reduce((m, h) => (h.id > m ? h.id : m), 0) + 1;
      jobHistoryData.push({ id, empNo: activeHistEmpNo, effDate, jobCode, deptCode, salary, status: 'Active', stamp: getFormattedStamp('CREATED') });
    }
    document.getElementById('hist-entry-form').style.display = 'none';
    renderHistoryTable(isAdminOrSuperadmin());
  });
});