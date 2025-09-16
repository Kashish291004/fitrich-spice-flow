import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Plus, 
  Minus, 
  TrendingDown, 
  TrendingUp,
  AlertTriangle,
  Boxes,
  PackagePlus,
  PackageMinus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import InventoryTable from './InventoryTable';
import StockMovementForm from './StockMovementForm';
import AddProductForm from './AddProductForm';

interface Product {
  id: string;
  name: string;
  unit: string;
  current_stock: number;
  low_stock_threshold: number;
  price_per_unit: number;
  gst_percentage: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface StockMovement {
  id: string;
  product_id: string;
  movement_type: string;
  quantity: number;
  reason: string;
  created_at: string;
  products?: {
    name: string;
  };
}

const InventoryManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [recentMovements, setRecentMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      
      const [productsResult, movementsResult] = await Promise.all([
        supabase.from('products').select('*').eq('is_active', true).order('name'),
        supabase
          .from('stock_movements')
          .select(`
            *,
            products (name)
          `)
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      if (productsResult.error) throw productsResult.error;
      if (movementsResult.error) throw movementsResult.error;

      setProducts(productsResult.data || []);
      setRecentMovements(movementsResult.data || []);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      toast({
        title: "Error",
        description: "Failed to load inventory data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStockUpdate = () => {
    fetchInventoryData();
  };

  const totalProducts = products.length;
  const lowStockCount = products.filter(p => p.current_stock <= p.low_stock_threshold).length;
  const totalStockValue = products.reduce((sum, p) => sum + (p.current_stock * p.price_per_unit), 0);
  const outOfStockCount = products.filter(p => p.current_stock === 0).length;

  const summaryCards = [
    {
      title: "Total Products",
      value: totalProducts,
      description: "Active products in inventory",
      icon: Package,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Low Stock Items",
      value: lowStockCount,
      description: "Products below threshold",
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      title: "Out of Stock",
      value: outOfStockCount,
      description: "Products with zero stock",
      icon: TrendingDown,
      color: "text-paprika",
      bgColor: "bg-paprika/10",
    },
    {
      title: "Total Stock Value",
      value: `₹${totalStockValue.toLocaleString()}`,
      description: "Current inventory worth",
      icon: TrendingUp,
      color: "text-turmeric",
      bgColor: "bg-turmeric/10",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
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
          <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground">Manage your masala inventory and stock levels</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setActiveTab('add-product')} 
            className="bg-turmeric hover:bg-turmeric/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => (
          <Card key={index} className="transition-smooth hover:shadow-warm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Inventory Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Boxes className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="add-stock" className="flex items-center gap-2">
            <PackagePlus className="h-4 w-4" />
            Add Stock
          </TabsTrigger>
          <TabsTrigger value="remove-stock" className="flex items-center gap-2">
            <PackageMinus className="h-4 w-4" />
            Remove Stock
          </TabsTrigger>
          <TabsTrigger value="add-product" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <InventoryTable products={products} onRefresh={handleStockUpdate} />
          
          {/* Recent Stock Movements */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Stock Movements</CardTitle>
              <CardDescription>Latest inventory transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentMovements.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No recent stock movements</p>
                ) : (
                  recentMovements.map((movement) => (
                    <div key={movement.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          movement.movement_type === 'in' ? 'bg-turmeric/10' : 'bg-paprika/10'
                        }`}>
                          {movement.movement_type === 'in' ? (
                            <TrendingUp className={`h-4 w-4 text-turmeric`} />
                          ) : (
                            <TrendingDown className={`h-4 w-4 text-paprika`} />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{movement.products?.name}</p>
                          <p className="text-sm text-muted-foreground">{movement.reason}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          movement.movement_type === 'in' ? 'text-turmeric' : 'text-paprika'
                        }`}>
                          {movement.movement_type === 'in' ? '+' : '-'}{movement.quantity}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(movement.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add-stock">
          <StockMovementForm 
            products={products} 
            movementType="in" 
            onSuccess={handleStockUpdate}
          />
        </TabsContent>

        <TabsContent value="remove-stock">
          <StockMovementForm 
            products={products} 
            movementType="out" 
            onSuccess={handleStockUpdate}
          />
        </TabsContent>

        <TabsContent value="add-product">
          <AddProductForm onSuccess={handleStockUpdate} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryManagement;