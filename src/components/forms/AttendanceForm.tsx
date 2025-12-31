'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState, useEffect, startTransition, useTransition } from 'react';
import InputField from '../InputField';
import { Dispatch, SetStateAction } from 'react';
import { attendanceSchema, AttendanceSchema } from '@/lib/formValidationSchemas';
import { createAttendance, updateAttendance } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

const AttendanceForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: 'create' | 'update';
  data?: any;
  setOpen?: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(attendanceSchema),
  });

  const [selectedStudentName, setSelectedStudentName] = useState('');
  const [state, setState] = useState({ success: false, error: false, message: '' });
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (data?.studentId && relatedData?.students) {
      const student = relatedData.students.find((s: { id: string }) => s.id === data.studentId);
      if (student) {
        setSelectedStudentName(`${student.name} ${student.surname}`);
      }
    }
  }, [data, relatedData]);

  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const studentId = e.target.value;
    const student = relatedData?.students?.find((s: { id: string }) => s.id === studentId);
    if (student) {
      setSelectedStudentName(`${student.name} ${student.surname}`);
    } else {
      setSelectedStudentName('');
    }
  };

  const action = async (formData: FormData) => {
    startTransition(async () => {
      try {
        const data = Object.fromEntries(formData) as any;
        data.date = new Date(data.date);
        data.present = data.present === 'true';
        data.lessonId = parseInt(data.lessonId);
        if (data.id) data.id = parseInt(data.id);

        let result;
        if (type === 'create') {
          result = await createAttendance(data);
        } else {
          result = await updateAttendance(data);
        }

        if (result.success) {
          toast(`Attendance has been ${type === 'create' ? 'created' : 'updated'}!`);
          setOpen?.(false);
          router.refresh();
        } else {
          setState({ success: false, error: true, message: result.message || 'Something went wrong!' });
        }
      } catch (error) {
        setState({ success: false, error: true, message: 'Something went wrong!' });
      }
    });
  };

  return (
    <form className="flex flex-col gap-8" action={action}>
      <h1 className="text-xl font-semibold">{type === 'create' ? 'Create a new attendance' : 'Update attendance'}</h1>
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Student</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register('studentId')}
            defaultValue={data?.studentId}
            onChange={handleStudentChange}
          >
            {relatedData?.students?.map(
              (student: { id: string; name: string; surname: string }) => (
                <option value={student.id} key={student.id}>
                  {student.name} {student.surname}
                </option>
              )
            )}
          </select>
          {errors.studentId?.message && (
            <p className="text-xs text-red-400">{errors.studentId.message.toString()}</p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Student Name</label>
          <input
            type="text"
            value={selectedStudentName}
            readOnly
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full bg-gray-100"
            placeholder="Select a student to see name"
          />
        </div>
        <InputField
          label="Date"
          name="date"
          defaultValue={data?.date ? new Date(data.date).toISOString().split('T')[0] : ''}
          register={register}
          error={errors.date}
          type="date"
        />
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Status</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register('present')}
            defaultValue={data?.present}
          >
            <option value="true">Present</option>
            <option value="false">Absent</option>
          </select>
          {errors.present?.message && (
            <p className="text-xs text-red-400">{errors.present.message.toString()}</p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Lesson</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register('lessonId')}
            defaultValue={data?.lessonId}
          >
            {relatedData?.lessons?.map(
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
        <span className="text-red-500">{state.message || 'Something went wrong!'}</span>
      )}
      <button type="submit" className="bg-blue-400 text-white p-2 rounded-md">
        {type === 'create' ? 'Create' : 'Update'}
      </button>
    </form>
  );
};

export default AttendanceForm;
