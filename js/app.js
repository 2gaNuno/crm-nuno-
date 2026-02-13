// ============================================================
// NUNO GONÇALVES — CRM IMOBILIÁRIO
// ============================================================

// --- DATA (guardado em localStorage para persistir) ---

const STORAGE_KEY = 'crm_nuno_data';

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);
  return {
    clients: [
      {id:'C001',nome:'João Silva',tel:'912345678',email:'joao@email.com',tipo:'Comprador',zona:'Lisboa Centro',tipologia:'T2',bmin:150000,bmax:250000,fonte:'Website',data:'2025-01-15',notas:'Procura perto do metro'},
      {id:'C002',nome:'Maria Santos',tel:'963456789',email:'maria@email.com',tipo:'Vendedor',zona:'Almada',tipologia:'T3',bmin:280000,bmax:320000,fonte:'Referência',data:'2025-01-20',notas:'Apartamento com vista rio'},
      {id:'C003',nome:'Pedro Costa',tel:'934567890',email:'pedro@email.com',tipo:'Investidor',zona:'Setúbal',tipologia:'T1',bmin:100000,bmax:180000,fonte:'Instagram',data:'2025-02-01',notas:'Quer rentabilidade >5%'},
      {id:'C004',nome:'Ana Ferreira',tel:'916789012',email:'ana@email.com',tipo:'Comprador',zona:'Seixal',tipologia:'Moradia',bmin:350000,bmax:500000,fonte:'Idealista',data:'2025-02-05',notas:'Família com 2 filhos'},
      {id:'C005',nome:'Carlos Mendes',tel:'927890123',email:'carlos@email.com',tipo:'Arrendatário',zona:'Barreiro',tipologia:'T1',bmin:500,bmax:800,fonte:'OLX',data:'2025-02-10',notas:'Estudante universitário'},
    ],
    deals: [
      {id:'N001',cliente:'João Silva',imovel:'T2 Av. Roma, Lisboa',valor:220000,comissao:3,status:'Visita Agendada',proximo:'Agendar 2ª visita'},
      {id:'N002',cliente:'Maria Santos',imovel:'T3 Vista Rio, Almada',valor:300000,comissao:3,status:'Proposta',proximo:'Aguardar resposta'},
      {id:'N003',cliente:'Pedro Costa',imovel:'T1 Centro, Setúbal',valor:140000,comissao:4,status:'Lead',proximo:'Primeiro contacto'},
      {id:'N004',cliente:'Ana Ferreira',imovel:'Moradia, Seixal',valor:420000,comissao:3.5,status:'Negociação',proximo:'Contra-proposta'},
      {id:'N005',cliente:'Carlos Mendes',imovel:'T1 Barreiro',valor:700,comissao:1,status:'Contactado',proximo:'Enviar opções'},
    ],
    interactions: [
      {data:'2025-02-10',cliente:'João Silva',tipo:'Visita',assunto:'Visita T2 Av. Roma',detalhes:'Gostou do apartamento, quer trazer a mulher',followup:'2025-02-15'},
      {data:'2025-02-08',cliente:'Maria Santos',tipo:'Chamada',assunto:'Proposta recebida',detalhes:'Proposta de 290k, abaixo do pedido',followup:'2025-02-12'},
      {data:'2025-02-11',cliente:'Carlos Mendes',tipo:'WhatsApp',assunto:'Envio de opções',detalhes:'Enviadas 3 opções T1 Barreiro',followup:'2025-02-14'},
    ]
  };
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let data = loadData();
let currentFilter = 'all';
let editingClient = null;
let dragDealId = null;

// --- HELPERS ---

function fmt(n) {
  return Number(n).toLocaleString('pt-PT');
}

function today() {
  return new Date().toISOString().split('T')[0];
}

function badgeClass(tipo) {
  return 'badge badge-' + tipo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function nextId(prefix, arr) {
  return prefix + String(arr.length + 1).padStart(3, '0');
}

// --- VIEWS ---

function showView(name, el) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + name).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (el) el.classList.add('active');

  if (name === 'dashboard') updateDashboard();
  if (name === 'clientes') renderClientes();
  if (name === 'pipeline') renderPipeline();
  if (name === 'interacoes') renderInteracoes();
}

// --- DASHBOARD ---

