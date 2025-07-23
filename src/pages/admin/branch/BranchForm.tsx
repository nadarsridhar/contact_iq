import { useEffect, useState } from "react";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { branchSchema } from "@/schemas/branch";
import { deleteBranchApi, updateBranchApi } from "@/services/apiBranches";
import { useBranchModal } from "@/hooks/useBranchModal";
import { ACTIONS } from "@/utils/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { branchTypes } from "@/utils/categories";

function BranchForm() {
  const [loading, setLoading] = useState(false);
  const [selectedBranchType, setSelectedBranchType] = useState(
    branchTypes[0].value
  );

  const { onClose: closeModal, data } = useBranchModal();
  const { action, modalData } = data.data;
  const { agent } = useAuth();

  const form = useForm<z.infer<typeof branchSchema>>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      BranchId: 0,
      BranchName: "",
      BranchAddress: "",
      BranchCategory: selectedBranchType,
      ActiveFlag: 1,
      IsDeleted: 0,
      CreatedDate: 0,
      LastUpdateDate: 0,
    },
  });

  async function onSubmit(payload: z.infer<typeof branchSchema>) {
    try {
      setLoading(true);
      payload["OperationCode"] = action;
      payload["UpdatedBy"] = agent?.UserId;
      payload["ActiveFlag"] = 1;
      await updateBranchApi(payload);
      toast.success(
        `Branch ${
          action === ACTIONS.UPDATE ? "updated" : "created"
        } successfully`
      );
      closeModal();
    } catch (error) {
      console.error(error ?? error?.message);
      toast.error(typeof error === "string" ? error : error?.message);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async () => {
    try {
      const payload = { BranchId: modalData.BranchId };
      await deleteBranchApi(payload);
      toast.success(`Branch deleted successfully`);
      closeModal();
    } catch (error) {
      console.error(error ?? error?.message);
      toast.error(error ?? error?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (Object.keys(data)?.length > 0 && action === ACTIONS.UPDATE) {
      const {
        BranchId,
        BranchName,
        BranchAddress,
        BranchCategory,
        ActiveFlag,
        IsDeleted,
        CreatedDate,
        LastUpdateDate,
      } = data?.data?.modalData || {};
      form.reset({
        BranchId,
        BranchName,
        BranchAddress,
        BranchCategory: String(BranchCategory) ?? branchTypes[0]?.value,
        ActiveFlag,
        IsDeleted,
        CreatedDate,
        LastUpdateDate,
      });
      setSelectedBranchType(String(BranchCategory) ?? branchTypes[0]?.value);
    }
  }, [data]);

  useEffect(() => {
    if (form.formState.errors) {
      console.log(form.formState.errors);
      if (Object.keys(form.formState.errors).length > 0) {
        const error: any = Object.values(form.formState.errors)[0];
        // if (error?.message) toast.error(error?.message);
        // if (error?.ref?.name) form.setFocus(error?.ref?.name);
      }
    }
  }, [form.formState]); // ✅

  const isEditing = action === ACTIONS.UPDATE;

  return (
    <div className="flex flex-col justify-between">
      {action === ACTIONS.DELETE && (
        <div>
          <p>
            Are you sure you want to delete{" "}
            <span className="font-bold">
              {data?.data?.modalData?.BranchName}{" "}
            </span>
            branch?
          </p>

          <div className="flex justify-end mt-4 space-x-2">
            <Button onClick={handleDelete} variant="destructive">
              Delete
            </Button>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {(action === ACTIONS.CREATE || action === ACTIONS.UPDATE) && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="BranchName"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Branch Name</FormLabel>
                    <FormControl className="flex">
                      <>
                        <Input
                          {...field}
                          onChange={(e) =>
                            form.setValue(
                              field.name,
                              e.target.value.trim().toUpperCase()
                            )
                          }
                          placeholder="Branch Name"
                          value={field.value}
                          disabled={isEditing}
                        />
                      </>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="BranchAddress"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Branch Address</FormLabel>
                    <FormControl className="flex">
                      <>
                        <Input
                          {...field}
                          placeholder="Branch Address"
                          value={field.value}
                        />
                      </>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="BranchCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch Category</FormLabel>
                  <Select
                    onValueChange={(val) => {
                      field.onChange(val);
                      setSelectedBranchType(val);
                    }}
                    value={selectedBranchType}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {branchTypes.map(({ key, value }) => (
                        <SelectItem key={key} value={value}>
                          {key}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button disabled={loading} type="submit" className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Saving.." : "Save"}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
}

export default BranchForm;
