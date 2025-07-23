import * as React from 'react';
import { Clock } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TimePickerProps {
  className?: string;
  onTimeChange?: (time: string) => void;
}

export function TimePicker({ className, onTimeChange }: TimePickerProps) {
  const [hour, setHour] = React.useState<string>('12');
  const [minute, setMinute] = React.useState<string>('00');
  const [meridiem, setMeridiem] = React.useState<'AM' | 'PM'>('AM');

  React.useEffect(() => {
    if (onTimeChange) {
      onTimeChange(`${hour}:${minute} ${meridiem}`);
    }
  }, [hour, minute, meridiem, onTimeChange]);

  return (
    <div className={cn('flex items-end gap-2', className)}>
      <Select onValueChange={setHour}>
        <SelectTrigger className="w-[70px]">
          <SelectValue placeholder="Hour" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 12 }, (_, i) => (
            <SelectItem key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
              {(i + 1).toString().padStart(2, '0')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select onValueChange={setMinute}>
        <SelectTrigger className="w-[70px]">
          <SelectValue placeholder="Min" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 60 }, (_, i) => (
            <SelectItem key={i} value={i.toString().padStart(2, '0')}>
              {i.toString().padStart(2, '0')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select onValueChange={(value) => setMeridiem(value as 'AM' | 'PM')}>
        <SelectTrigger className="w-[70px]">
          <SelectValue placeholder="AM/PM" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="AM">AM</SelectItem>
          <SelectItem value="PM">PM</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" size="icon" className="h-10 w-10">
        <Clock className="h-4 w-4" />
      </Button>
    </div>
  );
}
