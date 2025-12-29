
export enum LeadStatus {
  NEW = 'Novo',
  CONTACTED = 'Contatado',
  INTERESTED = 'Interessado',
  NEGOTIATION = 'Negociação',
  CLOSED = 'Fechado',
  LOST = 'Perdido'
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: LeadStatus;
  source: string;
  tags: string[];
  revenue: number;
  lastContacted?: string;
  createdAt: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  type: 'whatsapp' | 'email';
}

export interface AutomationTask {
  id: string;
  leadId: string;
  templateId: string;
  scheduledFor: string;
  status: 'pending' | 'sent' | 'failed';
}

export interface Interaction {
  id: string;
  leadId: string;
  type: 'call' | 'email' | 'whatsapp' | 'note';
  content: string;
  timestamp: string;
}
