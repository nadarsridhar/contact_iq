import { useState } from 'react';
import { EyeIcon, EyeOffIcon, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import Modal from '@/components/ui/Modal';
import { useChangePassword } from '@/hooks/useChangePassword';
import { zodResolver } from '@hookform/resolvers/zod';
import { userPasswordSchema } from '@/schemas/userPassword';
import { Input } from './ui/input';
import { changeUserPasswordApi } from '@/services/apiUser';
import { useForm } from 'react-hook-form';
import { Button } from './ui/button';
import { convertToMD5 } from '@/lib/utils';

function ChangePasswordModal({ userId }) {
  const [isLoading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState('');
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState('');

  const { isOpen, onClose: closeModal } = useChangePassword();

  const form = useForm<z.infer<typeof userPasswordSchema>>({
    resolver: zodResolver(userPasswordSchema),
    defaultValues: {
      CurrentPassword: '',
      NewPassword: '',
      ConfirmNewPassword: '',
    },
  });

  async function onSubmit(payload: z.infer<typeof userPasswordSchema>) {
    try {
      if (payload.NewPassword !== payload.ConfirmNewPassword) {
        throw new Error(`Passwords don't match`);
      }

      setLoading(true);
      payload['UserId'] = userId;
      payload['CurrentPassword'] = convertToMD5(payload.CurrentPassword);
      payload['NewPassword'] = convertToMD5(payload.NewPassword);
      delete payload['ConfirmNewPassword'];

      await changeUserPasswordApi(payload);
      toast.success(`Password changed successfully`);
      closeModal();
    } catch (error) {
      console.error(error);
      toast.error(typeof error === "string" ? error : error?.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      size="sm"
      isOpen={isOpen}
      onClose={closeModal}
      title={'Change Password'}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="mb-6 space-y-4">
            <FormField
              control={form.control}
              name="CurrentPassword"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl className="flex">
                      <div className="relative w-full">
                        <Input
                          {...field}
                          className="w-full"
                          onChange={(e) =>
                            form.setValue(field.name, e.target.value)
                          }
                          type={showCurrentPassword ? 'text' : 'password'}
                          placeholder="Current password.."
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() =>
                            setShowCurrentPassword((prev) => !prev)
                          }
                        >
                          {showCurrentPassword ? (
                            <EyeIcon className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <EyeOffIcon
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                          )}
                          <span className="sr-only">
                            {showCurrentPassword
                              ? 'Hide password'
                              : 'Show password'}
                          </span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="NewPassword"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl className="flex">
                      <div className="relative">
                        <Input
                          {...field}
                          onChange={(e) =>
                            form.setValue(field.name, e.target.value)
                          }
                          className="w-full"
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder="New password.."
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowNewPassword((prev) => !prev)}
                        >
                          {showNewPassword ? (
                            <EyeIcon className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <EyeOffIcon
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                          )}
                          <span className="sr-only">
                            {showNewPassword
                              ? 'Hide password'
                              : 'Show password'}
                          </span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="ConfirmNewPassword"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl className="flex">
                      <div className="relative">
                        <Input
                          {...field}
                          onChange={(e) =>
                            form.setValue(field.name, e.target.value)
                          }
                          className="w-full"
                          type={showConfirmNewPassword ? 'text' : 'password'}
                          placeholder="Confirm password.."
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() =>
                            setShowConfirmNewPassword((prev) => !prev)
                          }
                        >
                          {showConfirmNewPassword ? (
                            <EyeIcon className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <EyeOffIcon
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                          )}
                          <span className="sr-only">
                            {showConfirmNewPassword
                              ? 'Hide password'
                              : 'Show password'}
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
            {isLoading ? 'Saving..' : 'Save'}
          </Button>
        </form>
      </Form>
    </Modal>
  );
}

export default ChangePasswordModal;
