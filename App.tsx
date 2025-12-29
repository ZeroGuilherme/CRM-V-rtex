
import React, { useState, useEffect, useMemo } from 'react';
import { Lead, LeadStatus, MessageTemplate } from './types';
import { Icons, STATUS_COLORS } from './constants';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { supabase } from './services/supabase';

// --- COMPONENTS ---

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children?: React.ReactNode;
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const Sidebar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Icons.Dashboard },
    { id: 'leads', label: 'Leads', icon: Icons.Users },
    { id: 'automation', label: 'Automação', icon: Icons.Mail },
    { id: 'analytics', label: 'Analytics', icon: Icons.Chart },
    { id: 'settings', label: 'Configurações', icon: Icons.Settings },
  ];

  return (
    <div className="w-64 bg-slate-900 h-screen fixed left-0 top-0 flex flex-col border-r border-slate-800 z-50">
      <div className="p-6">
        <h1 className="text-white text-2xl font-bold tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-sm font-black shadow-lg shadow-indigo-900/20">V</div>
          Vórtex<span className="text-indigo-500">CRM</span>
        </h1>
      </div>
      <nav className="flex-1 mt-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all ${
              activeTab === item.id 
                ? 'text-white bg-indigo-600/10 border-r-4 border-indigo-600' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <item.icon />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="p-6 border-t border-slate-800 text-slate-500 text-[10px] uppercase tracking-widest font-bold text-center">
        Vórtex Core v2.0
      </div>
    </div>
  );
};

const Header = ({ title, searchTerm, setSearchTerm }: { title: string, searchTerm: string, setSearchTerm: (v: string) => void }) => (
  <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40 shadow-sm">
    <h2 className="text-xl font-bold text-slate-800 capitalize">{title}</h2>
    <div className="flex items-center gap-4">
      <div className="relative">
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar leads por nome ou empresa..." 
          className="bg-slate-100 border-none rounded-full px-4 py-2 text-sm w-72 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
        />
      </div>
      <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs cursor-pointer hover:bg-indigo-200 transition-colors">AD</div>
    </div>
  </header>
);

