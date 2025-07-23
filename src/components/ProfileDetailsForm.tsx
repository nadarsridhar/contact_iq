import { useState } from 'react';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { useProfileDetailsModal } from '@/hooks/useProfileDetailsModal';
import { profileFormSchema } from '@/schemas/user';
import {
  Select,
  SelectContent,
  SelectValue,
  SelectItem,
  SelectTrigger,
} from './ui/select';
import { useProfileContext } from '@/contexts/ProfileContext';

function ProfileDetailsForm() {
  const [loading, setLoading] = useState(false);
  const {
    audioInputs,
    audioOutputs,
    setSelectedAudioInput,
    setSelectedAudioOutput,
    selectedAudioInput,
    selectedAudioOutput,
  } = useProfileContext();
  const { onClose } = useProfileDetailsModal();

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      inputDevice: selectedAudioInput,
      outputDevice: selectedAudioOutput,
    },
  });

  async function onSubmit(values: z.infer<typeof profileFormSchema>) {
    setLoading(true);
    try {
      setSelectedAudioInput(values.inputDevice);
      setSelectedAudioOutput(values.outputDevice);
      onClose();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col justify-between">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="inputDevice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Input Device</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your preferred input device" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {audioInputs.map((audioInput) => {
                      if (audioInput.deviceId === '') return;
                      return (
                        <SelectItem
                          key={audioInput.deviceId}
                          value={audioInput.deviceId}
                        >
                          {audioInput.label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="outputDevice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Output Device</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your preferred output device" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {audioOutputs.map((audioOutput) => {
                      if (audioOutput.deviceId === '') return;
                      return (
                        <SelectItem
                          key={audioOutput.deviceId}
                          value={audioOutput.deviceId}
                        >
                          {audioOutput.label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button disabled={loading} type="submit" className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Updating..' : 'Update profile'}
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default ProfileDetailsForm;
