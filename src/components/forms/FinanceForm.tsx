"use client";

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import InputField from '../InputField';
import { financeFormSchema, FinanceFormSchema } from '@/lib/formValidationSchemas';
import { createFinance, updateFinance } from '@/lib/actions';
import { Dispatch, SetStateAction, useEffect, startTransition, useState, useTransition } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

const FinanceForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: 'create' | 'update';
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(financeFormSchema),
    defaultValues: data ? {
      type: data.type || 'income',
      amount: data.amount?.toString() || '',
      description: data.description || '',
      date: data.date ? new Date(data.date).toISOString().split('T')[0] : '',
      id: data?.id?.toString() || undefined,
    } : {
      type: 'income',
      amount: '',
      description: '',
      date: '',
    },
  });

  const [state, setState] = useState({ success: false, error: false, message: '' });
  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  const action = async (formData: FormData) => {
    startTransition(async () => {
      try {
        const data = Object.fromEntries(formData) as any;
        if (data.amount) data.amount = parseFloat(data.amount);
        if (data.id) data.id = parseInt(data.id);

        const result = type === 'create' ? await createFinance(data) : await updateFinance(data);

        if (result.success) {
          toast(`Finance record has been ${type === 'create' ? 'created' : 'updated'}!`);
          setOpen(false);
          router.refresh();
        } else {
          setState({ success: false, error: true, message: result.message || 'Something went wrong!' });
        }
      } catch (error) {
        setState({ success: false, error: true, message: 'Something went wrong!' });
      }
    });
  };

  return (
    <form className="flex flex-col gap-8" action={action}>
      <h1 className="text-xl font-semibold">
        {type === 'create' ? 'Create a new finance record' : 'Update the finance record'}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Type</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register('type')}
            defaultValue={data?.type || 'income'}
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          {errors.type?.message && (
            <p className="text-xs text-red-400">
              {errors.type.message.toString()}
            </p>
          )}
        </div>
        <InputField
          label="Amount"
          name="amount"
          defaultValue={data?.amount}
          register={register}
          error={errors?.amount}
          type="number"
          step="0.01"
        />
        <InputField
          label="Description"
          name="description"
          defaultValue={data?.description}
          register={register}
          error={errors?.description}
        />
        <InputField
          label="Date"
          name="date"
          defaultValue={data?.date ? new Date(data.date).toISOString().split('T')[0] : ''}
          register={register}
          error={errors?.date}
          type="date"
        />
        {data && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            error={errors?.id}
            hidden
          />
        )}
      </div>
      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}
      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === 'create' ? 'Create' : 'Update'}
      </button>
    </form>
  );
};

export default FinanceForm;
