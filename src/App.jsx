import { useState, useMemo, useCallback, useEffect } from "react";

const INITIAL_CLIENTS = [
  {id:'C001',nome:'João Silva',tel:'912345678',email:'joao@email.com',tipo:'Comprador',zona:'Lisboa Centro',tipologia:'T2',bmin:150000,bmax:250000,fonte:'Website',data:'2025-01-15',notas:'Procura perto do metro'},
  {id:'C002',nome:'Maria Santos',tel:'963456789',email:'maria@email.com',tipo:'Vendedor',zona:'Almada',tipologia:'T3',bmin:280000,bmax:320000,fonte:'Referência',data:'2025-01-20',notas:'Apartamento com vista rio'},
  {id:'C003',nome:'Pedro Costa',tel:'934567890',email:'pedro@email.com',tipo:'Investidor',zona:'Setúbal',tipologia:'T1',bmin:100000,bmax:180000,fonte:'Instagram',data:'2025-02-01',notas:'Quer rentabilidade >5%'},
  {id:'C004',nome:'Ana Ferreira',tel:'916789012',email:'ana@email.com',tipo:'Comprador',zona:'Seixal',tipologia:'Moradia',bmin:350000,bmax:500000,fonte:'Idealista',data:'2025-02-05',notas:'Família com 2 filhos'},
  {id:'C005',nome:'Carlos Mendes',tel:'927890123',email:'carlos@email.com',tipo:'Arrendatário',zona:'Barreiro',tipologia:'T1',bmin:500,bmax:800,fonte:'OLX',data:'2025-02-10',notas:'Estudante universitário'},
];

const INITIAL_DEALS = [
  {id:'N001',cliente:'João Silva',imovel:'T2 Av. Roma, Lisboa',valor:220000,comissao:3,status:'Visita Agendada'},
  {id:'N002',cliente:'Maria Santos',imovel:'T3 Vista Rio, Almada',valor:300000,comissao:3,status:'Proposta'},
  {id:'N003',cliente:'Pedro Costa',imovel:'T1 Centro, Setúbal',valor:140000,comissao:4,status:'Lead'},
  {id:'N004',cliente:'Ana Ferreira',imovel:'Moradia, Seixal',valor:420000,comissao:3.5,status:'Negociação'},
  {id:'N005',cliente:'Carlos Mendes',imovel:'T1 Barreiro',valor:700,comissao:1,status:'Contactado'},
];

const INITIAL_INTERACTIONS = [
  {data:'2025-02-10',cliente:'João Silva',tipo:'Visita',assunto:'Visita T2 Av. Roma',detalhes:'Gostou, quer trazer a mulher',followup:'2025-02-15'},
  {data:'2025-02-08',cliente:'Maria Santos',tipo:'Chamada',assunto:'Proposta recebida',detalhes:'Proposta 290k, abaixo do pedido',followup:'2025-02-12'},
  {data:'2025-02-11',cliente:'Carlos Mendes',tipo:'WhatsApp',assunto:'Envio de opções',detalhes:'3 opções T1 Barreiro',followup:'2025-02-14'},
];

const INITIAL_COMISSOES_GOLD = [
  {id:'G001',data:'2025-01-20',clienteIndicado:'António Sousa',contacto:'912000001',valorCredito:15000,comissao:150,status:'Pago',notas:'Crédito pessoal aprovado'},
  {id:'G002',data:'2025-02-01',clienteIndicado:'Rita Oliveira',contacto:'963000002',valorCredito:25000,comissao:250,status:'Pendente',notas:'Aguarda aprovação'},
  {id:'G003',data:'2025-02-08',clienteIndicado:'Bruno Martins',contacto:'934000003',valorCredito:10000,comissao:100,status:'Pago',notas:'Crédito consolidado'},
];

const STATUS_GOLD = ['Pendente','Aprovado','Pago','Recusado'];

// Funções para localStorage
const loadData = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch { return defaultValue; }
};

const saveData = (key, data) => {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
};

const STATUSES = ['Lead','Contactado','Visita Agendada','Proposta','Negociação'];
const TIPOS = ['Comprador','Vendedor','Investidor','Arrendatário','Senhorio'];
const TIPOLOGIAS = ['T0','T1','T2','T3','T4','T5+','Moradia','Terreno','Loja','Escritório'];
const FONTES = ['Referência','Website','Instagram','OLX','Idealista','Walk-in','Outro'];
const CONTACTOS = ['Chamada','WhatsApp','Email','Visita','Reunião','SMS'];

const fmt = n => Number(n).toLocaleString('pt-PT');

const Badge = ({tipo}) => {
  const colors = {Comprador:'#2B6CB0',Vendedor:'#C53030',Investidor:'#276749',Arrendatário:'#6B46C1',Senhorio:'#C05621'};
  const bgs = {Comprador:'#EBF8FF',Vendedor:'#FFF5F5',Investidor:'#F0FFF4',Arrendatário:'#FAF5FF',Senhorio:'#FFFAF0'};
  return <span style={{display:'inline-block',padding:'3px 12px',borderRadius:20,fontSize:12,fontWeight:600,background:bgs[tipo]||'#EDF2F7',color:colors[tipo]||'#4A5568'}}>{tipo}</span>;
};

const StatusDot = ({status}) => {
  const colors = {Lead:'#90CDF4',Contactado:'#FBD38D','Visita Agendada':'#D6BCFA',Proposta:'#9AE6B4',Negociação:'#FEF08A',Fechado:'#48BB78',Perdido:'#FC8181'};
  return <span style={{display:'inline-flex',alignItems:'center',gap:6,fontSize:13,fontWeight:500}}>
    <span style={{width:8,height:8,borderRadius:'50%',background:colors[status]||'#CBD5E0'}}/>
    {status}
  </span>;
};

