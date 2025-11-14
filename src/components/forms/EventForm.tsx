'use client';

import { useForm } from 'react-hook-form';
import InputField from '../InputField';

const EventForm = ({ type, data }: { type: 'create' | 'update'; data?: any }) => {
  const { register, handleSubmit } = useForm({ defaultValues: data });
  const onSubmit = (formData: any) => {
    console.log('Event form submit:', formData);
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">{type === 'create' ? 'Create a new event' : 'Update event'}</h1>
      <div className="flex flex-wrap gap-4">
        <InputField label="Title" name="title" register={register} defaultValue={data?.title} />
        <InputField label="Class" name="class" register={register} defaultValue={data?.class} />
        <InputField label="Date" name="date" register={register} defaultValue={data?.date} />
        <InputField label="Start Time" name="startTime" register={register} defaultValue={data?.startTime} />
        <InputField label="End Time" name="endTime" register={register} defaultValue={data?.endTime} />
      </div>
      <button className="bg-blue-400 text-white p-2 rounded-md w-max">{type === 'create' ? 'Create' : 'Update'}</button>
    </form>
  );
};

export default EventForm;
