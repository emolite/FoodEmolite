export type RevenueGroupBy = 'day' | 'month';

export interface RevenueQuery {
  fromDate?: string | null;
  toDate?: string | null;
  groupBy?: RevenueGroupBy;
}

export interface RevenueLineChartItem {
  label: string;
  revenue: number;
  orderCount: number;
}

export interface RevenuePieChartItem {
  label: string;
  value: number;
}

export interface AdminRevenueResponse {
  totalAgents: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  lineChart: RevenueLineChartItem[];
  pieChart: RevenuePieChartItem[];
}

export interface AgentRevenueResponse {
  totalOrders: number;
  totalRevenue: number;
  lineChart: RevenueLineChartItem[];
  pieChart: RevenuePieChartItem[];
}