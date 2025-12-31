'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import InputField from '../InputField';
import { eventFormSchema, EventFormSchema } from '@/lib/formValidationSchemas';
import { createEvent, updateEvent } from '@/lib/actions';
import { Dispatch, SetStateAction, useEffect, startTransition, useState, useTransition } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

const EventForm = ({
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
  } = useForm<EventFormSchema>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: data ? {
      title: data.title || '',
      description: data.description || '',
      classId: data?.classId?.toString() || '',
      date: data.date ? new Date(data.date).toISOString().split('T')[0] : '',
      startTime: data.startTime || '',
      endTime: data.endTime || '',
      id: data?.id?.toString() || undefined,
    } : {
      title: '',
      description: '',
      classId: '',
      date: '',
      startTime: '',
      endTime: '',
    },
  });

  const [state, setState] = useState({ success: false, error: false, message: '' });
  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  const action = async (formData: FormData) => {
    startTransition(async () => {
      try {
        const data = Object.fromEntries(formData) as any;
        if (data.classId) data.classId = parseInt(data.classId);
        if (data.id) data.id = parseInt(data.id);

        const result = type === 'create' ? await createEvent(data) : await updateEvent(data);

        if (result.success) {
          toast(`Event has been ${type === 'create' ? 'created' : 'updated'}!`);
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

  const { classes } = relatedData || {};

  return (
    <form className="flex flex-col gap-8" action={action}>
      <h1 className="text-xl font-semibold">
        {type === 'create' ? 'Create a new event' : 'Update the event'}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Title"
          name="title"
          defaultValue={data?.title}
          register={register}
          error={errors?.title}
        />
        <InputField
          label="Description"
          name="description"
          defaultValue={data?.description}
          register={register}
          error={errors?.description}
        />
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Class</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register('classId')}
            defaultValue={data?.classId}
          >
            <option value="">Select a class</option>
            {classes?.map(
              (classItem: { id: number; name: string }) => (
                <option value={classItem.id} key={classItem.id}>
                  {classItem.name}
                </option>
              )
            )}
          </select>
          {errors.classId?.message && (
            <p className="text-xs text-red-400">
              {errors.classId.message.toString()}
            </p>
          )}
        </div>
        <InputField
          label="Date"
          name="date"
          defaultValue={data?.date ? new Date(data.date).toISOString().split('T')[0] : ''}
          register={register}
          error={errors?.date}
          type="date"
        />
        <InputField
          label="Start Time"
          name="startTime"
          defaultValue={data?.startTime}
          register={register}
          error={errors?.startTime}
          type="time"
        />
        <InputField
          label="End Time"
          name="endTime"
          defaultValue={data?.endTime}
          register={register}
          error={errors?.endTime}
          type="time"
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

export default EventForm;
