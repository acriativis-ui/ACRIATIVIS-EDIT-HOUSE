
import React from 'react';

export type UserRole = 'admin' | 'client' | 'editor' | 'tv';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company?: string;
  avatar?: string;
}

export interface AuthSession {
  user: User;
  token: string;
}

export type ViewState = 
  | 'dashboard' 
  | 'clients' 
  | 'projects' 
  | 'financial' 
  | 'cloud' 
  | 'prospecting' 
  | 'contracts' 
  | 'scripts' 
  | 'referrals' 
  | 'editing_room' 
  | 'editors';

export interface DeliveryFile {
  id: string;
  name: string;
  url: string;
  type: string;
  uploadedAt: string;
  size: string;
}

export interface DeliveryChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

export interface AlterationItem {
  id: string;
  task: string;
  completed: boolean;
  sourceText?: string; 
}

export interface BillingEntry {
  id: string;
  description: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending';
}

export interface Project {
  id: string;
  name: string;
  client: string;
  value: number;
  deadline: string; // ISO Date String (YYYY-MM-DD)
  status: 'em_revisao' | 'ativo' | 'concluido' | 'aprovado' | 'arquivado';
  description?: string;
  createdAt?: string;
  clientId?: string;
  editorId?: string;
  deliveries?: DeliveryFile[];
  expectedDeliveries?: number; 
  deliveryChecklist?: DeliveryChecklistItem[];
  alterations?: AlterationItem[]; 
  billing?: BillingEntry[];
  activeFeedback?: string; 
}

export interface FinancialTransaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string; 
  clientId?: string; 
  date: string;
  status: 'paid' | 'pending';
  isRecurring?: boolean; 
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  company: string;
  phone: string;
  status: 'lead' | 'contacted' | 'negotiating' | 'closed';
}

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  matchScore: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'critical' | 'warning' | 'info';
  timestamp: Date;
  read: boolean;
  projectId?: string;
}

export interface PixPaymentResponse {
  id: number;
  status: string;
  status_detail: string;
  date_created: string;
  date_of_expiration: string;
  point_of_interaction: {
    transaction_data: {
      qr_code: string;
      qr_code_base64: string;
      ticket_url: string;
    };
  };
}
