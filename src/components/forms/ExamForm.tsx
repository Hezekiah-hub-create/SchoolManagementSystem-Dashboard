'use client';

import { useForm } from 'react-hook-form';
import InputField from '../InputField';

const ExamForm = ({ type, data }: { type: 'create' | 'update'; data?: any }) => {
  const { register, handleSubmit } = useForm({ defaultValues: data });
  const onSubmit = (formData: any) => {
    console.log('Exam form submit:', formData);
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">{type === 'create' ? 'Create a new exam' : 'Update exam'}</h1>
      <div className="flex flex-wrap gap-4">
        <InputField label="Subject" name="subject" register={register} defaultValue={data?.subject} />
        <InputField label="Class" name="class" register={register} defaultValue={data?.class} />
        <InputField label="Teacher" name="teacher" register={register} defaultValue={data?.teacher} />
        <InputField label="Date" name="date" register={register} defaultValue={data?.date} />
      </div>
      <button className="bg-blue-400 text-white p-2 rounded-md w-max">{type === 'create' ? 'Create' : 'Update'}</button>
    </form>
  );
};

export default ExamForm;