export default function App() {
  const [view, setView] = useState('dashboard');
  const [clients, setClients] = useState(() => loadData('crm_clients', INITIAL_CLIENTS));
  const [deals, setDeals] = useState(() => loadData('crm_deals', INITIAL_DEALS));
  const [interactions, setInteractions] = useState(() => loadData('crm_interactions', INITIAL_INTERACTIONS));
  const [comissoesGold, setComissoesGold] = useState(() => loadData('crm_comissoes_gold', INITIAL_COMISSOES_GOLD));

  // Guardar automaticamente quando os dados mudam
  useEffect(() => { saveData('crm_clients', clients); }, [clients]);
  useEffect(() => { saveData('crm_deals', deals); }, [deals]);
  useEffect(() => { saveData('crm_interactions', interactions); }, [interactions]);
  useEffect(() => { saveData('crm_comissoes_gold', comissoesGold); }, [comissoesGold]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({});
  const [dragDeal, setDragDeal] = useState(null);

  const stats = useMemo(() => {
    const active = deals.filter(d => d.status !== 'Fechado' && d.status !== 'Perdido');
    const totalVal = deals.reduce((s,d) => s + d.valor, 0);
    const totalCom = deals.reduce((s,d) => s + (d.valor * d.comissao / 100), 0);
    const goldPago = comissoesGold.filter(c => c.status === 'Pago').reduce((s,c) => s + c.comissao, 0);
    const goldPendente = comissoesGold.filter(c => c.status !== 'Pago' && c.status !== 'Recusado').reduce((s,c) => s + c.comissao, 0);
    return { total: clients.length, ativos: active.length, valor: totalVal, comissoes: Math.round(totalCom), goldPago, goldPendente, goldTotal: comissoesGold.length };
  }, [clients, deals, comissoesGold]);

  const filtered = useMemo(() => {
    return clients.filter(c => {
      if (filter !== 'all' && c.tipo !== filter) return false;
      if (search) {
        const s = search.toLowerCase();
        return c.nome.toLowerCase().includes(s) || c.email.toLowerCase().includes(s) || c.zona.toLowerCase().includes(s);
      }
      return true;
    });
  }, [clients, filter, search]);

  const openClientModal = (id = null) => {
    if (id) {
      const c = clients.find(cl => cl.id === id);
      setForm({...c});
      setEditId(id);
    } else {
      setForm({tipo:'Comprador',tipologia:'T2',fonte:'Website'});
      setEditId(null);
    }
    setModal('client');
  };

  const saveClient = () => {
    if (!form.nome) return alert('Nome obrigatório!');
    if (editId) {
      setClients(prev => prev.map(c => c.id === editId ? {...c, ...form} : c));
    } else {
      const newC = {...form, id: 'C'+String(clients.length+1).padStart(3,'0'), data: new Date().toISOString().split('T')[0]};
      setClients(prev => [...prev, newC]);
    }
    setModal(null);
  };

  const deleteClient = (id) => { if(confirm('Remover cliente?')) setClients(prev => prev.filter(c => c.id !== id)); };

  const openInteractionModal = () => {
    setForm({cliente: clients[0]?.nome, tipo:'Chamada'});
    setModal('interaction');
  };

  const saveInteraction = () => {
    const newI = {...form, data: new Date().toISOString().split('T')[0]};
    setInteractions(prev => [newI, ...prev]);
    setModal(null);
  };

  const openGoldModal = (id = null) => {
    if (id) {
      const c = comissoesGold.find(cg => cg.id === id);
      setForm({...c});
      setEditId(id);
    } else {
      setForm({status:'Pendente'});
      setEditId(null);
    }
    setModal('gold');
  };

  const saveGold = () => {
    if (!form.clienteIndicado) return alert('Nome do cliente indicado é obrigatório!');
    if (editId) {
      setComissoesGold(prev => prev.map(c => c.id === editId ? {...c, ...form} : c));
    } else {
      const newG = {...form, id: 'G'+String(comissoesGold.length+1).padStart(3,'0'), data: new Date().toISOString().split('T')[0]};
      setComissoesGold(prev => [...prev, newG]);
    }
    setModal(null);
  };

  const deleteGold = (id) => { if(confirm('Remover comissão?')) setComissoesGold(prev => prev.filter(c => c.id !== id)); };

  const handleDrop = (status) => {
    if (dragDeal) {
      setDeals(prev => prev.map(d => d.id === dragDeal ? {...d, status} : d));
      setDragDeal(null);
    }
  };

  const exportCSV = () => {
    const headers = ['ID','Nome','Telefone','Email','Tipo','Zona','Tipologia','Budget Min','Budget Max','Fonte','Data','Notas'];
    const rows = clients.map(c => [c.id,c.nome,c.tel,c.email,c.tipo,c.zona,c.tipologia,c.bmin,c.bmax,c.fonte,c.data,c.notas]);
    const csv = [headers,...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF'+csv], {type:'text/csv'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'clientes.csv'; a.click();
  };

  const navItems = [
    {key:'dashboard',icon:'◻️',label:'Dashboard'},
    {key:'clientes',icon:'👥',label:'Clientes'},
    {key:'pipeline',icon:'📊',label:'Pipeline'},
    {key:'interacoes',icon:'💬',label:'Interações'},
    {key:'comissoes-gold',icon:'💰',label:'Comissões Gold'},
  ];

  return (
    <div style={{display:'flex',minHeight:'100vh',fontFamily:'"DM Sans",-apple-system,sans-serif',background:'#F5F7FA',color:'#2D3748'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, select, textarea, button { font-family: inherit; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #CBD5E0; border-radius: 3px; }
      `}</style>

      {/* SIDEBAR */}
      <div style={{width:220,background:'#1B2A4A',padding:'24px 0',flexShrink:0,position:'sticky',top:0,height:'100vh'}}>
        <div style={{padding:'0 20px 28px',borderBottom:'1px solid rgba(255,255,255,.1)'}}>
          <h1 style={{fontFamily:'"Playfair Display",serif',color:'#D4A853',fontSize:20,margin:0}}>Nuno Gonçalves</h1>
          <span style={{color:'rgba(255,255,255,.45)',fontSize:11}}>CRM Imobiliário</span>
        </div>
        <nav style={{padding:'12px 0'}}>
          {navItems.map(n => (
            <div key={n.key} onClick={() => setView(n.key)}
              style={{display:'flex',alignItems:'center',gap:10,padding:'11px 20px',cursor:'pointer',
                color: view===n.key ? '#fff' : 'rgba(255,255,255,.55)',
                background: view===n.key ? 'rgba(255,255,255,.08)' : 'transparent',
                borderLeft: view===n.key ? '3px solid #D4A853' : '3px solid transparent',
                fontSize:14,fontWeight:500,transition:'.15s'}}>
              <span style={{fontSize:16}}>{n.icon}</span>{n.label}
            </div>
          ))}
        </nav>
      </div>

      {/* MAIN */}
      <div style={{flex:1,padding:'24px 32px',maxWidth:1200}}>

        {/* DASHBOARD */}
        {view === 'dashboard' && <>
          <h2 style={{fontFamily:'"Playfair Display",serif',fontSize:28,color:'#1B2A4A',marginBottom:20}}>Olá, Nuno 👋</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
            {[
              {label:'Total Clientes',val:stats.total,sub:'na base de dados',color:'#D4A853'},
              {label:'Negócios Ativos',val:stats.ativos,sub:'em pipeline',color:'#4299E1'},
              {label:'Valor Pipeline',val:fmt(stats.valor)+' €',sub:'potencial total',color:'#48BB78'},
              {label:'Comissões Est.',val:fmt(stats.comissoes)+' €',sub:'estimativa',color:'#9F7AEA'},
            ].map((s,i) => (
              <div key={i} style={{background:'#fff',borderRadius:12,padding:20,boxShadow:'0 1px 3px rgba(0,0,0,.06)',borderTop:`3px solid ${s.color}`}}>
                <div style={{fontSize:11,color:'#718096',textTransform:'uppercase',letterSpacing:'.5px',fontWeight:600}}>{s.label}</div>
                <div style={{fontSize:30,fontWeight:700,color:'#1B2A4A',margin:'4px 0'}}>{s.val}</div>
                <div style={{fontSize:13,color:'#718096'}}>{s.sub}</div>
              </div>
            ))}
          </div>
          <div style={{background:'#fff',borderRadius:12,padding:20,boxShadow:'0 1px 3px rgba(0,0,0,.06)'}}>
            <h3 style={{fontFamily:'"Playfair Display",serif',color:'#1B2A4A',marginBottom:14,fontSize:18}}>Últimas Interações</h3>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr>{['Data','Cliente','Tipo','Assunto'].map(h => <th key={h} style={{padding:'10px 14px',textAlign:'left',fontSize:11,textTransform:'uppercase',color:'#718096',fontWeight:600,borderBottom:'1px solid #E2E8F0',background:'#F5F7FA'}}>{h}</th>)}</tr></thead>
              <tbody>{interactions.slice(0,5).map((it,i) => <tr key={i}><td style={{padding:'12px 14px',fontSize:14,borderBottom:'1px solid #E2E8F0'}}>{it.data}</td><td style={{padding:'12px 14px',fontSize:14,borderBottom:'1px solid #E2E8F0'}}>{it.cliente}</td><td style={{padding:'12px 14px',fontSize:14,borderBottom:'1px solid #E2E8F0'}}>{it.tipo}</td><td style={{padding:'12px 14px',fontSize:14,borderBottom:'1px solid #E2E8F0'}}>{it.assunto}</td></tr>)}</tbody>
            </table>
          </div>
        </>}

        {/* CLIENTES */}
        {view === 'clientes' && <>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
            <h2 style={{fontFamily:'"Playfair Display",serif',fontSize:28,color:'#1B2A4A'}}>Clientes</h2>
            <div style={{display:'flex',gap:10}}>
              <button onClick={exportCSV} style={{padding:'9px 18px',border:'1.5px solid #E2E8F0',borderRadius:8,background:'transparent',fontSize:14,fontWeight:600,cursor:'pointer'}}>📥 Exportar</button>
              <button onClick={() => openClientModal()} style={{padding:'9px 18px',border:'none',borderRadius:8,background:'#1B2A4A',color:'#fff',fontSize:14,fontWeight:600,cursor:'pointer'}}>+ Novo Cliente</button>
            </div>
          </div>
          <div style={{background:'#fff',borderRadius:12,boxShadow:'0 1px 3px rgba(0,0,0,.06)',overflow:'hidden'}}>
            <div style={{padding:'14px 18px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid #E2E8F0',flexWrap:'wrap',gap:10}}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Pesquisar clientes..." style={{padding:'8px 14px',border:'1.5px solid #E2E8F0',borderRadius:8,width:280,fontSize:14,outline:'none'}}/>
              <div style={{display:'flex',gap:6}}>
                {['all','Comprador','Vendedor','Investidor','Arrendatário'].map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    style={{padding:'5px 14px',borderRadius:20,fontSize:12,fontWeight:600,cursor:'pointer',border:'1.5px solid',
                      background: filter===f ? '#1B2A4A' : 'transparent',
                      color: filter===f ? '#fff' : '#4A5568',
                      borderColor: filter===f ? '#1B2A4A' : '#E2E8F0'}}>
                    {f==='all' ? 'Todos' : f+'s'}
                  </button>
                ))}
              </div>
            </div>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr>{['Nome','Telefone','Email','Tipo','Zona','Budget','Ações'].map(h => <th key={h} style={{padding:'11px 14px',textAlign:'left',fontSize:11,textTransform:'uppercase',color:'#718096',fontWeight:600,borderBottom:'1px solid #E2E8F0',background:'#F5F7FA'}}>{h}</th>)}</tr></thead>
              <tbody>{filtered.map(c => (
                <tr key={c.id} style={{transition:'.1s'}}>
                  <td style={{padding:'13px 14px',fontSize:14,borderBottom:'1px solid #E2E8F0',fontWeight:600}}>{c.nome}</td>
                  <td style={{padding:'13px 14px',fontSize:14,borderBottom:'1px solid #E2E8F0'}}>{c.tel}</td>
                  <td style={{padding:'13px 14px',fontSize:14,borderBottom:'1px solid #E2E8F0'}}>{c.email}</td>
                  <td style={{padding:'13px 14px',borderBottom:'1px solid #E2E8F0'}}><Badge tipo={c.tipo}/></td>
                  <td style={{padding:'13px 14px',fontSize:14,borderBottom:'1px solid #E2E8F0'}}>{c.zona}</td>
                  <td style={{padding:'13px 14px',fontSize:14,borderBottom:'1px solid #E2E8F0'}}>{fmt(c.bmin)}€ - {fmt(c.bmax)}€</td>
                  <td style={{padding:'13px 14px',borderBottom:'1px solid #E2E8F0'}}>
                    <button onClick={() => openClientModal(c.id)} style={{padding:'5px 10px',border:'1.5px solid #E2E8F0',borderRadius:6,background:'transparent',cursor:'pointer',marginRight:6,fontSize:13}}>✏️</button>
                    <button onClick={() => deleteClient(c.id)} style={{padding:'5px 10px',border:'none',borderRadius:6,background:'#FED7D7',color:'#C53030',cursor:'pointer',fontSize:13}}>🗑</button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </>}

        {/* PIPELINE */}
        {view === 'pipeline' && <>
          <h2 style={{fontFamily:'"Playfair Display",serif',fontSize:28,color:'#1B2A4A',marginBottom:20}}>Pipeline de Vendas</h2>
          <div style={{display:'grid',gridTemplateColumns:`repeat(${STATUSES.length},1fr)`,gap:12}}>
            {STATUSES.map(s => {
              const colDeals = deals.filter(d => d.status === s);
              return (
                <div key={s}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => handleDrop(s)}
                  style={{background:'#EDF2F7',borderRadius:12,padding:12,minHeight:320}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingBottom:10,marginBottom:10,borderBottom:'2px solid #E2E8F0'}}>
                    <span style={{fontSize:12,textTransform:'uppercase',letterSpacing:'.5px',color:'#718096',fontWeight:600}}>{s}</span>
                    <span style={{background:'#1B2A4A',color:'#fff',padding:'2px 8px',borderRadius:10,fontSize:11,fontWeight:600}}>{colDeals.length}</span>
                  </div>
                  {colDeals.map(d => (
                    <div key={d.id} draggable
                      onDragStart={() => setDragDeal(d.id)}
                      style={{background:'#fff',borderRadius:8,padding:12,marginBottom:8,boxShadow:'0 1px 2px rgba(0,0,0,.06)',cursor:'grab'}}>
                      <div style={{fontWeight:600,fontSize:14,marginBottom:3}}>{d.cliente}</div>
                      <div style={{fontSize:12,color:'#718096',marginBottom:6}}>{d.imovel}</div>
                      <div style={{fontWeight:700,color:'#D4A853',fontSize:15}}>{fmt(d.valor)} €</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </>}

        {/* INTERAÇÕES */}
        {view === 'interacoes' && <>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
            <h2 style={{fontFamily:'"Playfair Display",serif',fontSize:28,color:'#1B2A4A'}}>Interações</h2>
            <button onClick={openInteractionModal} style={{padding:'9px 18px',border:'none',borderRadius:8,background:'#1B2A4A',color:'#fff',fontSize:14,fontWeight:600,cursor:'pointer'}}>+ Nova Interação</button>
          </div>
          <div style={{background:'#fff',borderRadius:12,boxShadow:'0 1px 3px rgba(0,0,0,.06)',overflow:'hidden'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr>{['Data','Cliente','Tipo','Assunto','Detalhes','Follow-up'].map(h => <th key={h} style={{padding:'11px 14px',textAlign:'left',fontSize:11,textTransform:'uppercase',color:'#718096',fontWeight:600,borderBottom:'1px solid #E2E8F0',background:'#F5F7FA'}}>{h}</th>)}</tr></thead>
              <tbody>{interactions.map((it,i) => <tr key={i}>{[it.data,it.cliente,it.tipo,it.assunto,it.detalhes,it.followup].map((v,j) => <td key={j} style={{padding:'13px 14px',fontSize:14,borderBottom:'1px solid #E2E8F0'}}>{v}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </>}

        {/* COMISSÕES GOLD */}
        {view === 'comissoes-gold' && <>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
            <h2 style={{fontFamily:'"Playfair Display",serif',fontSize:28,color:'#1B2A4A'}}>Comissões Gold</h2>
            <button onClick={() => openGoldModal()} style={{padding:'9px 18px',border:'none',borderRadius:8,background:'#D4A853',color:'#fff',fontSize:14,fontWeight:600,cursor:'pointer'}}>+ Nova Indicação</button>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:24}}>
            <div style={{background:'#fff',borderRadius:12,padding:20,boxShadow:'0 1px 3px rgba(0,0,0,.06)',borderTop:'3px solid #48BB78'}}>
              <div style={{fontSize:11,color:'#718096',textTransform:'uppercase',letterSpacing:'.5px',fontWeight:600}}>Comissões Pagas</div>
              <div style={{fontSize:28,fontWeight:700,color:'#48BB78',margin:'4px 0'}}>{fmt(stats.goldPago)} €</div>
              <div style={{fontSize:13,color:'#718096'}}>recebido</div>
            </div>
            <div style={{background:'#fff',borderRadius:12,padding:20,boxShadow:'0 1px 3px rgba(0,0,0,.06)',borderTop:'3px solid #ECC94B'}}>
              <div style={{fontSize:11,color:'#718096',textTransform:'uppercase',letterSpacing:'.5px',fontWeight:600}}>Comissões Pendentes</div>
              <div style={{fontSize:28,fontWeight:700,color:'#ECC94B',margin:'4px 0'}}>{fmt(stats.goldPendente)} €</div>
              <div style={{fontSize:13,color:'#718096'}}>a receber</div>
            </div>
            <div style={{background:'#fff',borderRadius:12,padding:20,boxShadow:'0 1px 3px rgba(0,0,0,.06)',borderTop:'3px solid #D4A853'}}>
              <div style={{fontSize:11,color:'#718096',textTransform:'uppercase',letterSpacing:'.5px',fontWeight:600}}>Total Indicações</div>
              <div style={{fontSize:28,fontWeight:700,color:'#D4A853',margin:'4px 0'}}>{stats.goldTotal}</div>
              <div style={{fontSize:13,color:'#718096'}}>pessoas indicadas</div>
            </div>
          </div>

          <div style={{background:'#fff',borderRadius:12,boxShadow:'0 1px 3px rgba(0,0,0,.06)',overflow:'hidden'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr>{['Data','Cliente Indicado','Contacto','Valor Crédito','Comissão','Status','Notas','Ações'].map(h => <th key={h} style={{padding:'11px 14px',textAlign:'left',fontSize:11,textTransform:'uppercase',color:'#718096',fontWeight:600,borderBottom:'1px solid #E2E8F0',background:'#F5F7FA'}}>{h}</th>)}</tr></thead>
              <tbody>{comissoesGold.map(cg => (
                <tr key={cg.id}>
                  <td style={{padding:'13px 14px',fontSize:14,borderBottom:'1px solid #E2E8F0'}}>{cg.data}</td>
                  <td style={{padding:'13px 14px',fontSize:14,borderBottom:'1px solid #E2E8F0',fontWeight:600}}>{cg.clienteIndicado}</td>
                  <td style={{padding:'13px 14px',fontSize:14,borderBottom:'1px solid #E2E8F0'}}>{cg.contacto}</td>
                  <td style={{padding:'13px 14px',fontSize:14,borderBottom:'1px solid #E2E8F0'}}>{fmt(cg.valorCredito)} €</td>
                  <td style={{padding:'13px 14px',fontSize:14,borderBottom:'1px solid #E2E8F0',fontWeight:700,color:'#D4A853'}}>{fmt(cg.comissao)} €</td>
                  <td style={{padding:'13px 14px',borderBottom:'1px solid #E2E8F0'}}>
                    <span style={{display:'inline-block',padding:'4px 12px',borderRadius:20,fontSize:12,fontWeight:600,
                      background: cg.status==='Pago' ? '#C6F6D5' : cg.status==='Pendente' ? '#FEFCBF' : cg.status==='Aprovado' ? '#BEE3F8' : '#FED7D7',
                      color: cg.status==='Pago' ? '#276749' : cg.status==='Pendente' ? '#975A16' : cg.status==='Aprovado' ? '#2B6CB0' : '#C53030'
                    }}>{cg.status}</span>
                  </td>
                  <td style={{padding:'13px 14px',fontSize:14,borderBottom:'1px solid #E2E8F0',color:'#718096'}}>{cg.notas}</td>
                  <td style={{padding:'13px 14px',borderBottom:'1px solid #E2E8F0'}}>
                    <button onClick={() => openGoldModal(cg.id)} style={{padding:'5px 10px',border:'1.5px solid #E2E8F0',borderRadius:6,background:'transparent',cursor:'pointer',marginRight:6,fontSize:13}}>✏️</button>
                    <button onClick={() => deleteGold(cg.id)} style={{padding:'5px 10px',border:'none',borderRadius:6,background:'#FED7D7',color:'#C53030',cursor:'pointer',fontSize:13}}>🗑</button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </>}
      </div>

      {/* MODAL */}
      {modal && (
        <div onClick={e => e.target === e.currentTarget && setModal(null)}
          style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',display:'flex',justifyContent:'center',alignItems:'center',zIndex:200}}>
          <div style={{background:'#fff',borderRadius:16,width:560,maxHeight:'85vh',overflowY:'auto',padding:28}} onClick={e => e.stopPropagation()}>
            <h3 style={{fontFamily:'"Playfair Display",serif',fontSize:22,color:'#1B2A4A',marginBottom:18}}>
              {modal==='client' ? (editId ? 'Editar Cliente' : 'Novo Cliente') : modal==='gold' ? (editId ? 'Editar Indicação Gold' : 'Nova Indicação Gold') : 'Nova Interação'}
            </h3>

            {modal === 'client' && (
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                {[
                  {key:'nome',label:'Nome',full:false,type:'text'},
                  {key:'tel',label:'Telefone',full:false,type:'text'},
                  {key:'email',label:'Email',full:false,type:'email'},
                  {key:'tipo',label:'Tipo',full:false,type:'select',opts:TIPOS},
                  {key:'zona',label:'Zona Preferida',full:false,type:'text'},
                  {key:'tipologia',label:'Tipologia',full:false,type:'select',opts:TIPOLOGIAS},
                  {key:'bmin',label:'Budget Mín (€)',full:false,type:'number'},
                  {key:'bmax',label:'Budget Máx (€)',full:false,type:'number'},
                  {key:'fonte',label:'Fonte',full:false,type:'select',opts:FONTES},
                  {key:'notas',label:'Notas',full:true,type:'textarea'},
                ].map(f => (
                  <div key={f.key} style={{display:'flex',flexDirection:'column',gap:4,gridColumn:f.full?'1/-1':undefined}}>
                    <label style={{fontSize:11,fontWeight:600,color:'#718096',textTransform:'uppercase',letterSpacing:'.3px'}}>{f.label}</label>
                    {f.type==='select' ? (
                      <select value={form[f.key]||''} onChange={e => setForm({...form,[f.key]:e.target.value})}
                        style={{padding:'9px 12px',border:'1.5px solid #E2E8F0',borderRadius:8,fontSize:14,outline:'none'}}>
                        {f.opts.map(o => <option key={o}>{o}</option>)}
                      </select>
                    ) : f.type==='textarea' ? (
                      <textarea value={form[f.key]||''} onChange={e => setForm({...form,[f.key]:e.target.value})}
                        style={{padding:'9px 12px',border:'1.5px solid #E2E8F0',borderRadius:8,fontSize:14,outline:'none',minHeight:70,resize:'vertical'}}/>
                    ) : (
                      <input type={f.type} value={form[f.key]||''} onChange={e => setForm({...form,[f.key]:f.type==='number'?Number(e.target.value):e.target.value})}
                        style={{padding:'9px 12px',border:'1.5px solid #E2E8F0',borderRadius:8,fontSize:14,outline:'none'}}/>
                    )}
                  </div>
                ))}
              </div>
            )}

            {modal === 'interaction' && (
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div style={{display:'flex',flexDirection:'column',gap:4}}>
                  <label style={{fontSize:11,fontWeight:600,color:'#718096',textTransform:'uppercase'}}>Cliente</label>
                  <select value={form.cliente||''} onChange={e => setForm({...form,cliente:e.target.value})} style={{padding:'9px 12px',border:'1.5px solid #E2E8F0',borderRadius:8,fontSize:14}}>
                    {clients.map(c => <option key={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:4}}>
                  <label style={{fontSize:11,fontWeight:600,color:'#718096',textTransform:'uppercase'}}>Tipo Contacto</label>
                  <select value={form.tipo||''} onChange={e => setForm({...form,tipo:e.target.value})} style={{padding:'9px 12px',border:'1.5px solid #E2E8F0',borderRadius:8,fontSize:14}}>
                    {CONTACTOS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:4}}>
                  <label style={{fontSize:11,fontWeight:600,color:'#718096',textTransform:'uppercase'}}>Assunto</label>
                  <input value={form.assunto||''} onChange={e => setForm({...form,assunto:e.target.value})} style={{padding:'9px 12px',border:'1.5px solid #E2E8F0',borderRadius:8,fontSize:14}}/>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:4}}>
                  <label style={{fontSize:11,fontWeight:600,color:'#718096',textTransform:'uppercase'}}>Follow-up</label>
                  <input type="date" value={form.followup||''} onChange={e => setForm({...form,followup:e.target.value})} style={{padding:'9px 12px',border:'1.5px solid #E2E8F0',borderRadius:8,fontSize:14}}/>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:4,gridColumn:'1/-1'}}>
                  <label style={{fontSize:11,fontWeight:600,color:'#718096',textTransform:'uppercase'}}>Detalhes</label>
                  <textarea value={form.detalhes||''} onChange={e => setForm({...form,detalhes:e.target.value})} style={{padding:'9px 12px',border:'1.5px solid #E2E8F0',borderRadius:8,fontSize:14,minHeight:70,resize:'vertical'}}/>
                </div>
              </div>
            )}

            {modal === 'gold' && (
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div style={{display:'flex',flexDirection:'column',gap:4}}>
                  <label style={{fontSize:11,fontWeight:600,color:'#718096',textTransform:'uppercase'}}>Nome do Cliente Indicado</label>
                  <input value={form.clienteIndicado||''} onChange={e => setForm({...form,clienteIndicado:e.target.value})} placeholder="Nome completo" style={{padding:'9px 12px',border:'1.5px solid #E2E8F0',borderRadius:8,fontSize:14}}/>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:4}}>
                  <label style={{fontSize:11,fontWeight:600,color:'#718096',textTransform:'uppercase'}}>Contacto</label>
                  <input value={form.contacto||''} onChange={e => setForm({...form,contacto:e.target.value})} placeholder="Telefone" style={{padding:'9px 12px',border:'1.5px solid #E2E8F0',borderRadius:8,fontSize:14}}/>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:4}}>
                  <label style={{fontSize:11,fontWeight:600,color:'#718096',textTransform:'uppercase'}}>Valor do Crédito (€)</label>
                  <input type="number" value={form.valorCredito||''} onChange={e => setForm({...form,valorCredito:Number(e.target.value)})} placeholder="0" style={{padding:'9px 12px',border:'1.5px solid #E2E8F0',borderRadius:8,fontSize:14}}/>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:4}}>
                  <label style={{fontSize:11,fontWeight:600,color:'#718096',textTransform:'uppercase'}}>Comissão (€)</label>
                  <input type="number" value={form.comissao||''} onChange={e => setForm({...form,comissao:Number(e.target.value)})} placeholder="0" style={{padding:'9px 12px',border:'1.5px solid #E2E8F0',borderRadius:8,fontSize:14}}/>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:4}}>
                  <label style={{fontSize:11,fontWeight:600,color:'#718096',textTransform:'uppercase'}}>Status</label>
                  <select value={form.status||'Pendente'} onChange={e => setForm({...form,status:e.target.value})} style={{padding:'9px 12px',border:'1.5px solid #E2E8F0',borderRadius:8,fontSize:14}}>
                    {STATUS_GOLD.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:4,gridColumn:'1/-1'}}>
                  <label style={{fontSize:11,fontWeight:600,color:'#718096',textTransform:'uppercase'}}>Notas</label>
                  <textarea value={form.notas||''} onChange={e => setForm({...form,notas:e.target.value})} placeholder="Observações sobre o crédito..." style={{padding:'9px 12px',border:'1.5px solid #E2E8F0',borderRadius:8,fontSize:14,minHeight:70,resize:'vertical'}}/>
                </div>
              </div>
            )}

            <div style={{display:'flex',justifyContent:'flex-end',gap:10,marginTop:18,paddingTop:14,borderTop:'1px solid #E2E8F0'}}>
              <button onClick={() => setModal(null)} style={{padding:'9px 18px',border:'1.5px solid #E2E8F0',borderRadius:8,background:'transparent',fontSize:14,fontWeight:600,cursor:'pointer'}}>Cancelar</button>
              <button onClick={modal==='client' ? saveClient : modal==='gold' ? saveGold : saveInteraction} style={{padding:'9px 18px',border:'none',borderRadius:8,background: modal==='gold' ? '#D4A853' : '#1B2A4A',color:'#fff',fontSize:14,fontWeight:600,cursor:'pointer'}}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
