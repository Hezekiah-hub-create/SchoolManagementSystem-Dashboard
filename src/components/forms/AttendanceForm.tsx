'use client';

import { useForm } from 'react-hook-form';
import InputField from '../InputField';

const AttendanceForm = ({ type, data }: { type: 'create' | 'update'; data?: any }) => {
  const { register, handleSubmit } = useForm({ defaultValues: data });
  const onSubmit = (formData: any) => {
    console.log('Attendance form submit:', formData);
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">{type === 'create' ? 'Create a new attendance' : 'Update attendance'}</h1>
      <div className="flex flex-wrap gap-4">
        <InputField label="Student" name="student" register={register} defaultValue={data?.student} />
        <InputField label="Date" name="date" register={register} defaultValue={data?.date} />
        <InputField label="Status (present|absent)" name="status" register={register} defaultValue={data?.status} />
      </div>
      <button className="bg-blue-400 text-white p-2 rounded-md w-max">{type === 'create' ? 'Create' : 'Update'}</button>
    </form>
  );
};

export default AttendanceForm;
