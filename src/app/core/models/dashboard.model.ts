export interface BalanceSummary {
    totalIncomes: number;
    totalExpenses: number;
    balance: number;
}

export interface RecentTransaction {
    id: number;
    description: string;
    total: number;
    categoryName: string;
    createdAt: string;
}

export interface DailyChartEntry {
    date: string;
    total: number;
}

export interface DailyChartResponse {
    from: string;
    to: string;
    chart: DailyChartEntry[];
}

export interface IncomeExpenseDailyChartsResponse {
    from: string;
    to: string;
    incomeChart: DailyChartEntry[];
    expenseChart: DailyChartEntry[];
}
