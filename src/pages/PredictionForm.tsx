import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Navigation from '@/components/Navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Header } from '@/components/Header';
import { Sprout, CloudRain, Thermometer, Droplets, TestTube, Zap } from 'lucide-react';

const PredictionForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    crop_type: '',
    field_area: '',
    soil_ph: '',
    soil_moisture: '',
    nitrogen_level: '',
    phosphorus_level: '',
    potassium_level: '',
    temperature: '',
    rainfall: '',
    humidity: '',
    irrigation_method: '',
    fertilizer_used: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateMockPrediction = (cropType: string, fieldArea: number) => {
    // Simple mock prediction logic based on crop type and conditions
    const baseYields: Record<string, number> = {
      'Wheat': 3000,
      'Rice': 4500,
      'Corn': 5500,
      'Soybeans': 2800,
      'Cotton': 800,
      'Tomatoes': 25000
    };

    const baseYield = baseYields[cropType] || 3000;
    const variation = (Math.random() - 0.5) * 0.4; // ±20% variation
    const predictedYield = Math.round(baseYield * (1 + variation));
    const confidence = Math.random() * 0.3 + 0.7; // 70-100% confidence

    return {
      predicted_yield: predictedYield,
      confidence_score: confidence,
      recommendations: {
        irrigation: confidence > 0.8 ? "Optimal irrigation schedule" : "Consider adjusting irrigation frequency",
        fertilizer: "Apply balanced NPK fertilizer based on soil test results",
        pest_control: "Monitor for common pests during growth stages",
        general: "Maintain consistent field monitoring for best results"
      }
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Generate mock prediction
      const prediction = generateMockPrediction(formData.crop_type, parseFloat(formData.field_area));

      // Save to database
      const { data, error } = await supabase
        .from('crop_predictions')
        .insert({
          user_id: user.id,
          crop_type: formData.crop_type,
          field_area: parseFloat(formData.field_area),
          soil_ph: formData.soil_ph ? parseFloat(formData.soil_ph) : null,
          soil_moisture: formData.soil_moisture ? parseFloat(formData.soil_moisture) : null,
          nitrogen_level: formData.nitrogen_level ? parseFloat(formData.nitrogen_level) : null,
          phosphorus_level: formData.phosphorus_level ? parseFloat(formData.phosphorus_level) : null,
          potassium_level: formData.potassium_level ? parseFloat(formData.potassium_level) : null,
          temperature: formData.temperature ? parseFloat(formData.temperature) : null,
          rainfall: formData.rainfall ? parseFloat(formData.rainfall) : null,
          humidity: formData.humidity ? parseFloat(formData.humidity) : null,
          irrigation_method: formData.irrigation_method || null,
          fertilizer_used: formData.fertilizer_used || null,
          predicted_yield: prediction.predicted_yield,
          confidence_score: prediction.confidence_score,
          recommendations: prediction.recommendations
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Prediction Generated Successfully!",
        description: `Predicted yield: ${prediction.predicted_yield} kg/ha`,
      });

      navigate(`/prediction-result/${data.id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate prediction",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
       <Header 
              pageName="New Prediction" 
              userName={user?.email?.split('@')[0] || 'User'} 
            />
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            New Crop Yield Prediction
          </h1>
          <p className="text-muted-foreground">
            Enter your crop and field information to get AI-powered yield predictions and recommendations.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Crop Information */}
          <Card className="agricultural-card animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sprout className="h-5 w-5 mr-2 text-primary" />
                Crop Information
              </CardTitle>
              <CardDescription>
                Basic information about your crop and field
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="crop_type">Crop Type *</Label>
                <Select value={formData.crop_type} onValueChange={(value) => handleInputChange('crop_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select crop type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Wheat">Wheat</SelectItem>
                    <SelectItem value="Rice">Rice</SelectItem>
                    <SelectItem value="Corn">Corn</SelectItem>
                    <SelectItem value="Soybeans">Soybeans</SelectItem>
                    <SelectItem value="Cotton">Cotton</SelectItem>
                    <SelectItem value="Tomatoes">Tomatoes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="field_area">Field Area (hectares) *</Label>
                <Input
                  id="field_area"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 5.5"
                  value={formData.field_area}
                  onChange={(e) => handleInputChange('field_area', e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Soil Conditions */}
          <Card className="agricultural-card animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TestTube className="h-5 w-5 mr-2 text-primary" />
                Soil Conditions
              </CardTitle>
              <CardDescription>
                Soil quality and nutrient information
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="soil_ph">Soil pH</Label>
                <Input
                  id="soil_ph"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 6.5"
                  value={formData.soil_ph}
                  onChange={(e) => handleInputChange('soil_ph', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="soil_moisture">Soil Moisture (%)</Label>
                <Input
                  id="soil_moisture"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 25.0"
                  value={formData.soil_moisture}
                  onChange={(e) => handleInputChange('soil_moisture', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nitrogen_level">Nitrogen Level (mg/kg)</Label>
                <Input
                  id="nitrogen_level"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 45.0"
                  value={formData.nitrogen_level}
                  onChange={(e) => handleInputChange('nitrogen_level', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phosphorus_level">Phosphorus Level (mg/kg)</Label>
                <Input
                  id="phosphorus_level"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 15.0"
                  value={formData.phosphorus_level}
                  onChange={(e) => handleInputChange('phosphorus_level', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="potassium_level">Potassium Level (mg/kg)</Label>
                <Input
                  id="potassium_level"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 120.0"
                  value={formData.potassium_level}
                  onChange={(e) => handleInputChange('potassium_level', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Weather Conditions */}
          <Card className="agricultural-card animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CloudRain className="h-5 w-5 mr-2 text-primary" />
                Weather Conditions
              </CardTitle>
              <CardDescription>
                Current and expected weather parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="temperature" className="flex items-center">
                  <Thermometer className="h-4 w-4 mr-1" />
                  Temperature (°C)
                </Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 25.0"
                  value={formData.temperature}
                  onChange={(e) => handleInputChange('temperature', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rainfall" className="flex items-center">
                  <CloudRain className="h-4 w-4 mr-1" />
                  Rainfall (mm)
                </Label>
                <Input
                  id="rainfall"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 50.0"
                  value={formData.rainfall}
                  onChange={(e) => handleInputChange('rainfall', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="humidity" className="flex items-center">
                  <Droplets className="h-4 w-4 mr-1" />
                  Humidity (%)
                </Label>
                <Input
                  id="humidity"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 65.0"
                  value={formData.humidity}
                  onChange={(e) => handleInputChange('humidity', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Farming Practices */}
          <Card className="agricultural-card animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2 text-primary" />
                Farming Practices
              </CardTitle>
              <CardDescription>
                Information about your farming methods
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="irrigation_method">Irrigation Method</Label>
                <Select value={formData.irrigation_method} onValueChange={(value) => handleInputChange('irrigation_method', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select irrigation method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Drip">Drip Irrigation</SelectItem>
                    <SelectItem value="Sprinkler">Sprinkler</SelectItem>
                    <SelectItem value="Flood">Flood Irrigation</SelectItem>
                    <SelectItem value="Rain-fed">Rain-fed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fertilizer_used">Fertilizer Used</Label>
                <Input
                  id="fertilizer_used"
                  placeholder="e.g., NPK 20:20:20"
                  value={formData.fertilizer_used}
                  onChange={(e) => handleInputChange('fertilizer_used', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4 pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="success"
              size="lg"
              disabled={loading || !formData.crop_type || !formData.field_area}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Generating Prediction...
                </div>
              ) : (
                'Generate Prediction'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PredictionForm;