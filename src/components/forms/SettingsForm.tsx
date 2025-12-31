"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect, useState, startTransition, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const SettingsForm = ({
  type,
  data,
  setOpen,
  category,
}: {
  type: "create" | "update";
  data?: any;
  setOpen?: Dispatch<SetStateAction<boolean>>;
  category: string;
}) => {
  const [settingsData, setSettingsData] = useState<any>(data || {});
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const getFieldsForCategory = (category: string) => {
    const fieldConfigs: { [key: string]: { [fieldKey: string]: { label: string; type: string; placeholder?: string } } } = {
      generalSchool: {
        schoolName: { label: "School Name", type: "text", placeholder: "Enter school name" },
        motto: { label: "School Motto", type: "text", placeholder: "Enter school motto" },
        address: { label: "Address", type: "text", placeholder: "Enter school address" },
        contact: { label: "Contact Number", type: "tel", placeholder: "Enter contact number" },
        academicYear: { label: "Academic Year", type: "text", placeholder: "e.g., 2024-2025" },
        workingDays: { label: "Working Days", type: "text", placeholder: "e.g., Monday-Friday" },
        timeZone: { label: "Time Zone", type: "text", placeholder: "e.g., UTC+5:30" },
        language: { label: "Default Language", type: "text", placeholder: "e.g., English" },
      },
      userRoleManagement: {
        defaultRole: { label: "Default User Role", type: "text", placeholder: "e.g., student" },
        passwordMinLength: { label: "Minimum Password Length", type: "number", placeholder: "8" },
        sessionTimeout: { label: "Session Timeout (minutes)", type: "number", placeholder: "30" },
      },
      academic: {
        gradingScale: { label: "Grading Scale", type: "text", placeholder: "e.g., A-F or 1-10" },
        passMark: { label: "Pass Mark Percentage", type: "number", placeholder: "40" },
        maxSubjects: { label: "Maximum Subjects per Student", type: "number", placeholder: "8" },
      },
      student: {
        admissionFee: { label: "Admission Fee", type: "number", placeholder: "1000" },
        maxStudentsPerClass: { label: "Max Students per Class", type: "number", placeholder: "30" },
        attendanceThreshold: { label: "Attendance Threshold (%)", type: "number", placeholder: "75" },
      },
      teacher: {
        maxTeachingLoad: { label: "Maximum Teaching Load (hours)", type: "number", placeholder: "40" },
        baseSalary: { label: "Base Salary", type: "number", placeholder: "50000" },
      },
      examination: {
        examDuration: { label: "Default Exam Duration (minutes)", type: "number", placeholder: "120" },
        passingGrade: { label: "Passing Grade", type: "text", placeholder: "D" },
      },
      fees: {
        currency: { label: "Currency", type: "text", placeholder: "USD" },
        lateFee: { label: "Late Fee Amount", type: "number", placeholder: "50" },
      },
      attendance: {
        autoCloseTime: { label: "Auto Close Time (minutes after start)", type: "number", placeholder: "15" },
        gracePeriod: { label: "Grace Period (minutes)", type: "number", placeholder: "5" },
      },
      communication: {
        emailProvider: { label: "Email Provider", type: "text", placeholder: "Gmail" },
        smsProvider: { label: "SMS Provider", type: "text", placeholder: "Twilio" },
      },
      timetable: {
        periodDuration: { label: "Period Duration (minutes)", type: "number", placeholder: "45" },
        breakDuration: { label: "Break Duration (minutes)", type: "number", placeholder: "15" },
      },
      library: {
        maxBooksPerStudent: { label: "Max Books per Student", type: "number", placeholder: "3" },
        loanPeriod: { label: "Loan Period (days)", type: "number", placeholder: "14" },
        finePerDay: { label: "Fine per Day", type: "number", placeholder: "1" },
      },
      transport: {
        baseFare: { label: "Base Transport Fare", type: "number", placeholder: "100" },
        distanceUnit: { label: "Distance Unit", type: "text", placeholder: "km" },
      },
      hostel: {
        baseRent: { label: "Base Hostel Rent", type: "number", placeholder: "2000" },
        maxOccupancy: { label: "Max Occupancy per Room", type: "number", placeholder: "4" },
      },
      security: {
        backupFrequency: { label: "Backup Frequency", type: "text", placeholder: "daily" },
        maxLoginAttempts: { label: "Max Login Attempts", type: "number", placeholder: "5" },
      },
      ui: {
        theme: { label: "Default Theme", type: "text", placeholder: "light" },
        dateFormat: { label: "Date Format", type: "text", placeholder: "DD/MM/YYYY" },
      },
      integration: {
        apiKey: { label: "API Key", type: "password", placeholder: "Enter API key" },
        webhookUrl: { label: "Webhook URL", type: "url", placeholder: "https://..." },
      },
      data: {
        retentionPeriod: { label: "Data Retention Period (years)", type: "number", placeholder: "7" },
        exportFormat: { label: "Default Export Format", type: "text", placeholder: "PDF" },
      },
      mobile: {
        appVersion: { label: "App Version", type: "text", placeholder: "1.0.0" },
        offlineSync: { label: "Offline Sync Enabled", type: "checkbox" },
      },
    };

    return fieldConfigs[category] || {};
  };

  const fields = getFieldsForCategory(category);

  const handleInputChange = (key: string, value: any) => {
    setSettingsData((prev: any) => ({ ...prev, [key]: value }));
  };

  const action = async (formData: FormData) => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/settings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            category,
            data: settingsData,
          }),
        });

        if (response.ok) {
          toast(`Settings for ${category} have been updated!`);
          setOpen?.(false);
          router.refresh();
        } else {
          toast.error("Failed to update settings");
        }
      } catch (error) {
        toast.error("Something went wrong!");
      }
    });
  };

  return (
    <form className="flex flex-col gap-8" action={action}>
      <h1 className="text-xl font-semibold">
        Configure {category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
      </h1>

      <div className="flex flex-col gap-4">
        {Object.entries(fields).map(([key, config]: [string, any]) => (
          <div key={key} className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">{config.label}</label>
            {config.type === "checkbox" ? (
              <input
                type="checkbox"
                checked={settingsData[key] || false}
                onChange={(e) => handleInputChange(key, e.target.checked)}
                className="w-4 h-4"
              />
            ) : (
              <input
                type={config.type}
                value={settingsData[key] || ""}
                onChange={(e) => handleInputChange(key, config.type === "number" ? Number(e.target.value) : e.target.value)}
                placeholder={config.placeholder}
                className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
              />
            )}
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-blue-400 text-white p-2 rounded-md disabled:opacity-50"
      >
        {isPending ? "Updating..." : "Update Settings"}
      </button>
    </form>
  );
};

export default SettingsForm;
