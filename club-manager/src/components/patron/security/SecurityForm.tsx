
import React, { useState } from 'react';
import { SecurityReport } from '@/common/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  RadioGroup,
  RadioGroupItem
} from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';

type SecurityFormProps = {
  onSubmit: (report: Omit<SecurityReport, 'id' | 'patronId' | 'timestamp' | 'status'>) => void;
};

const PREDEFINED_LOCATIONS = [
  'Bathroom',
  'Bar',
  'Dance Floor',
  'VIP Area',
  'Entrance',
  'Smoking Area',
  'Lounge',
  'Other'
];

export const SecurityForm: React.FC<SecurityFormProps> = ({ onSubmit }) => {
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [selectedLocationOption, setSelectedLocationOption] = useState('');
  const [severity, setSeverity] = useState<SecurityReport['severity']>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalLocation = selectedLocationOption === 'Other' ? customLocation : selectedLocationOption;
    
    // Basic validation
    if (!description.trim() || !finalLocation.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Submit the report
    onSubmit({
      description,
      location: finalLocation,
      severity,
    });
    
    // Reset form
    setDescription('');
    setLocation('');
    setCustomLocation('');
    setSelectedLocationOption('');
    setSeverity('medium');
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="location" className="text-sm font-medium">
          Where is the issue?
        </label>
        <RadioGroup 
          value={selectedLocationOption} 
          onValueChange={setSelectedLocationOption}
          className="grid grid-cols-2 gap-2"
        >
          {PREDEFINED_LOCATIONS.map((loc) => (
            <div key={loc} className="flex items-center space-x-2">
              <RadioGroupItem value={loc} id={`location-${loc}`} />
              <Label htmlFor={`location-${loc}`}>{loc}</Label>
            </div>
          ))}
        </RadioGroup>
        
        {selectedLocationOption === 'Other' && (
          <Input
            placeholder="Specify the location"
            value={customLocation}
            onChange={(e) => setCustomLocation(e.target.value)}
            className="mt-2"
            required
          />
        )}
      </div>
      
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Describe the issue
        </label>
        <Textarea
          id="description"
          placeholder="Please provide details about what you observed..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          required
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="severity" className="text-sm font-medium">
          Urgency level
        </label>
        <Select value={severity} onValueChange={(val: any) => setSeverity(val)}>
          <SelectTrigger>
            <SelectValue placeholder="Select urgency level" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="low">
                Low - Not urgent, but should be addressed
              </SelectItem>
              <SelectItem value="medium">
                Medium - Needs attention soon
              </SelectItem>
              <SelectItem value="high">
                <div className="flex items-center text-red-500">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  <span>High - Urgent situation, immediate response needed</span>
                </div>
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      
      <Button
        type="submit"
        className="w-full bg-club-blue hover:bg-club-blue/80"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Report'}
      </Button>
      
      <p className="text-xs text-gray-400 text-center">
        All reports are confidential. Our security team will address your concern promptly.
      </p>
    </form>
  );
};
