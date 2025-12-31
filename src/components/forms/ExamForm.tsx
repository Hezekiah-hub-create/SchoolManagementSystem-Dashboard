"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FieldError, useForm } from "react-hook-form";
import InputField from "../InputField";
import { examSchema, ExamSchema } from "@/lib/formValidationSchemas";
import { createExam, updateExam } from "@/lib/actions";
import { useActionState } from "react";
import { Dispatch, SetStateAction, useEffect, startTransition, useState, useTransition } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation"

const ExamForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(examSchema),
  });

  const [state, setState] = useState({ success: false, error: false, message: "" });
  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  const action = async (formData: FormData) => {
    startTransition(async () => {
      try {
        const data = Object.fromEntries(formData) as any;
        data.startTime = new Date(data.startTime);
        data.endTime = new Date(data.endTime);
        data.lessonId = parseInt(data.lessonId);
        if (data.id) data.id = parseInt(data.id);

        const result = type === "create" ? await createExam(data) : await updateExam(data);

        if (result.success) {
          toast(`Exam has been ${type === "create" ? "created" : "updated"}!`);
          setOpen(false);
          router.refresh();
        } else {
          setState({ success: false, error: true, message: "Something went wrong!" });
        }
      } catch (error) {
        setState({ success: false, error: true, message: "Something went wrong!" });
      }
    });
  };

  const { lessons } = relatedData;

  return (
    <form className="flex flex-col gap-8" action={action}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new exam" : "Update the exam"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Exam title"
          name="title"
          defaultValue={data?.title}
          register={register}
          error={errors?.title}
        />
        <InputField
          label="Start Date"
          name="startTime"
          defaultValue={data?.startTime}
          register={register}
          error={errors?.startTime && !Array.isArray(errors.startTime) && typeof errors.startTime === 'object' && 'message' in errors.startTime ? errors.startTime as FieldError : undefined}
          type="datetime-local"
        />
        <InputField
          label="End Date"
          name="endTime"
          defaultValue={data?.endTime}
          register={register}
          error={
            errors?.endTime &&
            !Array.isArray(errors.endTime) &&
            typeof errors.endTime === 'object' &&
            'message' in errors.endTime
              ? (errors.endTime as FieldError)
              : undefined
          }
          type="datetime-local"
        />
        {data && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            error={
              errors?.id &&
              !Array.isArray(errors.id) &&
              typeof errors.id === 'object' &&
              'message' in errors.id
                ? (errors.id as FieldError)
                : undefined
            }
            hidden
          />
        )}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Lesson</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("lessonId")}
            defaultValue={data?.teachers}
          >
            {lessons.map((lesson: { id: number; name: string }) => (
              <option value={lesson.id} key={lesson.id}>
                {lesson.name}
              </option>
            ))}
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
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default ExamForm;