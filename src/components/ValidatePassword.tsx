import { useEffect, useState } from 'react';
import { EyeIcon, EyeOffIcon, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import Modal from '@/components/ui/Modal';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from './ui/input';
import { validateUserPasswordApi } from '@/services/apiUser';
import { Button } from './ui/button';
import { convertToMD5 } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useValidatePassword } from '@/hooks/useValidatePassword';
import { validatePasswordSchema } from '@/schemas/validatePassword';
import { useResetPassword } from '@/hooks/useResetPassword';

function ValidatePassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState('');

  const { isOpen, onClose: closeModal } = useValidatePassword();
  const { onOpen: openResetPasswordModal } = useResetPassword();
  const { agent } = useAuth();

  const form = useForm<z.infer<typeof validatePasswordSchema>>({
    resolver: zodResolver(validatePasswordSchema),
    defaultValues: {
      Password: '',
    },
  });

  function handleReset() {
    form.reset();
    closeModal();
  }

  async function onSubmit(payload: z.infer<typeof validatePasswordSchema>) {
    try {
      setIsLoading(true);
      payload['UserId'] = agent.UserId;
      payload['Password'] = convertToMD5(payload.Password);

      await validateUserPasswordApi(payload);
      toast.success(`Password validated successfully`);
      handleReset();
      openResetPasswordModal();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal
      size="sm"
      isOpen={isOpen}
      onClose={closeModal}
      title={'Authentication'}
      description={'Kindly enter your password'}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="mb-6 space-y-4">
            <FormField
              control={form.control}
              name="Password"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl className="flex">
                      <div className="relative w-full">
                        <Input
                          {...field}
                          className="w-full"
                          onChange={(e) =>
                            form.setValue(field.name, e.target.value)
                          }
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Current password.."
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword((prev) => !prev)}
                        >
                          {showPassword ? (
                            <EyeIcon className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <EyeOffIcon
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                          )}
                          <span className="sr-only">
                            {showPassword ? 'Hide password' : 'Show password'}
                          </span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>

          <Button disabled={isLoading} type="submit" className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Loading..' : 'Continue'}
          </Button>
        </form>
      </Form>
    </Modal>
  );
}

export default ValidatePassword;
