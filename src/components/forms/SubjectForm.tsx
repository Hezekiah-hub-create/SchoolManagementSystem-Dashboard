'use client';

import { useForm } from 'react-hook-form';
import InputField from '../InputField';

const SubjectForm = ({ type, data }: { type: 'create' | 'update'; data?: any }) => {
  const { register, handleSubmit } = useForm({ defaultValues: data });
  const onSubmit = (formData: any) => {
    // Convert teachers string to array if needed
    if (formData.teachers && typeof formData.teachers === 'string') {
      formData.teachers = formData.teachers.split(',').map((s: string) => s.trim());
    }
    console.log('Subject form submit:', formData);
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">{type === 'create' ? 'Create a new subject' : 'Update subject'}</h1>
      <div className="flex flex-wrap gap-4">
        <InputField label="Name" name="name" register={register} defaultValue={data?.name} />
        <InputField label="Teachers (comma separated)" name="teachers" register={register} defaultValue={data?.teachers?.join(',')} />
      </div>
      <button className="bg-blue-400 text-white p-2 rounded-md w-max">{type === 'create' ? 'Create' : 'Update'}</button>
    </form>
  );
};

export default SubjectForm;