function updateDashboard() {
  document.getElementById('stat-total').textContent = data.clients.length;

  const activeDeals = data.deals.filter(d => d.status !== 'Fechado' && d.status !== 'Perdido');
  document.getElementById('stat-ativos').textContent = activeDeals.length;

  const totalVal = data.deals.reduce((s, d) => s + Number(d.valor), 0);
  document.getElementById('stat-valor').textContent = fmt(totalVal) + ' €';

  const totalCom = data.deals.reduce((s, d) => s + (Number(d.valor) * Number(d.comissao) / 100), 0);
  document.getElementById('stat-comissoes').textContent = fmt(Math.round(totalCom)) + ' €';

  const tb = document.getElementById('recent-interactions');
  tb.innerHTML = data.interactions.slice(0, 5).map(i =>
    `<tr><td>${i.data}</td><td>${i.cliente}</td><td>${i.tipo}</td><td>${i.assunto}</td></tr>`
  ).join('');

  document.getElementById('date-display').textContent =
    new Date().toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// --- CLIENTES ---

function setFilter(f, el) {
  currentFilter = f;
  document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  renderClientes();
}

function renderClientes() {
  const search = document.getElementById('search-input').value.toLowerCase();
  const filtered = data.clients.filter(c => {
    if (currentFilter !== 'all' && c.tipo !== currentFilter) return false;
    if (search && !c.nome.toLowerCase().includes(search) && !c.email.toLowerCase().includes(search) && !c.zona.toLowerCase().includes(search)) return false;
    return true;
  });

  document.getElementById('clientes-table').innerHTML = filtered.map(c => `
    <tr>
      <td><strong>${c.nome}</strong></td>
      <td>${c.tel}</td>
      <td>${c.email}</td>
      <td><span class="${badgeClass(c.tipo)}">${c.tipo}</span></td>
      <td>${c.zona}</td>
      <td>${fmt(c.bmin)}€ — ${fmt(c.bmax)}€</td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="editClient('${c.id}')">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="deleteClient('${c.id}')">🗑</button>
      </td>
    </tr>
  `).join('');
}

// --- PIPELINE (drag & drop) ---

function renderPipeline() {
  const statuses = ['Lead', 'Contactado', 'Visita Agendada', 'Proposta', 'Negociação'];

  document.getElementById('pipeline-board').innerHTML = statuses.map(s => {
    const colDeals = data.deals.filter(d => d.status === s);
    return `
      <div class="pipeline-col" 
           ondragover="event.preventDefault(); this.classList.add('drag-over')" 
           ondragleave="this.classList.remove('drag-over')"
           ondrop="dropDeal('${s}', this)">
        <h4>${s} <span class="count">${colDeals.length}</span></h4>
        ${colDeals.map(d => `
          <div class="deal-card" draggable="true" 
               ondragstart="dragDealId='${d.id}'; this.classList.add('dragging')"
               ondragend="this.classList.remove('dragging')">
            <div class="name">${d.cliente}</div>
            <div class="property">${d.imovel}</div>
            <div class="deal-value">${fmt(d.valor)} €</div>
          </div>
        `).join('')}
      </div>
    `;
  }).join('');
}

function dropDeal(newStatus, colEl) {
  colEl.classList.remove('drag-over');
  if (dragDealId) {
    const deal = data.deals.find(d => d.id === dragDealId);
    if (deal) {
      deal.status = newStatus;
      saveData();
      renderPipeline();
    }
    dragDealId = null;
  }
}

// --- INTERAÇÕES ---

function renderInteracoes() {
  document.getElementById('interacoes-table').innerHTML = data.interactions.map(i => `
    <tr>
      <td>${i.data}</td>
      <td>${i.cliente}</td>
      <td>${i.tipo}</td>
      <td>${i.assunto}</td>
      <td>${i.detalhes}</td>
      <td>${i.followup || '—'}</td>
    </tr>
  `).join('');
}

// --- MODALS ---

function openModal(type) {
  if (type === 'add') {
    editingClient = null;
    document.getElementById('modal-client-title').textContent = 'Novo Cliente';
    ['f-nome','f-tel','f-email','f-zona','f-notas'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('f-bmin').value = '';
    document.getElementById('f-bmax').value = '';
    document.getElementById('f-tipo').value = 'Comprador';
    document.getElementById('f-tipologia').value = 'T2';
    document.getElementById('f-fonte').value = 'Website';
    document.getElementById('modal-client').classList.add('show');
  }
  else if (type === 'interaction') {
    const sel = document.getElementById('fi-cliente');
    sel.innerHTML = data.clients.map(c => `<option>${c.nome}</option>`).join('');
    document.getElementById('fi-assunto').value = '';
    document.getElementById('fi-detalhes').value = '';
    document.getElementById('fi-followup').value = '';
    document.getElementById('modal-interaction').classList.add('show');
  }
  else if (type === 'deal') {
    const sel = document.getElementById('fd-cliente');
    sel.innerHTML = data.clients.map(c => `<option>${c.nome}</option>`).join('');
    document.getElementById('fd-imovel').value = '';
    document.getElementById('fd-valor').value = '';
    document.getElementById('fd-comissao').value = '3';
    document.getElementById('fd-proximo').value = '';
    document.getElementById('fd-status').value = 'Lead';
    document.getElementById('modal-deal').classList.add('show');
  }
}

function closeModal(id) {
  document.getElementById(id).classList.remove('show');
}

// --- SAVE CLIENT ---

function editClient(id) {
  const c = data.clients.find(cl => cl.id === id);
  if (!c) return;
  editingClient = id;
  document.getElementById('modal-client-title').textContent = 'Editar Cliente';
  document.getElementById('f-nome').value = c.nome;
  document.getElementById('f-tel').value = c.tel;
  document.getElementById('f-email').value = c.email;
  document.getElementById('f-tipo').value = c.tipo;
  document.getElementById('f-zona').value = c.zona;
  document.getElementById('f-tipologia').value = c.tipologia;
  document.getElementById('f-bmin').value = c.bmin;
  document.getElementById('f-bmax').value = c.bmax;
  document.getElementById('f-fonte').value = c.fonte;
  document.getElementById('f-notas').value = c.notas;
  document.getElementById('modal-client').classList.add('show');
}

function saveClient() {
  const obj = {
    nome: document.getElementById('f-nome').value.trim(),
    tel: document.getElementById('f-tel').value.trim(),
    email: document.getElementById('f-email').value.trim(),
    tipo: document.getElementById('f-tipo').value,
    zona: document.getElementById('f-zona').value.trim(),
    tipologia: document.getElementById('f-tipologia').value,
    bmin: Number(document.getElementById('f-bmin').value) || 0,
    bmax: Number(document.getElementById('f-bmax').value) || 0,
    fonte: document.getElementById('f-fonte').value,
    notas: document.getElementById('f-notas').value.trim(),
  };

  if (!obj.nome) { alert('Nome é obrigatório!'); return; }

  if (editingClient) {
    const idx = data.clients.findIndex(c => c.id === editingClient);
    data.clients[idx] = { ...data.clients[idx], ...obj };
  } else {
    obj.id = nextId('C', data.clients);
    obj.data = today();
    data.clients.push(obj);
  }

  saveData();
  closeModal('modal-client');
  renderClientes();
}

function deleteClient(id) {
  if (confirm('Tens a certeza que queres remover este cliente?')) {
    data.clients = data.clients.filter(c => c.id !== id);
    saveData();
    renderClientes();
  }
}

// --- SAVE INTERACTION ---

function saveInteraction() {
  const obj = {
    data: today(),
    cliente: document.getElementById('fi-cliente').value,
    tipo: document.getElementById('fi-tipo').value,
    assunto: document.getElementById('fi-assunto').value.trim(),
    detalhes: document.getElementById('fi-detalhes').value.trim(),
    followup: document.getElementById('fi-followup').value,
  };

  if (!obj.assunto) { alert('Assunto é obrigatório!'); return; }

  data.interactions.unshift(obj);
  saveData();
  closeModal('modal-interaction');
  renderInteracoes();
}

// --- SAVE DEAL ---

function saveDeal() {
  const obj = {
    id: nextId('N', data.deals),
    cliente: document.getElementById('fd-cliente').value,
    imovel: document.getElementById('fd-imovel').value.trim(),
    valor: Number(document.getElementById('fd-valor').value) || 0,
    comissao: Number(document.getElementById('fd-comissao').value) || 3,
    status: document.getElementById('fd-status').value,
    proximo: document.getElementById('fd-proximo').value.trim(),
  };

  if (!obj.imovel) { alert('Imóvel é obrigatório!'); return; }

  data.deals.push(obj);
  saveData();
  closeModal('modal-deal');
  renderPipeline();
}

// --- EXPORT CSV ---

function exportCSV() {
  const headers = ['ID','Nome','Telefone','Email','Tipo','Zona','Tipologia','Budget Min','Budget Max','Fonte','Data','Notas'];
  const rows = data.clients.map(c => [c.id, c.nome, c.tel, c.email, c.tipo, c.zona, c.tipologia, c.bmin, c.bmax, c.fonte, c.data, c.notas]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'clientes_nuno_goncalves.csv';
  a.click();
}

// --- CLOSE MODALS ON OVERLAY CLICK ---

document.querySelectorAll('.modal-overlay').forEach(m => {
  m.addEventListener('click', e => {
    if (e.target === m) m.classList.remove('show');
  });
});

// --- INIT ---

updateDashboard();
