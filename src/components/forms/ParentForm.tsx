'use client';

import { useForm } from 'react-hook-form';
import InputField from '../InputField';

const ParentForm = ({ type, data }: { type: 'create' | 'update'; data?: any }) => {
  const { register, handleSubmit } = useForm({ defaultValues: data });
  const onSubmit = (formData: any) => {
    // Convert students string to array if needed
    if (formData.students && typeof formData.students === 'string') {
      formData.students = formData.students.split(',').map((s: string) => s.trim());
    }
    console.log('Parent form submit:', formData);
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">{type === 'create' ? 'Create a new parent' : 'Update parent'}</h1>
      <div className="flex flex-wrap gap-4">
        <InputField label="Name" name="name" register={register} defaultValue={data?.name} />
        <InputField label="Email" name="email" register={register} defaultValue={data?.email} />
        <InputField label="Students (comma separated)" name="students" register={register} defaultValue={data?.students?.join(',')} />
        <InputField label="Phone" name="phone" register={register} defaultValue={data?.phone} />
        <InputField label="Address" name="address" register={register} defaultValue={data?.address} />
      </div>
      <button className="bg-blue-400 text-white p-2 rounded-md w-max">{type === 'create' ? 'Create' : 'Update'}</button>
    </form>
  );
};

export default ParentForm;
