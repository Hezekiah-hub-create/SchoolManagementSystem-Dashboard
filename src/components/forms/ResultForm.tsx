'use client';

import { useForm } from 'react-hook-form';
import InputField from '../InputField';

const ResultForm = ({ type, data }: { type: 'create' | 'update'; data?: any }) => {
  const { register, handleSubmit } = useForm({ defaultValues: data });
  const onSubmit = (formData: any) => {
    console.log('Result form submit:', formData);
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">{type === 'create' ? 'Create a new result' : 'Update result'}</h1>
      <div className="flex flex-wrap gap-4">
        <InputField label="Subject" name="subject" register={register} defaultValue={data?.subject} />
        <InputField label="Class" name="class" register={register} defaultValue={data?.class} />
        <InputField label="Teacher" name="teacher" register={register} defaultValue={data?.teacher} />
        <InputField label="Student" name="student" register={register} defaultValue={data?.student} />
        <InputField label="Type (exam|assignment)" name="type" register={register} defaultValue={data?.type} />
        <InputField label="Date" name="date" register={register} defaultValue={data?.date} />
        <InputField label="Score" name="score" register={register} defaultValue={data?.score} />
      </div>
      <button className="bg-blue-400 text-white p-2 rounded-md w-max">{type === 'create' ? 'Create' : 'Update'}</button>
    </form>
  );
};

export default ResultForm;
