import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Users, 
  AlertTriangle,
  BarChart3,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalSales: number;
  pendingOrders: number;
  lowStockProducts: number;
  totalCustomers: number;
  pendingPayments: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    totalCustomers: 0,
    pendingPayments: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch various statistics in parallel
      const [
        ordersResult,
        customersResult,
        productsResult,
        paymentsResult
      ] = await Promise.all([
        supabase.from('orders').select('status, final_amount'),
        supabase.from('customers').select('id'),
        supabase.from('products').select('current_stock, low_stock_threshold, name'),
        supabase.from('orders').select('pending_amount').gt('pending_amount', 0)
      ]);

      if (ordersResult.error || customersResult.error || productsResult.error || paymentsResult.error) {
        throw new Error('Failed to fetch dashboard data');
      }

      const orders = ordersResult.data || [];
      const customers = customersResult.data || [];
      const products = productsResult.data || [];
      const pendingPayments = paymentsResult.data || [];

      // Calculate stats
      const totalSales = orders
        .filter(order => order.status === 'delivered')
        .reduce((sum, order) => sum + (order.final_amount || 0), 0);

      const pendingOrders = orders.filter(order => order.status === 'pending').length;
      
      const lowStockProducts = products.filter(
        product => product.current_stock <= product.low_stock_threshold
      ).length;

      const totalCustomers = customers.length;
      const pendingPaymentsAmount = pendingPayments.reduce(
        (sum, order) => sum + (order.pending_amount || 0), 0
      );

      setStats({
        totalSales,
        pendingOrders,
        lowStockProducts,
        totalCustomers,
        pendingPayments: pendingPaymentsAmount,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Sales",
      value: `₹${stats.totalSales.toLocaleString()}`,
      description: "Revenue from delivered orders",
      icon: DollarSign,
      color: "text-turmeric",
      bgColor: "bg-turmeric/10",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      description: "Orders awaiting processing",
      icon: ShoppingCart,
      color: "text-paprika",
      bgColor: "bg-paprika/10",
    },
    {
      title: "Low Stock Alert",
      value: stats.lowStockProducts,
      description: "Products below threshold",
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers,
      description: "Registered customers",
      icon: Users,
      color: "text-cardamom",
      bgColor: "bg-cardamom/10",
    },
    {
      title: "Pending Payments",
      value: `₹${stats.pendingPayments.toLocaleString()}`,
      description: "Outstanding payments",
      icon: TrendingUp,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Business Dashboard</h1>
          <p className="text-muted-foreground">Overview of your business performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('en-IN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="transition-smooth hover:shadow-warm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Inventory Management
            </CardTitle>
            <CardDescription>
              Manage your stock levels and product catalog
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Package className="h-4 w-4 mr-2" />
              View Stock Inventory
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              Add Stock Movement
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Sales Analytics
            </CardTitle>
            <CardDescription>
              Track performance and generate reports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Sales Reports
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Salesman Performance
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="shadow-elevated">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest business activities and alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.lowStockProducts > 0 && (
              <div className="flex items-center gap-3 p-3 bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Low Stock Alert</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.lowStockProducts} products need restocking
                  </p>
                </div>
                <Badge variant="destructive">{stats.lowStockProducts}</Badge>
              </div>
            )}
            
            {stats.pendingOrders > 0 && (
              <div className="flex items-center gap-3 p-3 bg-paprika/10 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-paprika" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Pending Orders</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.pendingOrders} orders awaiting processing
                  </p>
                </div>
                <Badge className="bg-paprika text-white">{stats.pendingOrders}</Badge>
              </div>
            )}

            {stats.pendingPayments > 0 && (
              <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-accent" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Pending Payments</p>
                  <p className="text-xs text-muted-foreground">
                    ₹{stats.pendingPayments.toLocaleString()} in outstanding payments
                  </p>
                </div>
              </div>
            )}

            {stats.lowStockProducts === 0 && stats.pendingOrders === 0 && stats.pendingPayments === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-turmeric/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-turmeric" />
                </div>
                <p className="text-muted-foreground">All systems running smoothly!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;