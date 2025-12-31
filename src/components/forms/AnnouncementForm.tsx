'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import InputField from '../InputField';
import { announcementSchema, AnnouncementSchema, announcementFormSchema, AnnouncementFormSchema } from '@/lib/formValidationSchemas';
import { createAnnouncement, updateAnnouncement } from '@/lib/actions';
import { Dispatch, SetStateAction, useEffect, startTransition, useState, useTransition } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

type AnnouncementData = {
  id?: number;
  title?: string;
  description?: string;
  date?: string;
  classId?: number;
};

const AnnouncementForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: 'create' | 'update';
  data?: AnnouncementData;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: (data ? {
      title: data.title || '',
      description: data.description || '',
      date: data.date ? new Date(data.date).toISOString().split('T')[0] : '',
      classId: data?.classId ? String(data.classId) : undefined,
      id: data?.id ? String(data.id) : undefined,
    } : {
      title: '',
      description: '',
      date: '',
      classId: undefined,
      id: undefined,
    }) as AnnouncementFormSchema,
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

        const result = type === 'create' ? await createAnnouncement(data) : await updateAnnouncement(data);

        if (result.success) {
          toast(`Announcement has been ${type === 'create' ? 'created' : 'updated'}!`);
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
        {type === 'create' ? 'Create a new announcement' : 'Update the announcement'}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Title"
          name="title"
          defaultValue={data?.title}
          register={register}
          error={errors?.title}
        />
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Class (Optional)</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register('classId')}
            defaultValue={data?.classId?.toString() || ''}
          >
            <option value="">All classes</option>
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
        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">Description</label>
          <textarea
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full min-h-[100px]"
            {...register('description')}
            defaultValue={data?.description}
            placeholder="Enter announcement description..."
          />
          {errors.description?.message && (
            <p className="text-xs text-red-400">
              {errors.description.message.toString()}
            </p>
          )}
        </div>
        {data && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id?.toString()}
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

export default AnnouncementForm;
