'use client';

import { useForm } from 'react-hook-form';
import InputField from '../InputField';

const ClassForm = ({ type, data }: { type: 'create' | 'update'; data?: any }) => {
  const { register, handleSubmit } = useForm({ defaultValues: data });
  const onSubmit = (formData: any) => {
    console.log('Class form submit:', formData);
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">{type === 'create' ? 'Create a new class' : 'Update class'}</h1>
      <div className="flex flex-wrap gap-4">
        <InputField label="Name" name="name" register={register} defaultValue={data?.name} />
        <InputField label="Capacity" name="capacity" register={register} defaultValue={data?.capacity} />
        <InputField label="Grade" name="grade" register={register} defaultValue={data?.grade} />
        <InputField label="Supervisor" name="supervisor" register={register} defaultValue={data?.supervisor} />
      </div>
      <button className="bg-blue-400 text-white p-2 rounded-md w-max">{type === 'create' ? 'Create' : 'Update'}</button>
    </form>
  );
};

export default ClassForm;
