import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthContext';
import Navigation from '@/components/Navigation';
import { Header } from '@/components/Header';
import { useToast } from '@/components/ui/use-toast';
import { 
  TestTube, 
  Cloud, 
  Loader2, 
  Sprout, 
  FlaskConical, 
  Droplets, 
  Leaf, 
  CircleDot, 
  Zap,
  Thermometer,
  Droplet,
  Gauge,
  Link,
  ArrowLeft
} from 'lucide-react';
import { getSoilConditions, type SoilCondition } from '@/lib/firebase';

interface WeatherData {
  temperature: number;
  rainfall: number;
  humidity: number;
}

// Mock weather data function - replace with actual API call
const getWeatherData = async (): Promise<WeatherData> => {
  return {
    temperature: 25,
    rainfall: 50,
    humidity: 65
  };
};

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center min-h-screen gap-4">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
    <p className="text-muted-foreground">Loading data...</p>
  </div>
);

const DEVICE_ID = 'Device_0001'; // Changed from 'Device[0001]'

const CropRecommendation = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [soilData, setSoilData] = useState<SoilCondition | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [recommendedCrop, setRecommendedCrop] = useState<string>('');

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Updated device ID format
        unsubscribe = getSoilConditions(DEVICE_ID, (soil) => {
          if (soil) {
            setSoilData(soil);
            // Fetch weather data when soil data updates
            getWeatherData().then(weather => {
              setWeatherData(weather);
              const crop = predictBestCrop(soil, weather);
              setRecommendedCrop(crop);
            });
          } else {
            toast({
              title: "Error",
              description: "No soil data found for this device",
              variant: "destructive"
            });
          }
          setLoading(false);
        });

      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive"
        });
        setLoading(false);
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [toast]);

  const predictBestCrop = (soil: SoilCondition, weather: WeatherData): string => {
    if (
      soil.soil_ph >= 6.0 && soil.soil_ph <= 7.0 &&
      soil.nitrogen_level >= 40 &&
      weather.temperature >= 20
    ) {
      return "Rice";
    } else if (
      soil.soil_ph >= 6.5 && soil.soil_ph <= 7.5 &&
      soil.phosphorus_level >= 30
    ) {
      return "Wheat";
    }
    return "Unable to determine optimal crop";
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background">
       <Header 
              pageName="Device Details" 
              userName={user?.email?.split('@')[0] || 'User'} 
            />
      <div className="max-w-7xl mx-auto p-6">
        {/* <div className="flex justify-between items-center">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Crop Recommendation</h1>
            <p className="text-muted-foreground">Analysis based on soil and weather conditions</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="hover:bg-primary/5 transition-colors"
          >
            Back to Dashboard
          </Button>
        </div> */}
        
        
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <TestTube className="h-6 w-6 mr-2 text-primary" />
              Soil Conditions
            </CardTitle>
            <CardDescription>Current soil parameters from IoT sensors</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-6 mr-2">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
              <FlaskConical className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Soil pH</p>
                <p className="text-xl font-semibold">{soilData?.soil_ph}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
              <Droplets className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Soil Moisture (%)</p>
                <p className="text-xl font-semibold">{soilData?.soil_moisture}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
              <Leaf className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nitrogen (mg/kg)</p>
                <p className="text-xl font-semibold">{soilData?.nitrogen_level}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
              <CircleDot className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phosphorus (mg/kg)</p>
                <p className="text-xl font-semibold">{soilData?.phosphorus_level}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
              <Zap className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Potassium (mg/kg)</p>
                <p className="text-xl font-semibold">{soilData?.potassium_level}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Cloud className="h-6 w-6 mr-2 text-primary" />
              Weather Conditions
            </CardTitle>
            <CardDescription>Current weather parameters</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-6">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
              <Thermometer className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Temperature</p>
                <p className="text-xl font-semibold">{weatherData?.temperature}°C</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
              <Droplet className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rainfall</p>
                <p className="text-xl font-semibold">{weatherData?.rainfall} mm</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
              <Gauge className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Humidity</p>
                <p className="text-xl font-semibold">{weatherData?.humidity}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Sprout className="h-6 w-6 mr-2 text-green-500" />
              Recommended Crop
            </CardTitle>
            <CardDescription>Based on current soil and weather conditions</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <p className="text-3xl font-bold text-primary">{recommendedCrop}</p>
              <p className="text-sm text-muted-foreground text-center">
                This recommendation is based on optimal growing conditions for various crops
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CropRecommendation;