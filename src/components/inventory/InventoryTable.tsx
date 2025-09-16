import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertTriangle, Package, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

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

interface InventoryTableProps {
  products: Product[];
  onRefresh: () => void;
}

const InventoryTable: React.FC<InventoryTableProps> = ({ products, onRefresh }) => {
  const getStockStatus = (current: number, threshold: number) => {
    if (current === 0) return { status: 'Out of Stock', variant: 'destructive' as const, color: 'text-destructive' };
    if (current <= threshold) return { status: 'Low Stock', variant: 'outline' as const, color: 'text-paprika' };
    return { status: 'In Stock', variant: 'secondary' as const, color: 'text-turmeric' };
  };

  const getStockIcon = (current: number, threshold: number) => {
    if (current === 0) return <AlertTriangle className="h-4 w-4 text-destructive" />;
    if (current <= threshold) return <TrendingDown className="h-4 w-4 text-paprika" />;
    return <TrendingUp className="h-4 w-4 text-turmeric" />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Current Inventory
            </CardTitle>
            <CardDescription>
              All products and their current stock levels
            </CardDescription>
          </div>
          <Button onClick={onRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Product Name</TableHead>
                <TableHead className="font-semibold">Unit</TableHead>
                <TableHead className="font-semibold text-center">Current Stock</TableHead>
                <TableHead className="font-semibold text-center">Threshold</TableHead>
                <TableHead className="font-semibold text-center">Status</TableHead>
                <TableHead className="font-semibold text-right">Price/Unit</TableHead>
                <TableHead className="font-semibold text-right">Stock Value</TableHead>
                <TableHead className="font-semibold text-center">GST%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No products found. Add some products to get started.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => {
                  const stockStatus = getStockStatus(product.current_stock, product.low_stock_threshold);
                  const stockValue = product.current_stock * product.price_per_unit;
                  
                  return (
                    <TableRow 
                      key={product.id}
                      className={`hover:bg-muted/50 transition-colors ${
                        product.current_stock === 0 ? 'bg-destructive/5' : 
                        product.current_stock <= product.low_stock_threshold ? 'bg-paprika/5' : ''
                      }`}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStockIcon(product.current_stock, product.low_stock_threshold)}
                          <div>
                            <p className="font-medium">{product.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{product.unit}</TableCell>
                      <TableCell className="text-center">
                        <span className={`font-semibold ${stockStatus.color}`}>
                          {product.current_stock}
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {product.low_stock_threshold}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={stockStatus.variant} className="text-xs">
                          {stockStatus.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₹{product.price_per_unit.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ₹{stockValue.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {product.gst_percentage}%
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        
        {products.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Total Products: {products.length}</span>
              <span>
                Total Stock Value: ₹{products.reduce((sum, p) => sum + (p.current_stock * p.price_per_unit), 0).toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InventoryTable;