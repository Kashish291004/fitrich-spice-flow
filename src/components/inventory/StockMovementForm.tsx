import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PackagePlus, PackageMinus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  current_stock: number;
  unit: string;
}

interface StockMovementFormProps {
  products: Product[];
  movementType: 'in' | 'out';
  onSuccess: () => void;
}

const StockMovementForm: React.FC<StockMovementFormProps> = ({ 
  products, 
  movementType, 
  onSuccess 
}) => {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProductId || !quantity || !reason) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const quantityNum = parseFloat(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid positive number",
        variant: "destructive",
      });
      return;
    }

    // Check if removing stock doesn't exceed current stock
    if (movementType === 'out') {
      const product = products.find(p => p.id === selectedProductId);
      if (product && quantityNum > product.current_stock) {
        toast({
          title: "Insufficient Stock",
          description: `Cannot remove ${quantityNum} units. Only ${product.current_stock} units available.`,
          variant: "destructive",
        });
        return;
      }
    }

    try {
      setLoading(true);

      // Update product stock
      const product = products.find(p => p.id === selectedProductId);
      const newStock = movementType === 'in' 
        ? (product?.current_stock || 0) + quantityNum
        : (product?.current_stock || 0) - quantityNum;

      const [stockUpdate, movementInsert] = await Promise.all([
        supabase
          .from('products')
          .update({ current_stock: newStock, updated_at: new Date().toISOString() })
          .eq('id', selectedProductId),
        supabase
          .from('stock_movements')
          .insert({
            product_id: selectedProductId,
            movement_type: movementType,
            quantity: quantityNum,
            reason: reason.trim(),
            created_by: '11111111-1111-1111-1111-111111111111' // Using admin user ID from mock
          })
      ]);

      if (stockUpdate.error) throw stockUpdate.error;
      if (movementInsert.error) throw movementInsert.error;

      toast({
        title: "Success",
        description: `Stock ${movementType === 'in' ? 'added' : 'removed'} successfully`,
      });

      // Reset form
      setSelectedProductId('');
      setQuantity('');
      setReason('');
      
      // Refresh data
      onSuccess();
    } catch (error) {
      console.error('Error updating stock:', error);
      toast({
        title: "Error",
        description: "Failed to update stock. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = products.find(p => p.id === selectedProductId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {movementType === 'in' ? (
            <PackagePlus className="h-5 w-5 text-turmeric" />
          ) : (
            <PackageMinus className="h-5 w-5 text-paprika" />
          )}
          {movementType === 'in' ? 'Add Stock' : 'Remove Stock'}
        </CardTitle>
        <CardDescription>
          {movementType === 'in' 
            ? 'Increase inventory levels by adding stock'
            : 'Decrease inventory levels by removing stock'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="product">Select Product *</Label>
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{product.name}</span>
                      <span className="ml-2 text-muted-foreground text-sm">
                        ({product.current_stock} {product.unit})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedProduct && (
              <p className="text-sm text-muted-foreground">
                Current stock: {selectedProduct.current_stock} {selectedProduct.unit}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">
              Quantity ({selectedProduct?.unit || 'units'}) *
            </Label>
            <Input
              id="quantity"
              type="number"
              min="0.01"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={`Reason for ${movementType === 'in' ? 'adding' : 'removing'} stock...`}
              rows={3}
            />
          </div>

          <div className="flex gap-4">
            <Button 
              type="submit" 
              disabled={loading}
              className={movementType === 'in' 
                ? 'bg-turmeric hover:bg-turmeric/90' 
                : 'bg-paprika hover:bg-paprika/90'
              }
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {movementType === 'in' ? 'Add Stock' : 'Remove Stock'}
            </Button>
            
            <Button 
              type="button" 
              variant="outline"
              onClick={() => {
                setSelectedProductId('');
                setQuantity('');
                setReason('');
              }}
            >
              Clear Form
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default StockMovementForm;