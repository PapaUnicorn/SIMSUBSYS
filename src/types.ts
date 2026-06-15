export type SimStatus = 'Active' | 'Expiring Soon' | 'Due' | 'Overdue' | 'Suspended' | 'Terminated';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'Active' | 'Inactive' | 'Delinquent';
  joinedDate: string;
}

export interface SIMSubscription {
  id: string;
  simNumber: string;
  iccid: string;
  operator: string;
  activationDate: string;
  expiryDate: string;
  monthlyPrice: number;
  vehiclePlate: string;
  imei: string;
  status: SimStatus;
  customerId: string;
  customerName: string;
  paymentScore: number; // 0 - 100 payment behavior scoring
}

export type InvoiceStatus = 'Draft' | 'Pending Payment' | 'Paid' | 'Overdue' | 'Cancelled';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  billingPeriod: string;
  amount: number;
  status: InvoiceStatus;
  date: string;
  dueDate: string;
  transactionId?: string;
  paymentMethod?: string;
}

export interface WhatsAppTemplate {
  id: string;
  stageName: string; // e.g. D-30, D-14, Due Date, etc.
  daysIndicator: number; // e.g. -30, -14, 0, 3, etc.
  title: string;
  bodyTxt: string;
  isActive: boolean;
}

export interface WhatsAppLog {
  id: string;
  customerName: string;
  phone: string;
  stage: string;
  sentAt: string;
  messageType: 'Auto Reminder' | 'Bulk Campaign' | 'Manual';
  status: 'Sent' | 'Delivered' | 'Read' | 'Failed';
}

export interface CollectionItem {
  id: string;
  customerName: string;
  daysOverdue: number;
  balance: number;
  status: 'Reminder Sent' | 'Contacted' | 'Promise To Pay' | 'Paid' | 'Escalated';
  lastNote: string;
  phone: string;
  invoiceId: string;
}

export interface StatsOverview {
  mrr: number;
  arr: number;
  collectionRate: number;
  outstandingReceivables: number;
}
