"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Plus, Edit, Trash2, X, Eye } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";
import { resultsData } from "@/lib/data";

// dynamic imports for forms
const TeacherForm = dynamic(() => import("./forms/TeacherForm"));
const StudentForm = dynamic(() => import("./forms/StudentForm"));
const ParentForm = dynamic(() => import("./forms/ParentForm"));
const SubjectForm = dynamic(() => import("./forms/SubjectForm"));
const ClassForm = dynamic(() => import("./forms/ClassForm"));
const LessonForm = dynamic(() => import("./forms/LessonForm"));
const ExamForm = dynamic(() => import("./forms/ExamForm"));
const AssignmentForm = dynamic(() => import("./forms/AssignmentForm"));
const ResultForm = dynamic(() => import("./forms/ResultForm"));
const AttendanceForm = dynamic(() => import("./forms/AttendanceForm"));
const EventForm = dynamic(() => import("./forms/EventForm"));
const AnnouncementForm = dynamic(() => import("./forms/AnnouncementForm"));

const forms: {
  [key: string]: (type: "create" | "update", data?: any) => JSX.Element;
} = {
  teacher: (type, data) => <TeacherForm type={type} data={data} />,
  student: (type, data) => <StudentForm type={type} data={data} />,
  parent: (type, data) => <ParentForm type={type} data={data} />,
  subject: (type, data) => <SubjectForm type={type} data={data} />,
  class: (type, data) => <ClassForm type={type} data={data} />,
  lesson: (type, data) => <LessonForm type={type} data={data} />,
  exam: (type, data) => <ExamForm type={type} data={data} />,
  assignment: (type, data) => <AssignmentForm type={type} data={data} />,
  result: (type, data) => <ResultForm type={type} data={data} />,
  attendance: (type, data) => <AttendanceForm type={type} data={data} />,
  event: (type, data) => <EventForm type={type} data={data} />,
  announcement: (type, data) => <AnnouncementForm type={type} data={data} />,
};

const FormModal = ({
  table,
  type,
  data,
  id,
}: {
  table:
    | "teacher"
    | "student"
    | "parent"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement";
  type: "create" | "update" | "delete" | "view";
  data?: any;
  id?: number;
}) => {
  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor = "bg-ZekPurple";

  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getIcon = () => {
    switch (type) {
      case "create":
        return <Plus size={16} className="text-black" />;
      case "update":
        return <Edit size={16} className="text-black" />;
      case "delete":
        return <Trash2 size={16} className="text-black" />;
      case "view":
        return <Eye size={16} className="text-black" />;
      default:
        return <Plus size={16} className="text-black" />;
    }
  };

  const Form = () => {
    if (type === "delete" && id) {
      return (
        <form action="" className="p-4 flex flex-col gap-4">
          <span className="text-center font-medium">
            All data will be lost. Are you sure you want to delete this {table}?
          </span>
          <button className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max self-center">
            Delete
          </button>
        </form>
      );
    }

    if (type === "view") {
      // result view: show all results for the student
      if (table === "result" && data?.student) {
        const studentName = data.student;
        const studentResults = resultsData.filter((r) => r.student === studentName);
        return (
          <div className="p-4">
            <h2 className="text-xl font-semibold">Results for {studentName}</h2>
            <div className="mt-4">
              {studentResults.length === 0 ? (
                <p>No results found for this student.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th>Subject</th>
                      <th>Class</th>
                      <th>Type</th>
                      <th>Score</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentResults.map((r) => (
                      <tr key={r.id} className="border-t">
                        <td className="py-2">{r.subject}</td>
                        <td className="py-2">{r.class}</td>
                        <td className="py-2">{r.type}</td>
                        <td className="py-2">{r.score}</td>
                        <td className="py-2">{r.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        );
      }

      // parent view: show parent details including number of students
      if (table === "parent" && data) {
        const studentCount = Array.isArray(data.students) ? data.students.length : 0;
        return (
          <div className="p-4">
            <h2 className="text-xl font-semibold">{data.name}</h2>
            <p className="text-sm text-gray-600 mt-1">{data.email}</p>
            <div className="mt-4">
              <p className="font-medium">Phone: <span className="font-normal">{data.phone}</span></p>
              <p className="font-medium">Address: <span className="font-normal">{data.address}</span></p>
              <p className="font-medium">Number of students: <span className="font-normal">{studentCount}</span></p>
              <div className="mt-2">
                <h3 className="font-semibold">Students</h3>
                <ul className="list-disc pl-6">
                  {(data.students || []).map((s: string, idx: number) => (
                    <li key={idx} className="text-sm">{s}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-semibold">Students' Results</h3>
                {(data.students || []).map((studentName: string, idx: number) => {
                  const studentResults = resultsData.filter((r) => r.student === studentName);
                  return (
                    <div key={idx} className="mt-3">
                      <h4 className="font-medium">{studentName}</h4>
                      {studentResults.length === 0 ? (
                        <p className="text-sm text-gray-500">No results for this student.</p>
                      ) : (
                        <table className="w-full text-sm mt-2">
                          <thead>
                            <tr className="text-left text-gray-500">
                              <th>Subject</th>
                              <th>Type</th>
                              <th>Score</th>
                              <th>Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {studentResults.map((r) => (
                              <tr key={r.id} className="border-t">
                                <td className="py-2">{r.subject}</td>
                                <td className="py-2">{r.type}</td>
                                <td className="py-2">{r.score}</td>
                                <td className="py-2">{r.date}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }

      return <div className="p-4">No view available for this item.</div>;
    }

    if (type === "create" || type === "update") {
      const renderer = forms[table];
      return renderer ? renderer(type, data) : <div>Form not found!</div>;
    }

    return <div>Form not found!</div>;
  };

  return (
    <>
      <button
        className={`${size} flex items-center justify-center rounded-full ${bgColor} text-white`}
        onClick={async () => {
          if (type === "view" || type === "create") {
            setIsLoading(true);
            // Simulate loading delay with shorter duration
            await new Promise((resolve) => setTimeout(resolve, 500));
            setIsLoading(false);
          }
          setOpen(true);
        }}
      >
        {getIcon()}
      </button>
      {isLoading && <LoadingSpinner />}
      {open && (
        <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
            <Form />
            <div className="absolute top-4 right-4 cursor-pointer" onClick={() => setOpen(false)}>
              <X size={14} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;