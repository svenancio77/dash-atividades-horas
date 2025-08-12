/*
  App de Gestão de OS e Tarefas - Horas Trabalhadas
  - Persistência: localStorage por ID de OS
  - Funções: adicionar/remover tarefas, calcular dias úteis, totais, exportações (placeholders), envio (placeholders)
*/
(function () {
  'use strict';

  // Utilidades de data
  function toDate(value) {
    if (!value) return null;
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  function toISODateString(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function addDays(date, numDays) {
    const d = new Date(date);
    d.setDate(d.getDate() + numDays);
    return d;
  }

  function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  function countBusinessDays(start, end) {
    if (!start || !end) return 0;
    let count = 0;
    const forward = start <= end;
    const d0 = forward ? new Date(start) : new Date(end);
    const d1 = forward ? new Date(end) : new Date(start);
    for (let d = new Date(d0); d <= d1; d = addDays(d, 1)) {
      if (isWeekend(d)) continue;
      if (typeof window.isBrazilHoliday === 'function' && window.isBrazilHoliday(d)) continue;
      count += 1;
    }
    return count;
  }

  // Persistência local
  const STORAGE_KEY_PREFIX = 'os_manager_';

  function buildStorageKey(orderId) {
    return STORAGE_KEY_PREFIX + String(orderId || '').trim();
  }

  function saveOrder(orderId, data) {
    if (!orderId) throw new Error('Informe um ID de OS para salvar.');
    localStorage.setItem(buildStorageKey(orderId), JSON.stringify(data));
  }

  function loadOrder(orderId) {
    if (!orderId) return null;
    const raw = localStorage.getItem(buildStorageKey(orderId));
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  function deleteOrder(orderId) {
    if (!orderId) return;
    localStorage.removeItem(buildStorageKey(orderId));
  }

  // Estado do app
  const state = {
    tasks: [], // { id, responsibleName, department, activity, description, startDate, endDate, businessDays, hours, status }
  };

  // UI refs
  const ui = {};

  function queryRefs() {
    ui.companyLogo = document.getElementById('companyLogo');
    ui.logoPreview = document.getElementById('logoPreview');
    ui.orderId = document.getElementById('orderId');
    ui.companyName = document.getElementById('companyName');

    ui.newOrderBtn = document.getElementById('newOrderBtn');
    ui.saveOrderBtn = document.getElementById('saveOrderBtn');

    ui.taskForm = document.getElementById('taskForm');
    ui.responsibleName = document.getElementById('responsibleName');
    ui.department = document.getElementById('department');
    ui.activity = document.getElementById('activity');
    ui.description = document.getElementById('description');
    ui.startDate = document.getElementById('startDate');
    ui.endDate = document.getElementById('endDate');
    ui.businessDays = document.getElementById('businessDays');
    ui.hours = document.getElementById('hours');
    ui.status = document.getElementById('status');

    ui.clearTasksBtn = document.getElementById('clearTasksBtn');
    ui.tasksTable = document.getElementById('tasksTable');
    ui.tbody = ui.tasksTable.querySelector('tbody');
    ui.totalBusinessDays = document.getElementById('totalBusinessDays');
    ui.totalHours = document.getElementById('totalHours');

    ui.exportExcelBtn = document.getElementById('exportExcelBtn');
    ui.exportPdfBtn = document.getElementById('exportPdfBtn');

    ui.whatsNumber = document.getElementById('whatsNumber');
    ui.sendWhatsBtn = document.getElementById('sendWhatsBtn');

    ui.emailTo = document.getElementById('emailTo');
    ui.sendEmailBtn = document.getElementById('sendEmailBtn');

    ui.year = document.getElementById('year');
  }

  function setYear() {
    if (ui.year) ui.year.textContent = new Date().getFullYear();
  }

  // Logo preview
  function bindLogoUpload() {
    if (!ui.companyLogo || !ui.logoPreview) return;
    ui.companyLogo.addEventListener('change', (ev) => {
      const file = ev.target.files && ev.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => { ui.logoPreview.src = reader.result; };
      reader.readAsDataURL(file);
    });
  }

  // Cálculo de dias úteis reativo
  function bindBusinessDaysCalc() {
    function update() {
      const s = toDate(ui.startDate.value);
      const e = toDate(ui.endDate.value);
      const days = countBusinessDays(s, e);
      ui.businessDays.value = String(days);
    }
    ui.startDate.addEventListener('change', update);
    ui.endDate.addEventListener('change', update);
  }

  // Renderização
  function renderTotals() {
    const totalDays = state.tasks.reduce((acc, t) => acc + (Number(t.businessDays) || 0), 0);
    const totalHours = state.tasks.reduce((acc, t) => acc + (Number(t.hours) || 0), 0);
    ui.totalBusinessDays.textContent = String(totalDays);
    ui.totalHours.textContent = String(totalHours);
  }

  function renderTable() {
    ui.tbody.innerHTML = '';
    state.tasks.forEach((task, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${escapeHtml(task.responsibleName)}</td>
        <td>${escapeHtml(task.department || '')}</td>
        <td>${escapeHtml(task.activity)}</td>
        <td>${escapeHtml(task.description || '')}</td>
        <td>${escapeHtml(task.startDate)}</td>
        <td>${escapeHtml(task.endDate)}</td>
        <td>${escapeHtml(String(task.businessDays))}</td>
        <td>${escapeHtml(String(task.hours))}</td>
        <td>${escapeHtml(task.status)}</td>
        <td>
          <button class="btn ghost" data-action="edit" data-id="${task.id}">Editar</button>
          <button class="btn danger ghost" data-action="delete" data-id="${task.id}">Excluir</button>
        </td>
      `;
      ui.tbody.appendChild(tr);
    });
    renderTotals();
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Ações da tabela
  function bindTableActions() {
    ui.tbody.addEventListener('click', (ev) => {
      const target = ev.target;
      if (!(target instanceof HTMLElement)) return;
      const action = target.getAttribute('data-action');
      const id = target.getAttribute('data-id');
      if (!action || !id) return;
      if (action === 'delete') {
        state.tasks = state.tasks.filter(t => String(t.id) !== String(id));
        renderTable();
        persistIfPossible();
      }
      if (action === 'edit') {
        const task = state.tasks.find(t => String(t.id) === String(id));
        if (!task) return;
        ui.responsibleName.value = task.responsibleName;
        ui.department.value = task.department || '';
        ui.activity.value = task.activity;
        ui.description.value = task.description || '';
        ui.startDate.value = task.startDate;
        ui.endDate.value = task.endDate;
        ui.businessDays.value = String(task.businessDays || '');
        ui.hours.value = String(task.hours || '');
        ui.status.value = task.status || 'planejada';
        // Remove a antiga para não duplicar, ao salvar entra como nova
        state.tasks = state.tasks.filter(t => String(t.id) !== String(id));
        renderTable();
        persistIfPossible();
      }
    });
  }

  // Formulário de tarefa
  function bindTaskForm() {
    ui.taskForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      // validações simples
      const responsibleName = ui.responsibleName.value.trim();
      const activity = ui.activity.value.trim();
      const startDate = ui.startDate.value;
      const endDate = ui.endDate.value;
      if (!responsibleName || !activity || !startDate || !endDate) {
        alert('Preencha os campos obrigatórios: Responsável, Atividade, Início e Finalização.');
        return;
      }

      const businessDays = countBusinessDays(toDate(startDate), toDate(endDate));
      ui.businessDays.value = String(businessDays);

      const task = {
        id: Date.now().toString(36),
        responsibleName,
        department: ui.department.value.trim(),
        activity,
        description: ui.description.value.trim(),
        startDate,
        endDate,
        businessDays,
        hours: Number(ui.hours.value || 0),
        status: ui.status.value,
      };

      state.tasks.push(task);
      renderTable();
      persistIfPossible();
      ui.taskForm.reset();
      ui.businessDays.value = '';
    });
  }

  // Nova OS / Salvar OS
  function bindOrderActions() {
    ui.newOrderBtn.addEventListener('click', () => {
      if (ui.orderId.value && state.tasks.length > 0) {
        const ok = confirm('Deseja iniciar uma nova OS? Os dados não salvos serão perdidos.');
        if (!ok) return;
      }
      ui.orderId.value = '';
      ui.companyName.value = '';
      state.tasks = [];
      renderTable();
    });

    ui.saveOrderBtn.addEventListener('click', () => {
      const orderId = ui.orderId.value.trim();
      if (!orderId) { alert('Informe o ID da OS para salvar.'); return; }
      const payload = {
        orderId,
        companyName: ui.companyName.value.trim(),
        tasks: state.tasks,
        logoDataUrl: ui.logoPreview && ui.logoPreview.src ? ui.logoPreview.src : null,
        updatedAt: new Date().toISOString(),
      };
      saveOrder(orderId, payload);
      alert('OS salva com sucesso.');
    });
  }

  function persistIfPossible() {
    const orderId = ui.orderId.value.trim();
    if (!orderId) return; // só persiste automático se houver ID
    const payload = {
      orderId,
      companyName: ui.companyName.value.trim(),
      tasks: state.tasks,
      logoDataUrl: ui.logoPreview && ui.logoPreview.src ? ui.logoPreview.src : null,
      updatedAt: new Date().toISOString(),
    };
    try { saveOrder(orderId, payload); } catch {}
  }

  // Limpar tarefas
  function bindClearTasks() {
    ui.clearTasksBtn.addEventListener('click', () => {
      if (state.tasks.length === 0) return;
      const ok = confirm('Tem certeza que deseja limpar todas as tarefas desta OS?');
      if (!ok) return;
      state.tasks = [];
      renderTable();
      persistIfPossible();
    });
  }

  // Exportações (placeholders simples)
  function bindExports() {
    ui.exportExcelBtn.addEventListener('click', () => {
      if (!window.XLSX) { alert('Biblioteca XLSX não carregada.'); return; }
      const wsData = [
        ['#', 'Responsável', 'Setor', 'Atividade', 'Descrição', 'Início', 'Fim', 'Dias úteis', 'Horas', 'Status'],
        ...state.tasks.map((t, i) => [i + 1, t.responsibleName, t.department, t.activity, t.description, t.startDate, t.endDate, t.businessDays, t.hours, t.status])
      ];
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, 'Tarefas');
      const name = (ui.orderId.value ? ui.orderId.value + '_' : '') + 'tarefas.xlsx';
      XLSX.writeFile(wb, name);
    });

    ui.exportPdfBtn.addEventListener('click', () => {
      if (!window.jspdf || !window.jspdf.jsPDF) { alert('Biblioteca jsPDF não carregada.'); return; }
      const doc = new window.jspdf.jsPDF({ orientation: 'landscape' });
      const head = [['#', 'Responsável', 'Setor', 'Atividade', 'Descrição', 'Início', 'Fim', 'Dias úteis', 'Horas', 'Status']];
      const body = state.tasks.map((t, i) => [i + 1, t.responsibleName, t.department, t.activity, t.description, t.startDate, t.endDate, t.businessDays, t.hours, t.status]);
      if (doc.autoTable) {
        doc.autoTable({ head, body, styles: { fontSize: 8 } });
      } else if (window.autoTable) {
        window.autoTable(doc, { head, body, styles: { fontSize: 8 } });
      }
      const name = (ui.orderId.value ? ui.orderId.value + '_' : '') + 'tarefas.pdf';
      doc.save(name);
    });
  }

  // Compartilhamento (placeholders simples)
  function bindShare() {
    ui.sendWhatsBtn.addEventListener('click', () => {
      const number = ui.whatsNumber.value.replace(/\D/g, '');
      if (!number) { alert('Informe um número para WhatsApp.'); return; }
      const text = buildShareText();
      const url = `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    });

    ui.sendEmailBtn.addEventListener('click', () => {
      const email = ui.emailTo.value.trim();
      if (!email) { alert('Informe um email.'); return; }
      const subject = `OS ${ui.orderId.value || ''} - Tarefas e Horas`;
      const body = buildShareText();
      const href = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = href;
    });
  }

  function buildShareText() {
    const header = `Empresa: ${ui.companyName.value || '-'} | OS: ${ui.orderId.value || '-'}`;
    const lines = state.tasks.map((t, i) => `${i + 1}. ${t.responsibleName} | ${t.department || '-'} | ${t.activity} | ${t.startDate} a ${t.endDate} | ${t.businessDays} dias úteis | ${t.hours}h | ${t.status}`);
    const totals = `Totais: Dias úteis=${ui.totalBusinessDays.textContent} | Horas=${ui.totalHours.textContent}`;
    return [header, ...lines, totals].join('\n');
  }

  // Carregar OS por ID quando digitado (se existir)
  function bindAutoLoadByOrderId() {
    ui.orderId.addEventListener('change', tryLoadByOrderId);
    ui.orderId.addEventListener('blur', tryLoadByOrderId);
  }

  function tryLoadByOrderId() {
    const orderId = ui.orderId.value.trim();
    if (!orderId) return;
    const data = loadOrder(orderId);
    if (!data) return;
    ui.companyName.value = data.companyName || '';
    if (data.logoDataUrl && ui.logoPreview) ui.logoPreview.src = data.logoDataUrl;
    state.tasks = Array.isArray(data.tasks) ? data.tasks : [];
    renderTable();
  }

  // Inicialização
  function init() {
    queryRefs();
    setYear();
    bindLogoUpload();
    bindBusinessDaysCalc();
    bindTaskForm();
    bindTableActions();
    bindOrderActions();
    bindClearTasks();
    bindExports();
    bindShare();
    bindAutoLoadByOrderId();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