const Dashboard = ({ leads, loading }: { leads: Lead[], loading: boolean }) => {
  const stats = useMemo(() => {
    const total = leads.length;
    const closed = leads.filter(l => l.status === LeadStatus.CLOSED);
    const revenuePrev = leads.reduce((acc, l) => acc + (Number(l.revenue) || 0), 0);
    const revenueClosed = closed.reduce((acc, l) => acc + (Number(l.revenue) || 0), 0);
    const convRate = total > 0 ? ((closed.length / total) * 100).toFixed(1) : 0;

    return [
      { label: 'Total Leads', value: total, color: 'indigo', icon: '👥' },
      { label: 'Taxa Conversão', value: `${convRate}%`, color: 'emerald', icon: '📈' },
      { label: 'Receita Prevista', value: `R$ ${revenuePrev.toLocaleString()}`, color: 'amber', icon: '💰' },
      { label: 'Vendas Fechadas', value: `R$ ${revenueClosed.toLocaleString()}`, color: 'green', icon: '✅' },
    ];
  }, [leads]);

  const chartData = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toLocaleDateString('pt-BR', { weekday: 'short' });
    }).reverse();

    return last7Days.map(day => ({
      name: day,
      leads: Math.floor(Math.random() * 5) + (leads.length > 5 ? 2 : 0)
    }));
  }, [leads]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{s.label}</p>
              <span className="text-lg opacity-50">{s.icon}</span>
            </div>
            <h3 className="text-2xl font-black text-slate-800">{loading ? '...' : s.value}</h3>
            <div className={`absolute bottom-0 left-0 h-1 bg-indigo-500 w-full opacity-20`}></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            📊 Fluxo de Atividade
          </h4>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Area type="monotone" dataKey="leads" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="text-lg font-bold text-slate-800 mb-6">Saúde do Funil</h4>
          <div className="space-y-5">
            {Object.values(LeadStatus).map(status => {
              const count = leads.filter(l => l.status === status).length;
              const percentage = leads.length > 0 ? (count / leads.length) * 100 : 0;
              return (
                <div key={status} className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase tracking-tighter">
                    <span>{status}</span>
                    <span>{count}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-indigo-500 transition-all duration-1000 ease-out" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const LeadsList = ({ leads, onDeleteLead, onEditLead, onAddLead, loading }: { leads: Lead[], onDeleteLead: (id: string) => void, onEditLead: (l: Lead) => void, onAddLead: () => void, loading: boolean }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
          <h4 className="text-lg font-bold text-slate-800">Base de Clientes</h4>
          <p className="text-sm text-slate-500 font-medium">Gerenciando {leads.length} registros ativos</p>
        </div>
        <button 
          onClick={onAddLead}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-100 active:scale-95"
        >
          <Icons.Plus /> Adicionar Lead
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[900px]">
          <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-widest">
            <tr>
              <th className="px-6 py-5">Lead / Empresa</th>
              <th className="px-6 py-5">Status</th>
              <th className="px-6 py-5">Receita Estimada</th>
              <th className="px-6 py-5">Criado em</th>
              <th className="px-6 py-5 text-center w-48">Gestão</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              [1, 2, 3, 4].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-6 py-8">
                    <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                  </td>
                </tr>
              ))
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-slate-400 italic font-medium">Nenhum lead encontrado na base de dados.</td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shadow-sm">
                        {lead.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{lead.name}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">{lead.company}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${STATUS_COLORS[lead.status] || 'bg-slate-100'}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700 text-sm">
                    R$ {(Number(lead.revenue) || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400 font-bold">
                    {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        type="button"
                        onClick={() => onEditLead(lead)}
                        className="flex items-center justify-center w-10 h-10 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-md border border-transparent hover:border-slate-200 rounded-xl transition-all active:scale-90"
                        title="Editar Lead"
                      >
                        <Icons.Edit />
                      </button>
                      <button 
                        type="button"
                        onClick={() => onDeleteLead(lead.id)}
                        className="flex items-center justify-center w-10 h-10 text-slate-400 hover:text-rose-600 hover:bg-white hover:shadow-md border border-transparent hover:border-slate-200 rounded-xl transition-all active:scale-90"
                        title="Excluir Lead"
                      >
                        <Icons.Trash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- MAIN APP ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState({ title: '', sub: '', type: 'success' });

  const [formState, setFormState] = useState({ name: '', company: '', revenue: '', status: LeadStatus.NEW });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formatted: Lead[] = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        company: item.company,
        email: item.email || '',
        phone: item.phone || '',
        status: item.status as LeadStatus,
        source: item.source || 'Manual',
        tags: [],
        revenue: Number(item.revenue) || 0,
        createdAt: item.created_at,
      }));
      
      setLeads(formatted);
    } catch (err: any) {
      console.error('Erro de sincronização:', err);
      triggerToast('Falha de Rede', 'Não foi possível conectar ao banco de dados.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = useMemo(() => {
    return leads.filter(l => 
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      l.company.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [leads, searchTerm]);

  const triggerToast = (title: string, sub: string, type: string = 'success') => {
    setToastMsg({ title, sub, type });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const handleDeleteLead = async (id: string) => {
    if (!window.confirm("Esta ação removerá o lead permanentemente da nuvem. Confirmar exclusão?")) return;
    
    try {
      console.log(`Tentando deletar lead ID: ${id}`);
      const { error, status } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Erro detalhado do Supabase:", error);
        // Tratamento específico para erros de permissão RLS
        if (error.code === '42501' || error.message.toLowerCase().includes('permission')) {
          triggerToast('Erro de Segurança', 'Ação bloqueada. Execute o SQL de permissão no Supabase.', 'error');
        } else {
          throw error;
        }
        return;
      }

      // Se status for 204 ou similar sem erro, a exclusão foi bem sucedida
      console.log(`Sucesso! Status da resposta: ${status}`);
      setLeads(prev => prev.filter(l => l.id !== id));
      triggerToast('Lead Removido', 'O registro foi excluído com sucesso.');
    } catch (err: any) {
      console.error('Falha crítica ao deletar:', err);
      triggerToast('Erro na Exclusão', err.message || 'Verifique sua conexão.', 'error');
    }
  };

  const handleOpenAdd = () => {
    setEditingLeadId(null);
    setFormState({ name: '', company: '', revenue: '', status: LeadStatus.NEW });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (lead: Lead) => {
    setEditingLeadId(lead.id);
    setFormState({ 
      name: lead.name, 
      company: lead.company, 
      revenue: lead.revenue.toString(), 
      status: lead.status 
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const leadData = {
      name: formState.name,
      company: formState.company,
      revenue: Number(formState.revenue) || 0,
      status: formState.status,
    };

    try {
      if (editingLeadId) {
        const { error } = await supabase.from('leads').update(leadData).eq('id', editingLeadId);
        if (error) throw error;
        setLeads(prev => prev.map(l => l.id === editingLeadId ? { ...l, ...leadData } : l));
        triggerToast('Lead Atualizado', 'Os dados foram salvos com sucesso.');
      } else {
        const insertData = { ...leadData, email: 'contato@vortex.com', phone: '0000', source: 'Manual' };
        const { data, error } = await supabase.from('leads').insert([insertData]).select();
        if (error) throw error;
        if (data && data[0]) {
            const newItem = data[0];
            const formatted: Lead = {
              id: newItem.id,
              name: newItem.name,
              company: newItem.company,
              email: newItem.email,
              phone: newItem.phone,
              status: newItem.status as LeadStatus,
              source: newItem.source,
              tags: [],
              revenue: Number(newItem.revenue),
              createdAt: newItem.created_at,
            };
            setLeads([formatted, ...leads]);
            triggerToast('Lead Cadastrado', 'Novo cliente adicionado ao funil.');
        }
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Erro ao salvar:', err);
      triggerToast('Erro ao Salvar', 'Verifique sua conexão ou permissões SQL.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        <Header title={activeTab} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <div className="p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && <Dashboard leads={leads} loading={loading} />}
          {activeTab === 'leads' && <LeadsList leads={filteredLeads} onDeleteLead={handleDeleteLead} onEditLead={handleOpenEdit} onAddLead={handleOpenAdd} loading={loading} />}
          {activeTab === 'analytics' && <div className="p-20 text-center text-slate-400 font-bold tracking-widest uppercase">Módulo de Análise Pro</div>}
          {activeTab === 'automation' && <div className="p-20 text-center text-slate-400 font-bold tracking-widest uppercase">IA Copilot (Gemini v3)</div>}
          {activeTab === 'settings' && <div className="p-20 text-center text-slate-400 font-bold tracking-widest uppercase">Workspace Settings</div>}
        </div>
      </main>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingLeadId ? "Editar Informações" : "Novo Lead"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Nome Completo</label>
            <input required type="text" value={formState.name} onChange={e => setFormState({...formState, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Empresa / Projeto</label>
            <input required type="text" value={formState.company} onChange={e => setFormState({...formState, company: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Receita (R$)</label>
              <input type="number" value={formState.revenue} onChange={e => setFormState({...formState, revenue: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Estágio</label>
              <select value={formState.status} onChange={e => setFormState({...formState, status: e.target.value as LeadStatus})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat shadow-inner cursor-pointer">
                {Object.values(LeadStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 mt-4 active:scale-95">
            {editingLeadId ? "Salvar Alterações" : "Efetuar Cadastro"}
          </button>
        </form>
      </Modal>

      {showToast && (
        <div className={`fixed bottom-8 right-8 ${toastMsg.type === 'error' ? 'bg-rose-600' : 'bg-slate-900'} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-full duration-500 z-[100] border-l-4 ${toastMsg.type === 'error' ? 'border-rose-400' : 'border-emerald-400'}`}>
          <div className={`w-10 h-10 ${toastMsg.type === 'error' ? 'bg-white/20' : 'bg-emerald-500/20'} rounded-full flex items-center justify-center text-white font-bold shrink-0`}>
            {toastMsg.type === 'error' ? '!' : '✓'}
          </div>
          <div className="min-w-0 pr-4">
            <p className="font-bold text-sm truncate">{toastMsg.title}</p>
            <p className="text-[10px] opacity-90 font-medium leading-tight">{toastMsg.sub}</p>
          </div>
        </div>
      )}
    </div>
  );
}
