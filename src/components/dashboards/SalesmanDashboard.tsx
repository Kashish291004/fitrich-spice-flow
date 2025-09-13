import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  Plus,
  Clock,
  CheckCircle,
  DollarSign
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface SalesmanStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalSales: number;
  customersManaged: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  customer_name: string;
  final_amount: number;
  status: string;
  created_at: string;
}

const SalesmanDashboard = () => {
  const [stats, setStats] = useState<SalesmanStats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalSales: 0,
    customersManaged: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (profile?.id) {
      fetchSalesmanStats();
    }
  }, [profile]);

  const fetchSalesmanStats = async () => {
    try {
      if (!profile?.id) return;

      // Fetch orders created by this salesman
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          customers(name)
        `)
        .eq('salesman_id', profile.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch customers managed by this salesman
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('id')
        .eq('created_by', profile.id);

      if (customersError) throw customersError;

      // Calculate statistics
      const totalOrders = orders?.length || 0;
      const pendingOrders = orders?.filter(order => order.status === 'pending').length || 0;
      const completedOrders = orders?.filter(order => order.status === 'delivered').length || 0;
      const totalSales = orders
        ?.filter(order => order.status === 'delivered')
        .reduce((sum, order) => sum + (order.final_amount || 0), 0) || 0;
      const customersManaged = customers?.length || 0;

      setStats({
        totalOrders,
        pendingOrders,
        completedOrders,
        totalSales,
        customersManaged,
      });

      // Set recent orders (last 5)
      const recent = orders?.slice(0, 5).map(order => ({
        id: order.id,
        order_number: order.order_number,
        customer_name: order.customers?.name || 'Unknown',
        final_amount: order.final_amount,
        status: order.status,
        created_at: order.created_at,
      })) || [];

      setRecentOrders(recent);
    } catch (error) {
      console.error('Error fetching salesman stats:', error);
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
      title: "Total Orders",
      value: stats.totalOrders,
      description: "Orders created by you",
      icon: ShoppingCart,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      description: "Awaiting processing",
      icon: Clock,
      color: "text-paprika",
      bgColor: "bg-paprika/10",
    },
    {
      title: "Completed Orders",
      value: stats.completedOrders,
      description: "Successfully delivered",
      icon: CheckCircle,
      color: "text-cardamom",
      bgColor: "bg-cardamom/10",
    },
    {
      title: "Total Sales",
      value: `₹${stats.totalSales.toLocaleString()}`,
      description: "Revenue generated",
      icon: DollarSign,
      color: "text-turmeric",
      bgColor: "bg-turmeric/10",
    },
    {
      title: "Customers",
      value: stats.customersManaged,
      description: "Customers managed",
      icon: Users,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-paprika text-white';
      case 'in_progress':
        return 'bg-turmeric text-primary-foreground';
      case 'delivered':
        return 'bg-cardamom text-white';
      case 'cancelled':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Salesman Dashboard</h1>
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
          <h1 className="text-3xl font-bold text-foreground">Salesman Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {profile?.full_name}!</p>
        </div>
        <Button 
          onClick={() => navigate('/create-order')}
          className="bg-gradient-primary hover:opacity-90 transition-smooth shadow-warm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Order
        </Button>
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
              <ShoppingCart className="h-5 w-5 text-primary" />
              Order Management
            </CardTitle>
            <CardDescription>
              Create and manage customer orders
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full justify-start bg-gradient-primary hover:opacity-90"
              onClick={() => navigate('/create-order')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Order
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => navigate('/my-orders')}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              View My Orders
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Customer Management
            </CardTitle>
            <CardDescription>
              Manage customer relationships
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => navigate('/customers')}
            >
              <Users className="h-4 w-4 mr-2" />
              View Customers
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Customer
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="shadow-elevated">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Your latest order activity</CardDescription>
        </CardHeader>
        <CardContent>
          {recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-foreground">{order.order_number}</p>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      ₹{order.final_amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="h-8 w-8 text-primary" />
              </div>
              <p className="text-muted-foreground mb-4">No orders created yet</p>
              <Button 
                onClick={() => navigate('/create-order')}
                className="bg-gradient-primary hover:opacity-90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Order
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesmanDashboard;