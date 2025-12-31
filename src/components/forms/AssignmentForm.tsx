'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import InputField from '../InputField';
import { assignmentFormSchema, AssignmentFormSchema } from '@/lib/formValidationSchemas';
import { createAssignment, updateAssignment } from '@/lib/actions';
import { Dispatch, SetStateAction, useEffect, startTransition, useState, useTransition } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

const AssignmentForm = ({
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
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: data ? {
      title: data.title || '',
      startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '',
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : '',
      lessonId: data.lessonId || 0,
      id: data.id ?? undefined,
    } : {
      title: '',
      startDate: '',
      dueDate: '',
      lessonId: 0,
    },
  });

  const [state, setState] = useState({ success: false, error: false, message: '' });
  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  const action = async (formData: FormData) => {
    startTransition(async () => {
      try {
        const data = Object.fromEntries(formData) as any;
        data.lessonId = parseInt(data.lessonId);
        if (data.id) data.id = parseInt(data.id);
        // Convert string dates to Date objects
        data.startDate = new Date(data.startDate);
        data.dueDate = new Date(data.dueDate);

        const result = type === 'create' ? await createAssignment(data) : await updateAssignment(data);

        if (result.success) {
          toast(`Assignment has been ${type === 'create' ? 'created' : 'updated'}!`);
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

  const { lessons } = relatedData;

  return (
    <form className="flex flex-col gap-8" action={action}>
      <h1 className="text-xl font-semibold">
        {type === 'create' ? 'Create a new assignment' : 'Update the assignment'}
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
          label="Start Date"
          name="startDate"
          defaultValue={data?.startDate ? new Date(data.startDate).toISOString().split('T')[0] : ''}
          register={register}
          error={errors?.startDate}
          type="date"
        />
        <InputField
          label="Due Date"
          name="dueDate"
          defaultValue={data?.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : ''}
          register={register}
          error={errors?.dueDate}
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
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Lesson</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register('lessonId')}
            defaultValue={data?.lessonId}
          >
            {lessons.map(
              (lesson: { id: number; name: string }) => (
                <option value={lesson.id} key={lesson.id}>
                  {lesson.name}
                </option>
              )
            )}
          </select>
          {errors.lessonId?.message && (
            <p className="text-xs text-red-400">
              {errors.lessonId.message.toString()}
            </p>
          )}
        </div>
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

export default AssignmentForm;
