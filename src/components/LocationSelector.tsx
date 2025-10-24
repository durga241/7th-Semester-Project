import { useState } from "react";
import { MapPin, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data for Indian states and districts
const locationData = {
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"],
  "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda"],
  "Haryana": ["Gurugram", "Faridabad", "Panipat", "Ambala", "Karnal"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut"]
};

interface LocationSelectorProps {
  onLocationSelect: (state: string, district: string) => void;
  selectedState?: string;
  selectedDistrict?: string;
}

const LocationSelector = ({ onLocationSelect, selectedState, selectedDistrict }: LocationSelectorProps) => {
  const [state, setState] = useState(selectedState || "");
  const [district, setDistrict] = useState(selectedDistrict || "");

  const handleStateChange = (newState: string) => {
    setState(newState);
    setDistrict(""); // Reset district when state changes
    onLocationSelect(newState, "");
  };

  const handleDistrictChange = (newDistrict: string) => {
    setDistrict(newDistrict);
    onLocationSelect(state, newDistrict);
  };

  const availableDistricts = state ? locationData[state as keyof typeof locationData] || [] : [];

  return (
    <div className="flex items-center space-x-2">
      <MapPin className="w-4 h-4 text-muted-foreground" />
      <Select value={state} onValueChange={handleStateChange}>
        <SelectTrigger className="w-32 h-10 text-sm">
          <SelectValue placeholder="State" />
        </SelectTrigger>
        <SelectContent>
          {Object.keys(locationData).map((stateName) => (
            <SelectItem key={stateName} value={stateName}>
              {stateName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select 
        value={district} 
        onValueChange={handleDistrictChange}
        disabled={!state}
      >
        <SelectTrigger className="w-32 h-10 text-sm">
          <SelectValue placeholder="District" />
        </SelectTrigger>
        <SelectContent>
          {availableDistricts.map((districtName) => (
            <SelectItem key={districtName} value={districtName}>
              {districtName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LocationSelector;