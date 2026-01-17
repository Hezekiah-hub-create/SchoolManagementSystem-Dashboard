"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect, useState, startTransition, useTransition } from "react";
import { profileFormSchema, ProfileFormSchema } from "@/lib/formValidationSchemas";
import { z } from "zod";
import { updateProfile } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CldUploadWidget } from "next-cloudinary";

const ProfileForm = ({
  user,
  role,
}: {
  user: any;
  role: string;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormSchema>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      ...user,
      birthday: user?.birthday
        ? (typeof user.birthday === "string" || typeof user.birthday === "number"
            ? new Date(user.birthday)
            : user.birthday)
        : undefined,
    } as Partial<ProfileFormSchema>,
  });

  const [img, setImg] = useState<any>(user?.img ? { secure_url: user.img } : undefined);
  const [state, setState] = useState({ success: false, error: false, message: "" });
  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  const action = async (data: ProfileFormSchema) => {
    startTransition(async () => {
      try {
        const updateData = {
          ...data,
          img: img?.secure_url,
          id: user.id,
          birthday: data.birthday ? new Date(data.birthday) : undefined,
        } as any;

        const result = await updateProfile(updateData as any);

        if (result.success) {
          toast(`Profile has been updated!`);
          router.refresh();
        } else {
          setState({ success: false, error: true, message: result.message || "Something went wrong!" });
        }
      } catch (error) {
        setState({ success: false, error: true, message: "Something went wrong!" });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(action)} className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold">Update Profile</h1>
      <span className="text-xs text-gray-600 font-medium">Personal Information</span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Name"
          name="name"
          defaultValue={user?.name}
          register={register}
          error={errors?.name}
        />
        <InputField
          label="Surname"
          name="surname"
          defaultValue={user?.surname}
          register={register}
          error={errors?.surname}
        />
        <InputField
          label="Email"
          name="email"
          defaultValue={user?.email}
          register={register}
          error={errors?.email}
        />
        <InputField
          label="Phone"
          name="phone"
          defaultValue={user?.phone}
          register={register}
          error={errors?.phone}
        />
        <InputField
          label="Address"
          name="address"
          defaultValue={user?.address}
          register={register}
          error={errors?.address}
        />
        <InputField
          label="Birthday"
          name="birthday"
          defaultValue={user?.birthday?.toISOString().split("T")[0]}
          register={register}
          error={errors?.birthday}
          type="date"
        />
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Blood Type</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("bloodType")}
            defaultValue={user?.bloodType || ""}
          >
            <option value="">Select Blood Type</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
          {errors.bloodType?.message && (
            <p className="text-xs text-red-400">
              {errors.bloodType.message.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Sex</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("sex")}
            defaultValue={user?.sex || ""}
          >
            <option value="">Select Sex</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
          {errors.sex?.message && (
            <p className="text-xs text-red-400">
              {errors.sex.message.toString()}
            </p>
          )}
        </div>
        <CldUploadWidget
          uploadPreset="SchMngSys_uploads"
          onSuccess={(result, { widget }) => {
            setImg(result.info);
            widget.close();
          }}
        >
          {({ open }) => {
            return (
              <div
                className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer"
                onClick={() => open()}
              >
                <span>Upload a photo</span>
              </div>
            );
          }}
        </CldUploadWidget>
      </div>
      {state.error && (
        <span className="text-red-500">{state.message}</span>
      )}
      <button className="bg-blue-400 text-white p-2 rounded-md">
        Update
      </button>
    </form>
  );
};

export default ProfileForm;
