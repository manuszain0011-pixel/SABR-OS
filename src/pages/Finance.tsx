import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { useApp } from '@/context/AppContext';
import { useZakat } from '@/hooks/useZakat';
import { FinanceTransaction, Subscription, Debt, FinancialGoal, Budget } from '@/types';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, subMonths, addMonths } from 'date-fns';
import {
  Plus, TrendingUp, TrendingDown, Wallet, Trash2, DollarSign, CreditCard, Target,
  PieChart, Calendar, Edit2, MoreVertical, Receipt, Repeat, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Building2, Sparkles, Check, ChevronLeft, ChevronRight,
  Calculator, Coins, HandHeart, Scale, Store as StoreIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Rental', 'Business', 'Gift', 'Refund', 'Other'];
const EXPENSE_CATEGORIES = ['Food & Dining', 'Transportation', 'Utilities', 'Housing', 'Entertainment', 'Shopping', 'Health', 'Education', 'Sadaqah', 'Family', 'Travel', 'Insurance', 'Other'];

const GOAL_CATEGORIES = [
  { value: 'emergency', label: 'Emergency Fund', icon: AlertTriangle },
  { value: 'savings', label: 'Savings', icon: Wallet },
  { value: 'investment', label: 'Investment', icon: TrendingUp },
  { value: 'purchase', label: 'Major Purchase', icon: CreditCard },
  { value: 'charity', label: 'Charity', icon: Sparkles },
  { value: 'hajj', label: 'Hajj/Umrah', icon: Building2 },
  { value: 'other', label: 'Other', icon: Target },
];

const DEBT_TYPES = [
  { value: 'loan', label: 'Personal Loan' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'personal', label: 'Personal Debt' },
  { value: 'other', label: 'Other' },
];

export default function Finance() {
  const {
    profile,
    transactions = [], createTransaction, updateTransaction, deleteTransaction,
    subscriptions = [], createSubscription, updateSubscription, deleteSubscription,
    debts = [], createDebt, updateDebt, deleteDebt,
    financialGoals = [], createFinancialGoal, updateFinancialGoal, deleteFinancialGoal,
    budgets = [], createBudget, updateBudget, deleteBudget,
    settings,
  } = useApp();

  const { zakatRecords = [], createZakatRecord, updateZakatRecord, deleteZakatRecord, calculateZakat, NISAB_SILVER, NISAB_GOLD } = useZakat();

  // States
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const [debtDialogOpen, setDebtDialogOpen] = useState(false);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [payDebtDialogOpen, setPayDebtDialogOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<any | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [monthOffset, setMonthOffset] = useState(0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings?.default_currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Forms
  const [transactionForm, setTransactionForm] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    isRecurring: false,
  });

  const [subscriptionForm, setSubscriptionForm] = useState({
    name: '',
    amount: '',
    frequency: 'monthly' as Subscription['frequency'],
    category: '',
    nextBillingDate: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
  });

  const [debtForm, setDebtForm] = useState({
    name: '',
    type: 'loan' as Debt['type'],
    totalAmount: '',
    remainingAmount: '',
    interestRate: '',
    minimumPayment: '',
    lender: '',
  });

  const [goalForm, setGoalForm] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: format(addMonths(new Date(), 12), 'yyyy-MM-dd'),
    category: 'savings' as FinancialGoal['category'],
  });

  const [budgetForm, setBudgetForm] = useState({
    category: '',
    monthlyLimit: '',
  });

  const [zakatForm, setZakatForm] = useState({
    cash: '',
    gold: '',
    silver: '',
    investments: '',
    business: '',
    debts: '',
    nisabStandard: 'silver' as 'gold' | 'silver',
  });

  const [zakatPaymentDialog, setZakatPaymentDialog] = useState<{ open: boolean, year: number | null, amount: string }>({
    open: false,
    year: null,
    amount: ''
  });

  const zakatCalculation = useMemo(() => {
    if (typeof calculateZakat !== 'function') {
      return { totalAssets: 0, netWealth: 0, isZakatableSilver: false, isZakatableGold: false, zakatDueSilver: 0, zakatDueGold: 0, nisabSilver: 0, nisabGold: 0 };
    }
    return calculateZakat(
      parseFloat(zakatForm.cash) || 0,
      parseFloat(zakatForm.gold) || 0,
      parseFloat(zakatForm.silver) || 0,
      parseFloat(zakatForm.investments) || 0,
      parseFloat(zakatForm.business) || 0,
      parseFloat(zakatForm.debts) || 0
    );
  }, [zakatForm, calculateZakat]);

  const activeZakatResults = useMemo(() => {
    const isSilver = zakatForm.nisabStandard === 'silver';
    return {
      isZakatable: isSilver ? zakatCalculation.isZakatableSilver : zakatCalculation.isZakatableGold,
      zakatDue: isSilver ? zakatCalculation.zakatDueSilver : zakatCalculation.zakatDueGold,
      threshold: isSilver ? zakatCalculation.nisabSilver : zakatCalculation.nisabGold,
    };
  }, [zakatCalculation, zakatForm.nisabStandard]);

  // Combined Zakat Records data
  const processedZakatRecords = useMemo(() => {
    return zakatRecords.map(record => {
      const due = parseFloat(record.zakat_due as any) || 0;
      const paidFromRecord = parseFloat(record.zakat_paid as any) || 0;

      // We no longer auto-match transactions to avoid the "ghost payment" bug
      // where one transaction marks all assessments for the year as paid.
      // Assessments now rely on their specific 'zakat_paid' field.

      const totalPaid = paidFromRecord;
      const isPaid = record.is_paid || (due > 0 && totalPaid >= (due - 0.01));
      const progress = due > 0 ? Math.min(100, Math.round((totalPaid / due) * 100)) : 0;

      return {
        ...record,
        zakat_due: due,
        actual_paid: totalPaid,
        is_paid: isPaid,
        progress
      };
    });
  }, [zakatRecords]);

  // Selected month calculations
  const selectedMonth = addMonths(new Date(), monthOffset);
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);

  // Stats calculations
  const stats = useMemo(() => {
    const monthTransactions = (transactions || []).filter(t =>
      t.date && isWithinInterval(parseISO(t.date), { start: monthStart, end: monthEnd })
    );

    const allTransactions = transactions || [];
    const totalIncome = allTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalExpenses = allTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
    const allTimeBalance = totalIncome - totalExpenses;

    const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
    const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
    const balance = income - expenses;
    const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0;

    // Category breakdown
    const expensesByCategory = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        if (t.category) {
          acc[t.category] = (acc[t.category] || 0) + (t.amount || 0);
        }
        return acc;
      }, {} as Record<string, number>);

    const incomeByCategory = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => {
        if (t.category) {
          acc[t.category] = (acc[t.category] || 0) + (t.amount || 0);
        }
        return acc;
      }, {} as Record<string, number>);

    // Subscriptions total
    const activeSubscriptions = (subscriptions || []).filter(s => s.is_active);
    const monthlySubsTotal = activeSubscriptions.reduce((sum, s) => {
      const cycle = s.billing_cycle || 'monthly';
      const amount = s.amount || 0;
      if (cycle === 'monthly') return sum + amount;
      if (cycle === 'yearly') return sum + amount / 12;
      if (cycle === 'quarterly') return sum + amount / 3;
      return sum;
    }, 0);

    // Total debt
    const totalDebt = (debts || []).filter(d => !d.is_paid).reduce((sum, d) => sum + (d.current_amount || 0), 0);

    // Financial goals progress
    const activeGoals = (financialGoals || []).filter(g => !g.is_achieved);
    const totalGoalTarget = activeGoals.reduce((sum, g) => sum + (g.target_amount || 0), 0);
    const totalGoalCurrent = activeGoals.reduce((sum, g) => sum + (g.current_amount || 0), 0);
    const overallGoalProgress = totalGoalTarget > 0 ? Math.round((totalGoalCurrent / totalGoalTarget) * 100) : 0;
    const potentialZakat = Math.round(Math.max(0, balance) * 12 * 0.025);

    // Net worth (simplified)
    const netWorth = (balance * 6) - totalDebt + totalGoalCurrent;

    return {
      income,
      expenses,
      balance,
      savingsRate,
      expensesByCategory,
      incomeByCategory,
      monthlySubsTotal,
      totalDebt,
      totalGoalTarget,
      totalGoalCurrent,
      overallGoalProgress,
      potentialZakat,
      netWorth,
      allTimeBalance,
      transactionCount: monthTransactions.length,
    };
  }, [transactions, subscriptions, debts, financialGoals, monthStart, monthEnd]);

  // Handlers
  const handleAddTransaction = async () => {
    if (!transactionForm.amount || !transactionForm.category) return;

    await createTransaction({
      type: transactionForm.type,
      amount: parseFloat(transactionForm.amount),
      category: transactionForm.category,
      description: transactionForm.description,
      date: transactionForm.date,
      is_recurring: transactionForm.isRecurring,
    });

    setTransactionDialogOpen(false);
    setTransactionForm({
      type: 'expense',
      amount: '',
      category: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      isRecurring: false,
    });
  };

  const handleDeleteTransaction = async (id: string) => {
    await deleteTransaction(id);
  };

  const handleAddSubscription = async () => {
    if (!subscriptionForm.name || !subscriptionForm.amount) return;

    await createSubscription({
      name: subscriptionForm.name,
      amount: parseFloat(subscriptionForm.amount),
      billing_cycle: subscriptionForm.frequency,
      category: subscriptionForm.category,
      next_billing_date: subscriptionForm.nextBillingDate,
      start_date: format(new Date(), 'yyyy-MM-dd'),
      is_active: true,
    });

    setSubscriptionDialogOpen(false);
    setSubscriptionForm({
      name: '',
      amount: '',
      frequency: 'monthly',
      category: '',
      nextBillingDate: format(new Date(), 'yyyy-MM-dd'),
      notes: '',
    });
  };

  const toggleSubscriptionStatus = async (id: string, currentStatus: boolean | null) => {
    await updateSubscription({
      id,
      is_active: !currentStatus
    });
  };

  const handleDeleteSubscription = async (id: string) => {
    await deleteSubscription(id);
  };

  const handleAddDebt = async () => {
    if (!debtForm.name || !debtForm.totalAmount) return;

    await createDebt({
      name: debtForm.name,
      type: debtForm.type,
      original_amount: parseFloat(debtForm.totalAmount),
      current_amount: parseFloat(debtForm.remainingAmount || debtForm.totalAmount),
      interest_rate: parseFloat(debtForm.interestRate || '0'),
      contact_name: debtForm.lender,
      is_paid: false,
    });

    setDebtDialogOpen(false);
    setDebtForm({
      name: '',
      type: 'loan',
      totalAmount: '',
      remainingAmount: '',
      interestRate: '',
      minimumPayment: '',
      lender: '',
    });
  };

  const handleLogZakatPayment = async () => {
    if (!zakatPaymentDialog.amount || !zakatPaymentDialog.year) return;

    // Find the record to update
    const recordToUpdate = zakatRecords.find(r => r.year === zakatPaymentDialog.year);
    if (!recordToUpdate) return;

    const amount = parseFloat(zakatPaymentDialog.amount);
    const newPaidAmount = (parseFloat(recordToUpdate.zakat_paid as any) || 0) + amount;
    const isNowFullyPaid = newPaidAmount >= (parseFloat(recordToUpdate.zakat_due as any) || 0) - 0.01;

    // 1. Update the Zakat Record in DB
    await updateZakatRecord.mutateAsync({
      id: recordToUpdate.id,
      zakat_paid: newPaidAmount,
      is_paid: isNowFullyPaid,
      payment_date: format(new Date(), 'yyyy-MM-dd')
    });

    // 2. Create the associated Finance Transaction
    await createTransaction({
      type: 'expense',
      amount: amount,
      category: 'Charity/Zakat',
      description: `Zakat Payment ${zakatPaymentDialog.year}`,
      date: format(new Date(), 'yyyy-MM-dd'),
      is_recurring: false,
    });

    setZakatPaymentDialog({ open: false, year: null, amount: '' });
    toast.success('Payment recorded in Zakat and Finance history!');
  };

  const handleUpdateDebtAmount = async (id: string, amount: number) => {
    await updateDebt({
      id,
      current_amount: amount,
      is_paid: amount <= 0
    });
  };

  const handleDeleteDebt = async (id: string) => {
    await deleteDebt(id);
  };

  const handleDeleteBudget = async (id: string) => {
    await deleteBudget(id);
  };

  const handleAddGoal = async () => {
    if (!goalForm.name || !goalForm.targetAmount) return;

    await createFinancialGoal({
      name: goalForm.name,
      target_amount: parseFloat(goalForm.targetAmount),
      current_amount: parseFloat(goalForm.currentAmount || '0'),
      target_date: goalForm.targetDate,
      category: goalForm.category,
      is_achieved: false,
    });

    setGoalDialogOpen(false);
    setGoalForm({
      name: '',
      targetAmount: '',
      currentAmount: '',
      targetDate: format(addMonths(new Date(), 12), 'yyyy-MM-dd'),
      category: 'savings',
    });
  };

  const handleUpdateGoalProgress = async (id: string, amount: number, target: number) => {
    await updateFinancialGoal({
      id,
      current_amount: amount,
      is_achieved: amount >= target
    });
  };

  const handleDeleteGoal = async (id: string) => {
    await deleteFinancialGoal(id);
  };

  const handleAddBudget = async () => {
    if (!budgetForm.category || !budgetForm.monthlyLimit) return;

    await createBudget({
      category: budgetForm.category,
      amount: parseFloat(budgetForm.monthlyLimit),
      month: selectedMonth.getMonth() + 1,
      year: selectedMonth.getFullYear(),
      period: 'monthly'
    });

    setBudgetDialogOpen(false);
    setBudgetForm({ category: '', monthlyLimit: '' });
  };


  const recentTransactions = useMemo(() => {
    return [...transactions]
      .filter(t => isWithinInterval(parseISO(t.date), { start: monthStart, end: monthEnd }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 20);
  }, [transactions, monthStart, monthEnd]);

  return (
    <div className="space-y-6 animate-fade-in app-3d-root">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Finance Hub</h1>
          <p className="text-muted-foreground">Manage your finances and Zakat</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setMonthOffset(prev => prev - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[120px] text-center">
            {format(selectedMonth, 'MMMM yyyy')}
          </span>
          <Button variant="outline" size="icon" onClick={() => setMonthOffset(prev => prev + 1)} disabled={monthOffset >= 0}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          {monthOffset !== 0 && (
            <Button variant="ghost" size="sm" onClick={() => setMonthOffset(0)}>Today</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bento-card">
          <p className="text-sm font-medium text-muted-foreground mb-1">Income</p>
          <p className="text-2xl font-bold text-primary">{formatCurrency(stats.income)}</p>
        </div>
        <div className="bento-card">
          <p className="text-sm font-medium text-muted-foreground mb-1">Expenses</p>
          <p className="text-2xl font-bold text-destructive">{formatCurrency(stats.expenses)}</p>
        </div>
        <div className="bento-card">
          <p className="text-sm font-medium text-muted-foreground mb-1">Balance</p>
          <p className={cn("text-2xl font-bold", stats.balance >= 0 ? "text-primary" : "text-destructive")}>
            {formatCurrency(Math.abs(stats.balance))}
          </p>
        </div>
        <div className="bento-card">
          <p className="text-sm font-medium text-muted-foreground mb-1">Savings Rate</p>
          <p className="text-2xl font-bold text-accent">{stats.savingsRate}%</p>
        </div>
        <div className="bento-card gradient-green text-primary-foreground">
          <p className="text-sm font-medium opacity-90 mb-1">Net Worth</p>
          <p className="text-2xl font-bold">{formatCurrency(stats.netWorth)}</p>
        </div>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList className="tabs-list-neumorphic grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 h-auto gap-1">
          <TabsTrigger value="transactions" className="tab-trigger-neumorphic"><Receipt className="h-4 w-4 mr-1" />Flux</TabsTrigger>
          <TabsTrigger value="budgets" className="tab-trigger-neumorphic"><PieChart className="h-4 w-4 mr-1" />Budgets</TabsTrigger>
          <TabsTrigger value="subscriptions" className="tab-trigger-neumorphic"><Repeat className="h-4 w-4 mr-1" />Subs</TabsTrigger>
          <TabsTrigger value="debts" className="tab-trigger-neumorphic"><CreditCard className="h-4 w-4 mr-1" />Debts</TabsTrigger>
          <TabsTrigger value="goals" className="tab-trigger-neumorphic"><Target className="h-4 w-4 mr-1" />Goals</TabsTrigger>
          <TabsTrigger value="zakat" className="tab-trigger-neumorphic"><HandHeart className="h-4 w-4 mr-1" />Zakat</TabsTrigger>
        </TabsList>

        {/* TRANSACTIONS TAB */}
        <TabsContent value="transactions" className="space-y-4">
          <div className="flex items-center justify-between">
            <Dialog open={transactionDialogOpen} onOpenChange={setTransactionDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Transaction</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={transactionForm.type === 'income' ? 'default' : 'outline'}
                      onClick={() => setTransactionForm(prev => ({ ...prev, type: 'income', category: '' }))}
                      className={cn("flex-1", transactionForm.type === 'income' && 'gradient-green border-0')}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />Income
                    </Button>
                    <Button
                      type="button"
                      variant={transactionForm.type === 'expense' ? 'default' : 'outline'}
                      onClick={() => setTransactionForm(prev => ({ ...prev, type: 'expense', category: '' }))}
                      className={cn("flex-1", transactionForm.type === 'expense' && 'bg-destructive hover:bg-destructive/90 border-0')}
                    >
                      <TrendingDown className="h-4 w-4 mr-2" />Expense
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-muted-foreground">Amount</label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={transactionForm.amount}
                        onChange={(e) => setTransactionForm(prev => ({ ...prev, amount: e.target.value }))}
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Date</label>
                      <Input
                        type="date"
                        value={transactionForm.date}
                        onChange={(e) => setTransactionForm(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Category</label>
                    <Select value={transactionForm.category} onValueChange={(v) => setTransactionForm(prev => ({ ...prev, category: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {(transactionForm.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    placeholder="Description (optional)"
                    value={transactionForm.description}
                    onChange={(e) => setTransactionForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={transactionForm.isRecurring}
                      onCheckedChange={(v) => setTransactionForm(prev => ({ ...prev, isRecurring: v }))}
                    />
                    <span className="text-sm">Recurring transaction</span>
                  </div>
                  <Button onClick={handleAddTransaction} className="w-full" disabled={!transactionForm.amount || !transactionForm.category}>
                    Add Transaction
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Category Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bento-card">
              <h4 className="font-medium mb-3">Expense Breakdown</h4>
              {Object.keys(stats.expensesByCategory).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No expenses this month</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(stats.expensesByCategory)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 6)
                    .map(([category, amount]) => {
                      const percentage = Math.round((amount / stats.expenses) * 100);
                      return (
                        <div key={category}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{category}</span>
                            <span className="text-muted-foreground">{formatCurrency(amount)} ({percentage}%)</span>
                          </div>
                          <Progress value={percentage} className="h-1.5" />
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
            <div className="bento-card">
              <h4 className="font-medium mb-3">Income Breakdown</h4>
              {Object.keys(stats.incomeByCategory).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No income this month</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(stats.incomeByCategory)
                    .sort(([, a], [, b]) => b - a)
                    .map(([category, amount]) => {
                      const percentage = Math.round((amount / stats.income) * 100);
                      return (
                        <div key={category}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{category}</span>
                            <span className="text-muted-foreground">{formatCurrency(amount)} ({percentage}%)</span>
                          </div>
                          <Progress value={percentage} className="h-1.5" />
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bento-card">
            <h4 className="font-medium mb-4">Transactions</h4>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No transactions this month</div>
            ) : (
              <div className="space-y-2">
                {recentTransactions.map(t => (
                  <div key={t.id} className="flex items-center justify-between py-3 px-4 rounded-lg bg-secondary/30 group">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg", t.type === 'income' ? "bg-primary/10" : "bg-destructive/10")}>
                        {t.type === 'income' ? <ArrowUpRight className="h-4 w-4 text-primary" /> : <ArrowDownRight className="h-4 w-4 text-destructive" />}
                      </div>
                      <div>
                        <p className="font-medium">{t.category}</p>
                        <p className="text-sm text-muted-foreground">{t.description || format(parseISO(t.date), 'MMM d')}</p>
                      </div>
                      {t.is_recurring && <Badge variant="outline" className="text-xs"><Repeat className="h-3 w-3 mr-1" />Recurring</Badge>}
                    </div>
                    <div className="flex items-center gap-3">
                      <p className={cn("font-semibold", t.type === 'income' ? "text-primary" : "text-destructive")}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </p>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteTransaction(t.id)} className="opacity-0 group-hover:opacity-100 text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* BUDGETS TAB */}
        <TabsContent value="budgets" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Monthly Budgets</h3>
            <Dialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Add Budget</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Budget</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Select value={budgetForm.category} onValueChange={(v) => setBudgetForm(prev => ({ ...prev, category: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div>
                    <label className="text-sm text-muted-foreground">Monthly Limit</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={budgetForm.monthlyLimit}
                      onChange={(e) => setBudgetForm(prev => ({ ...prev, monthlyLimit: e.target.value }))}
                    />
                  </div>
                  <Button onClick={handleAddBudget} className="w-full" disabled={!budgetForm.category || !budgetForm.monthlyLimit}>
                    Create Budget
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {budgets.length === 0 ? (
            <div className="bento-card text-center py-12">
              <PieChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No budgets set. Create one to track your spending!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {budgets.map(budget => {
                const spent = stats.expensesByCategory[budget.category] || 0;
                const limit = budget.amount || 0;
                const percentage = Math.min(Math.round((spent / limit) * 100), 100);
                const isOverBudget = spent > limit;
                const remaining = limit - spent;

                return (
                  <div key={budget.id} className={cn(
                    "bento-card",
                    isOverBudget && "border-destructive/30"
                  )}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{budget.category}</h4>
                      <div className="flex items-center gap-2">
                        {isOverBudget && <Badge variant="destructive">Over Budget</Badge>}
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteBudget(budget.id)} className="h-8 w-8 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Spent: {formatCurrency(spent)}</span>
                      <span className="font-medium">Limit: {formatCurrency(limit)}</span>
                    </div>
                    <Progress
                      value={percentage}
                      className={cn("h-2", isOverBudget && "[&>div]:bg-destructive")}
                    />
                    <p className={cn(
                      "text-sm mt-2",
                      isOverBudget ? "text-destructive" : "text-muted-foreground"
                    )}>
                      {isOverBudget
                        ? `${formatCurrency(Math.abs(remaining))} over budget`
                        : `${formatCurrency(remaining)} remaining`
                      }
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* SUBSCRIPTIONS TAB */}
        <TabsContent value="subscriptions" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Active Subscriptions</h3>
              <p className="text-sm text-muted-foreground">~{formatCurrency(stats.monthlySubsTotal)}/month</p>
            </div>
            <Dialog open={subscriptionDialogOpen} onOpenChange={setSubscriptionDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Add Subscription</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Subscription</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input
                    placeholder="Subscription name"
                    value={subscriptionForm.name}
                    onChange={(e) => setSubscriptionForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-muted-foreground">Amount</label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={subscriptionForm.amount}
                        onChange={(e) => setSubscriptionForm(prev => ({ ...prev, amount: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Frequency</label>
                      <Select value={subscriptionForm.frequency} onValueChange={(v) => setSubscriptionForm(prev => ({ ...prev, frequency: v as Subscription['frequency'] }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Select value={subscriptionForm.category} onValueChange={(v) => setSubscriptionForm(prev => ({ ...prev, category: v }))}>
                    <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <div>
                    <label className="text-sm text-muted-foreground">Next Billing Date</label>
                    <Input
                      type="date"
                      value={subscriptionForm.nextBillingDate}
                      onChange={(e) => setSubscriptionForm(prev => ({ ...prev, nextBillingDate: e.target.value }))}
                    />
                  </div>
                  <Button onClick={handleAddSubscription} className="w-full" disabled={!subscriptionForm.name || !subscriptionForm.amount}>
                    Add Subscription
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {subscriptions.filter(s => s.is_active).length === 0 ? (
            <div className="bento-card text-center py-12">
              <Repeat className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No subscriptions tracked</p>
            </div>
          ) : (
            <div className="space-y-3">
              {subscriptions.filter(s => s.is_active).map(sub => (
                <div key={sub.id} className="bento-card flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Repeat className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{sub.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {sub.category} • Next: {sub.next_billing_date ? format(parseISO(sub.next_billing_date), 'MMM d') : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(sub.amount)}</p>
                      <p className="text-xs text-muted-foreground">/{sub.billing_cycle}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteSubscription(sub.id)} className="opacity-0 group-hover:opacity-100 text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* DEBTS TAB */}
        <TabsContent value="debts" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Debt Tracker</h3>
              <p className="text-sm text-muted-foreground">Total: {formatCurrency(stats.totalDebt)}</p>
            </div>
            <Dialog open={debtDialogOpen} onOpenChange={setDebtDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Add Debt</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Debt</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input
                    placeholder="Debt name"
                    value={debtForm.name}
                    onChange={(e) => setDebtForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Select value={debtForm.type} onValueChange={(v) => setDebtForm(prev => ({ ...prev, type: v as Debt['type'] }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DEBT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-muted-foreground">Total Amount</label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={debtForm.totalAmount}
                        onChange={(e) => setDebtForm(prev => ({ ...prev, totalAmount: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Remaining</label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={debtForm.remainingAmount}
                        onChange={(e) => setDebtForm(prev => ({ ...prev, remainingAmount: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="number"
                      placeholder="Interest Rate %"
                      value={debtForm.interestRate}
                      onChange={(e) => setDebtForm(prev => ({ ...prev, interestRate: e.target.value }))}
                    />
                    <Input
                      type="number"
                      placeholder="Min Payment"
                      value={debtForm.minimumPayment}
                      onChange={(e) => setDebtForm(prev => ({ ...prev, minimumPayment: e.target.value }))}
                    />
                  </div>
                  <Input
                    placeholder="Lender (optional)"
                    value={debtForm.lender}
                    onChange={(e) => setDebtForm(prev => ({ ...prev, lender: e.target.value }))}
                  />
                  <Button onClick={handleAddDebt} className="w-full" disabled={!debtForm.name || !debtForm.totalAmount}>
                    Add Debt
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {debts.filter(d => !d.is_paid).length === 0 ? (
            <div className="bento-card text-center py-12">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No debts tracked. Alhamdulillah! 🎉</p>
            </div>
          ) : (
            <div className="space-y-3">
              {debts.filter(d => !d.is_paid).map(debt => {
                const totalAmount = debt.original_amount || 0;
                const remainingAmount = debt.current_amount || 0;
                const paidOff = totalAmount - remainingAmount;
                const percentage = totalAmount > 0 ? Math.round((paidOff / totalAmount) * 100) : 0;

                return (
                  <div key={debt.id} className="bento-card">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{debt.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {DEBT_TYPES.find(t => t.value === debt.type)?.label}
                          {debt.contact_name && ` • ${debt.contact_name}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-destructive">{formatCurrency(remainingAmount)}</p>
                        <p className="text-xs text-muted-foreground">of {formatCurrency(totalAmount)}</p>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2 mb-2" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{percentage}% paid off</span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedDebt(debt);
                            setPayAmount('');
                            setPayDebtDialogOpen(true);
                          }}
                          className="border-primary/20 text-primary hover:bg-primary/5 font-black uppercase tracking-widest text-[10px]"
                        >
                          <DollarSign className="h-3 w-3 mr-1" /> Pay
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateDebtAmount(debt.id, Math.max(0, remainingAmount - 100))}
                          className="border-[#0B5B42]/20 text-[#0B5B42] hover:bg-[#0B5B42]/5 font-black uppercase tracking-widest text-[10px]"
                        >
                          Quick Pay $100
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteDebt(debt.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pay Debt Dialog */}
          <Dialog open={payDebtDialogOpen} onOpenChange={setPayDebtDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Pay Debt: {selectedDebt?.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm text-muted-foreground">Remaining: ${selectedDebt?.current_amount?.toLocaleString()}</label>
                  <div className="flex gap-4 mt-2">
                    <Input
                      type="number"
                      placeholder="Enter amount to pay"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      autoFocus
                    />
                    <Button
                      onClick={() => {
                        if (!selectedDebt || !payAmount) return;
                        const amount = parseFloat(payAmount);
                        if (isNaN(amount)) return;
                        handleUpdateDebtAmount(selectedDebt.id, Math.max(0, (selectedDebt.current_amount || 0) - amount));
                        setPayDebtDialogOpen(false);
                      }}
                      className="whitespace-nowrap"
                    >
                      Make Payment
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[25, 50, 100].map(amt => (
                    <Button
                      key={amt}
                      variant="outline"
                      onClick={() => setPayAmount(amt.toString())}
                      className="text-xs"
                    >
                      ${amt}
                    </Button>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* GOALS TAB */}
        <TabsContent value="goals" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Financial Goals</h3>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(stats.totalGoalCurrent)} / {formatCurrency(stats.totalGoalTarget)}
              </p>
            </div>
            <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Add Goal</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Financial Goal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input
                    placeholder="Goal name"
                    value={goalForm.name}
                    onChange={(e) => setGoalForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Select value={goalForm.category} onValueChange={(v) => setGoalForm(prev => ({ ...prev, category: v as FinancialGoal['category'] }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {GOAL_CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          <div className="flex items-center gap-2">
                            <cat.icon className="h-4 w-4" />
                            {cat.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-muted-foreground">Target Amount</label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={goalForm.targetAmount}
                        onChange={(e) => setGoalForm(prev => ({ ...prev, targetAmount: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Current Amount</label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={goalForm.currentAmount}
                        onChange={(e) => setGoalForm(prev => ({ ...prev, currentAmount: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Target Date</label>
                    <Input
                      type="date"
                      value={goalForm.targetDate}
                      onChange={(e) => setGoalForm(prev => ({ ...prev, targetDate: e.target.value }))}
                    />
                  </div>
                  <Button onClick={handleAddGoal} className="w-full" disabled={!goalForm.name || !goalForm.targetAmount}>
                    Create Goal
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {financialGoals.filter(g => !g.is_achieved).length === 0 ? (
            <div className="bento-card text-center py-12">
              <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No financial goals set</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {financialGoals.filter(g => !g.is_achieved).map(goal => {
                const currentAmount = goal.current_amount || 0;
                const targetAmount = goal.target_amount || 1;
                const percentage = Math.round((currentAmount / targetAmount) * 100);
                const remaining = targetAmount - currentAmount;
                const GoalIcon = GOAL_CATEGORIES.find(c => c.value === goal.category)?.icon || Target;

                return (
                  <div key={goal.id} className="bento-card">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Target className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{goal.name}</h4>
                          <p className="text-xs text-muted-foreground capitalize">{(goal.category || '').replace('_', ' ')}</p>
                        </div>
                      </div>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDeleteGoal(goal.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>{formatCurrency(currentAmount)}</span>
                      <span className="text-muted-foreground">{formatCurrency(targetAmount)}</span>
                    </div>
                    <Progress value={percentage} className="h-2 mb-2" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{percentage}% • ${remaining.toLocaleString()} to go</span>
                      <Button size="sm" onClick={() => handleUpdateGoalProgress(goal.id, currentAmount + 100, targetAmount)}>+$100</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ZAKAT TAB */}
        <TabsContent value="zakat" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calculator Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bento-card border-t-4 border-gold">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 rounded-2xl bg-gold/10 shadow-inner">
                    <Calculator className="h-6 w-6 text-gold" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight">Zakat Calculator</h3>
                    <p className="text-sm text-muted-foreground">Calculate your obligatory charity based on current wealth</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-primary" /> Cash & Bank
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 px-2"
                        onClick={() => setZakatForm({ ...zakatForm, cash: stats.allTimeBalance.toString() })}
                      >
                        Sync Balance ({formatCurrency(stats.allTimeBalance)})
                      </Button>
                    </div>
                    <Input
                      placeholder="Enter cash amount"
                      type="number"
                      className="bg-muted/50 border-none focus-visible:ring-gold"
                      value={zakatForm.cash}
                      onChange={e => setZakatForm({ ...zakatForm, cash: e.target.value })}
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Coins className="h-4 w-4 text-primary" /> Gold & Silver Value
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground ml-1">Gold</span>
                        <Input
                          placeholder="Gold"
                          type="number"
                          className="bg-muted/50 border-none focus-visible:ring-gold"
                          value={zakatForm.gold}
                          onChange={e => setZakatForm({ ...zakatForm, gold: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground ml-1">Silver</span>
                        <Input
                          placeholder="Silver"
                          type="number"
                          className="bg-muted/50 border-none focus-visible:ring-gold"
                          value={zakatForm.silver}
                          onChange={e => setZakatForm({ ...zakatForm, silver: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" /> Investments
                    </h4>
                    <Input
                      placeholder="Market value of shares/funds"
                      type="number"
                      className="bg-muted/50 border-none focus-visible:ring-gold"
                      value={zakatForm.investments}
                      onChange={e => setZakatForm({ ...zakatForm, investments: e.target.value })}
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <StoreIcon className="h-4 w-4 text-primary" /> Business Assets
                    </h4>
                    <Input
                      placeholder="Value of sellable stock"
                      type="number"
                      className="bg-muted/50 border-none focus-visible:ring-gold"
                      value={zakatForm.business}
                      onChange={e => setZakatForm({ ...zakatForm, business: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-dashed">
                  <div className="space-y-4 max-w-md">
                    <h4 className="font-semibold text-sm flex items-center gap-2 text-destructive">
                      <TrendingDown className="h-4 w-4" /> Deductible Debts
                    </h4>
                    <Input
                      placeholder="Debts due now (e.g. bills, loans)"
                      type="number"
                      className="bg-red-50/50 border-none focus-visible:ring-destructive"
                      value={zakatForm.debts}
                      onChange={e => setZakatForm({ ...zakatForm, debts: e.target.value })}
                    />
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Only include debts that are due immediately or within the current Zakat lunar year.
                      Long-term mortgage amounts should not be deducted in full.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              <div className="bento-card bg-white dark:bg-[#0B5B42] text-black dark:text-white shadow-xl overflow-hidden relative border-none">
                <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 pointer-events-none">
                  <Scale className="h-24 w-24" />
                </div>

                <h3 className="font-bold text-lg mb-6 flex items-center gap-2 relative z-10 text-primary dark:text-white">
                  <div className="p-1.5 rounded-lg bg-primary/10 dark:bg-white/20">
                    <Scale className="h-4 w-4" />
                  </div>
                  Review Summary
                </h3>

                <div className="space-y-5 relative z-10">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground dark:text-white/80">Total Assets</span>
                    <span className="font-mono text-base font-bold text-primary dark:text-white">
                      {formatCurrency(zakatCalculation.totalAssets)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground dark:text-white/80">Liabilities</span>
                    <span className="font-mono text-base font-bold text-red-600 dark:text-red-300">
                      -${(parseFloat(zakatForm.debts) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="h-px bg-black/5 dark:bg-white/10" />
                  <div className="flex justify-between items-center py-1">
                    <span className="font-bold text-base text-foreground dark:text-white">Net Wealth</span>
                    <span className="font-mono text-2xl font-black text-primary dark:text-white tracking-tight">
                      {formatCurrency(zakatCalculation.netWealth)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setZakatForm(prev => ({ ...prev, nisabStandard: 'silver' }))}
                      className={cn(
                        "p-3 rounded-xl transition-all text-left group border text-xs",
                        zakatForm.nisabStandard === 'silver'
                          ? "bg-primary dark:bg-white text-white dark:text-[#0B5B42] shadow-lg ring-2 ring-primary/20 dark:ring-white/30 border-transparent"
                          : "bg-muted dark:bg-white/10 hover:bg-muted/80 dark:hover:bg-white/20 text-muted-foreground dark:text-white/70 border-border dark:border-transparent opacity-80 hover:opacity-100"
                      )}
                    >
                      <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-bold mb-1">
                        <span>Silver</span>
                        <span>${zakatCalculation.nisabSilver.toLocaleString()}</span>
                      </div>
                      <p className={cn("text-[9px] font-medium transition-colors", zakatForm.nisabStandard === 'silver' ? "opacity-80" : "opacity-60")}>Preferred</p>
                      {zakatCalculation.isZakatableSilver && (
                        <Badge className={cn("mt-2 text-[10px] py-0 h-4 border-none font-bold", zakatForm.nisabStandard === 'silver' ? "bg-white dark:bg-[#0B5B42] text-primary dark:text-white" : "bg-primary dark:bg-white text-white dark:text-[#0B5B42]")}>
                          Eligible
                        </Badge>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setZakatForm(prev => ({ ...prev, nisabStandard: 'gold' }))}
                      className={cn(
                        "p-3 rounded-xl transition-all text-left group border text-xs",
                        zakatForm.nisabStandard === 'gold'
                          ? "bg-primary dark:bg-white text-white dark:text-[#0B5B42] shadow-lg ring-2 ring-primary/20 dark:ring-white/30 border-transparent"
                          : "bg-muted dark:bg-white/10 hover:bg-muted/80 dark:hover:bg-white/20 text-muted-foreground dark:text-white/70 border-border dark:border-transparent opacity-80 hover:opacity-100"
                      )}
                    >
                      <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-bold mb-1">
                        <span>Gold</span>
                        <span>${zakatCalculation.nisabGold.toLocaleString()}</span>
                      </div>
                      <p className={cn("text-[9px] font-medium transition-colors", zakatForm.nisabStandard === 'gold' ? "opacity-80" : "opacity-60")}>Standard</p>
                      {zakatCalculation.isZakatableGold && (
                        <Badge className={cn("mt-2 text-[10px] py-0 h-4 border-none font-bold", zakatForm.nisabStandard === 'gold' ? "bg-white dark:bg-[#0B5B42] text-primary dark:text-white" : "bg-primary dark:bg-white text-white dark:text-[#0B5B42]")}>
                          Eligible
                        </Badge>
                      )}
                    </button>
                  </div>

                  {activeZakatResults.isZakatable ? (
                    <div className="mt-8 pt-8 border-t border-black/5 dark:border-white/20 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <p className="text-xs uppercase tracking-widest font-black text-muted-foreground dark:text-white/70 mb-2">Zakat Payable (2.5%)</p>
                      <p className="text-5xl font-black tracking-tighter mb-8 bg-gradient-to-br from-primary via-primary to-gold-dark dark:from-white dark:to-white/70 bg-clip-text text-transparent">
                        {formatCurrency(activeZakatResults.zakatDue)}
                      </p>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          variant="outline"
                          className="flex-1 border-primary/20 hover:bg-primary/5 font-bold h-12 rounded-2xl"
                          onClick={async () => {
                            const loadingToast = toast.loading('Logging Zakat assessment...');
                            try {
                              const payload = {
                                year: new Date().getFullYear(),
                                cash_amount: parseFloat(zakatForm.cash) || 0,
                                gold_value: parseFloat(zakatForm.gold) || 0,
                                silver_value: parseFloat(zakatForm.silver) || 0,
                                investments_value: parseFloat(zakatForm.investments) || 0,
                                business_value: parseFloat(zakatForm.business) || 0,
                                debts_deducted: parseFloat(zakatForm.debts) || 0,
                                nisab_amount: activeZakatResults.threshold,
                                total_zakatable_wealth: zakatCalculation.netWealth,
                                zakat_due: activeZakatResults.zakatDue,
                                zakat_paid: 0,
                                is_paid: false
                              };
                              await createZakatRecord.mutateAsync(payload);
                              toast.dismiss(loadingToast);
                              toast.success('Assessment logged in history!');
                            } catch (error: any) {
                              toast.dismiss(loadingToast);
                              toast.error(`Error: ${error.message}`);
                            }
                          }}
                        >
                          Log Only
                        </Button>
                        <Button
                          variant="default"
                          className="flex-[2] bg-primary dark:bg-white text-white dark:text-[#0B5B42] hover:bg-primary/90 dark:hover:bg-white/90 font-black h-12 rounded-2xl shadow-xl border-none"
                          onClick={async () => {
                            const loadingToast = toast.loading('Logging & Processing Payment...');
                            try {
                              const year = new Date().getFullYear();
                              // 1. Create the Zakat record
                              await createZakatRecord.mutateAsync({
                                year,
                                cash_amount: parseFloat(zakatForm.cash) || 0,
                                gold_value: parseFloat(zakatForm.gold) || 0,
                                silver_value: parseFloat(zakatForm.silver) || 0,
                                investments_value: parseFloat(zakatForm.investments) || 0,
                                business_value: parseFloat(zakatForm.business) || 0,
                                debts_deducted: parseFloat(zakatForm.debts) || 0,
                                nisab_amount: activeZakatResults.threshold,
                                total_zakatable_wealth: zakatCalculation.netWealth,
                                zakat_due: activeZakatResults.zakatDue,
                                zakat_paid: activeZakatResults.zakatDue, // Mark full amount as paid here
                                is_paid: true,
                                payment_date: format(new Date(), 'yyyy-MM-dd')
                              });

                              // 2. Create the associated Finance Transaction
                              await createTransaction({
                                type: 'expense',
                                amount: activeZakatResults.zakatDue,
                                category: 'Charity/Zakat',
                                description: `Zakat Payment ${year}`,
                                date: format(new Date(), 'yyyy-MM-dd'),
                                is_recurring: false,
                              });

                              toast.dismiss(loadingToast);
                              toast.success('Zakat assessed and paid from cash balance! 🕋');
                            } catch (error: any) {
                              toast.dismiss(loadingToast);
                              toast.error(`Error: ${error.message}`);
                            }
                          }}
                        >
                          Log & Pay Now
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-8 pt-8 border-t border-black/5 dark:border-white/10 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Sparkles className="h-8 w-8 text-primary/40 dark:text-white/40 mb-2" />
                        <p className="font-black text-xl text-primary dark:text-white">Below Nisab</p>
                        <p className="text-xs text-muted-foreground dark:text-white/70 px-4 leading-relaxed font-medium">
                          Your net wealth is below the selected {zakatForm.nisabStandard} threshold. Zakat is not obligatory at this time.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Previous Records */}
              <div className="bento-card">
                <h4 className="font-medium mb-3">History</h4>
                {processedZakatRecords.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No records found</p>
                ) : (
                  <div className="space-y-4">
                    {processedZakatRecords.map(record => (
                      <div key={record.id} className="p-4 rounded-2xl bg-secondary/20 border border-secondary/30">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-black text-lg">Year {record.year}</p>
                            <p className="text-xs text-muted-foreground font-medium">Due: ${record.zakat_due.toLocaleString()}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={record.is_paid ? 'default' : 'outline'}
                                className={cn(
                                  "font-black tracking-tight",
                                  record.is_paid ? "bg-primary text-white" : "border-primary/30 text-primary"
                                )}
                              >
                                {record.is_paid ? 'Fully Paid' : record.progress > 0 ? 'Partially Paid' : 'Unpaid'}
                              </Badge>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-destructive hover:bg-destructive/10 rounded-full"
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this Zakat assessment?')) {
                                    deleteZakatRecord.mutate(record.id);
                                  }
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                            {!record.is_paid && (
                              <button
                                onClick={() => setZakatPaymentDialog({
                                  open: true,
                                  year: record.year,
                                  amount: (record.zakat_due - record.actual_paid).toString()
                                })}
                                className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                              >
                                Log Payment
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            <span>Payment Progress</span>
                            <span>{record.progress}%</span>
                          </div>
                          <Progress value={record.progress} className="h-2 bg-primary/10" />
                          <div className="flex justify-between text-[10px] font-black mt-1">
                            <span className="text-primary">${record.actual_paid.toLocaleString()} Paid</span>
                            <span className="text-muted-foreground">${Math.max(0, record.zakat_due - record.actual_paid).toLocaleString()} Remaining</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Zakat Payment Dialog */}
      <Dialog open={zakatPaymentDialog.open} onOpenChange={(open) => setZakatPaymentDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-[400px] border-none shadow-2xl rounded-3xl overflow-hidden p-0 dark:bg-[#031C16]">
          <div className="bg-primary/5 dark:bg-white/5 p-6 pb-2">
            <h3 className="text-xl font-black tracking-tighter text-primary dark:text-white flex items-center gap-2">
              <HandHeart className="h-5 w-5" />
              Log Zakat Payment
            </h3>
            <p className="text-xs text-muted-foreground font-medium mt-1">Recording payment for Year {zakatPaymentDialog.year}</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Payment Amount ($)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={zakatPaymentDialog.amount}
                onChange={(e) => setZakatPaymentDialog(prev => ({ ...prev, amount: e.target.value }))}
                className="h-14 bg-secondary/30 border-none rounded-2xl text-lg font-bold px-5 focus-visible:ring-primary/20"
              />
            </div>
            <div className="bg-primary/5 dark:bg-white/5 p-4 rounded-2xl">
              <div className="flex items-start gap-3">
                <Sparkles className="h-4 w-4 text-primary dark:text-white mt-0.5" />
                <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                  This will automatically create an expense transaction in your <span className="text-primary dark:text-white font-bold">Flux Transactions</span> under the <span className="text-primary dark:text-white font-bold">Charity/Zakat</span> category.
                </p>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 h-12 rounded-2xl font-bold border-secondary/50"
                onClick={() => setZakatPaymentDialog({ open: false, year: null, amount: '' })}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 h-12 rounded-2xl font-black bg-primary dark:bg-white text-white dark:text-[#0B5B42] hover:bg-primary/90"
                onClick={handleLogZakatPayment}
                disabled={!zakatPaymentDialog.amount || parseFloat(zakatPaymentDialog.amount) <= 0}
              >
                Log Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <div className="text-center text-sm text-muted-foreground italic mt-8">
        "Wealth does not decrease by charity." - Prophet Muhammad ﷺ
      </div>
    </div>
  );
}