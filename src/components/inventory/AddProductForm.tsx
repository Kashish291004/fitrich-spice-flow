import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AddProductFormProps {
  onSuccess: () => void;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    opening_stock: '',
    low_stock_threshold: '',
    price_per_unit: '',
    gst_percentage: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.unit || !formData.price_per_unit) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const openingStock = parseFloat(formData.opening_stock) || 0;
    const lowStockThreshold = parseFloat(formData.low_stock_threshold) || 10;
    const pricePerUnit = parseFloat(formData.price_per_unit);
    const gstPercentage = parseFloat(formData.gst_percentage) || 0;

    if (isNaN(pricePerUnit) || pricePerUnit <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price per unit",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from('products')
        .insert({
          name: formData.name.trim(),
          unit: formData.unit.trim(),
          opening_stock: openingStock,
          current_stock: openingStock,
          low_stock_threshold: lowStockThreshold,
          price_per_unit: pricePerUnit,
          gst_percentage: gstPercentage,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product added successfully",
      });

      // Reset form
      setFormData({
        name: '',
        unit: '',
        opening_stock: '',
        low_stock_threshold: '',
        price_per_unit: '',
        gst_percentage: ''
      });
      
      // Refresh data
      onSuccess();
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addSampleMasalas = async () => {
    const sampleMasalas = [
      { name: 'Turmeric Powder', unit: 'kg', price: 200, gst: 5 },
      { name: 'Red Chili Powder', unit: 'kg', price: 300, gst: 5 },
      { name: 'Coriander Powder', unit: 'kg', price: 250, gst: 5 },
      { name: 'Cumin Powder', unit: 'kg', price: 400, gst: 5 },
      { name: 'Garam Masala', unit: 'kg', price: 500, gst: 5 },
      { name: 'Black Pepper Powder', unit: 'kg', price: 800, gst: 5 },
      { name: 'Cardamom Powder', unit: 'kg', price: 1200, gst: 5 }
    ];

    try {
      setLoading(true);
      
      const products = sampleMasalas.map(masala => ({
        name: masala.name,
        unit: masala.unit,
        opening_stock: 50, // 50 kg opening stock for each
        current_stock: 50,
        low_stock_threshold: 10,
        price_per_unit: masala.price,
        gst_percentage: masala.gst,
        is_active: true
      }));

      const { error } = await supabase
        .from('products')
        .insert(products);

      if (error) throw error;

      toast({
        title: "Success",
        description: "7 sample masalas added successfully",
      });

      onSuccess();
    } catch (error) {
      console.error('Error adding sample masalas:', error);
      toast({
        title: "Error",
        description: "Failed to add sample masalas. They might already exist.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          Add New Product
        </CardTitle>
        <CardDescription>
          Add a new product to your inventory catalog
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Add Sample Masalas Button */}
        <div className="p-4 bg-turmeric/10 rounded-lg border border-turmeric/20">
          <h4 className="font-medium text-turmeric mb-2">Quick Start</h4>
          <p className="text-sm text-muted-foreground mb-3">
            Add 7 sample masalas to get started quickly with your inventory
          </p>
          <Button 
            onClick={addSampleMasalas} 
            disabled={loading}
            variant="outline"
            className="border-turmeric text-turmeric hover:bg-turmeric/10"
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Add 7 Sample Masalas
          </Button>
        </div>

        {/* Manual Add Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Turmeric Powder"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <Input
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                placeholder="e.g., kg, grams, packets"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="opening_stock">Opening Stock</Label>
              <Input
                id="opening_stock"
                name="opening_stock"
                type="number"
                min="0"
                step="0.01"
                value={formData.opening_stock}
                onChange={handleChange}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="low_stock_threshold">Low Stock Alert</Label>
              <Input
                id="low_stock_threshold"
                name="low_stock_threshold"
                type="number"
                min="0"
                step="0.01"
                value={formData.low_stock_threshold}
                onChange={handleChange}
                placeholder="10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price_per_unit">Price per Unit (₹) *</Label>
              <Input
                id="price_per_unit"
                name="price_per_unit"
                type="number"
                min="0.01"
                step="0.01"
                value={formData.price_per_unit}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gst_percentage">GST Percentage (%)</Label>
              <Input
                id="gst_percentage"
                name="gst_percentage"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.gst_percentage}
                onChange={handleChange}
                placeholder="5"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-primary hover:bg-primary/90"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Product
            </Button>
            
            <Button 
              type="button" 
              variant="outline"
              onClick={() => {
                setFormData({
                  name: '',
                  unit: '',
                  opening_stock: '',
                  low_stock_threshold: '',
                  price_per_unit: '',
                  gst_percentage: ''
                });
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

export default AddProductForm;