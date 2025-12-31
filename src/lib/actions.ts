"use server";

import { revalidatePath } from "next/cache";
import {
  AnnouncementSchema,
  AnnouncementFormSchema,
  AssignmentSchema,
  AttendanceSchema,
  ClassSchema,
  EventSchema,
  EventFormSchema,
  ExamSchema,
  LessonSchema,
  ParentSchema,
  ProfileUpdateSchema,
  ResultSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
  TeacherCreateSchema,
} from "./formValidationSchemas";
import prisma from "./prisma";
import { clerkClient } from "@clerk/nextjs/server";

type CurrentState = { success: boolean; error: boolean; message?: string };

export const createSubject = async (
  data: SubjectSchema
) => {
  try {
    await prisma.subject.create({
      data: {
        name: data.name,
        teachers: {
          connect: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    revalidatePath("/list/subjects");
    return { success: true, error: false, message: "Subject created successfully" };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateSubject = async (
  data: SubjectSchema
) => {
  if (!data.id) {
    return { success: false, error: true, message: 'Subject ID is required' };
  }

  try {
    await prisma.subject.update({
      where: {
        id: Number(data.id),
      },
      data: {
        name: data.name,
        teachers: {
          set: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    revalidatePath("/list/subjects");
    return { success: true, error: false, message: "Subject updated successfully" };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteSubject = async (data: FormData) => {
  const id = data.get("id") as string;
  try {
    await prisma.$transaction(async (tx) => {
      // First, find all lessons for this subject
      const lessons = await tx.lesson.findMany({
        where: { subjectId: parseInt(id) },
        include: {
          exams: true,
          assignments: true,
          attendances: true,
        },
      });

      // Delete all results related to exams and assignments of these lessons
      for (const lesson of lessons as any) {
        await tx.result.deleteMany({
          where: {
            OR: [
              { examId: { in: lesson.exams.map((e: any) => e.id) } },
              { assignmentId: { in: lesson.assignments.map((a: any) => a.id) } },
            ],
          },
        });

        // Delete attendances
        await tx.attendance.deleteMany({
          where: { lessonId: lesson.id },
        });

        // Delete exams
        await tx.exam.deleteMany({
          where: { lessonId: lesson.id },
        });

        // Delete assignments
        await tx.assignment.deleteMany({
          where: { lessonId: lesson.id },
        });
      }

      // Delete all lessons for this subject
      await tx.lesson.deleteMany({
        where: { subjectId: parseInt(id) },
      });

      // Finally, delete the subject
      await tx.subject.delete({
        where: {
          id: parseInt(id),
        },
      });
    });

    revalidatePath("/list/subjects");
  } catch (err) {
    console.log(err);
    throw new Error("Failed to delete subject");
  }
};

export const createClass = async (
  data: ClassSchema
) => {
  try {
    await prisma.class.create({
      data,
    });

    revalidatePath("/list/classes");
    return { success: true, error: false, message: "Class created successfully" };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateClass = async (
  data: ClassSchema
) => {
  try {
    const { id, ...updateData } = data;
    await prisma.class.update({
      where: {
        id: id!,
      },
      data: updateData,
    });

    revalidatePath("/list/classes");
    return { success: true, error: false, message: "Class updated successfully" };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteClass = async (data: FormData) => {
  const id = data.get("id") as string;
  try {
    await prisma.class.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/classes");
  } catch (err) {
    console.log(err);
    throw new Error("Failed to delete class");
  }
};

export const createTeacher = async (
  data: TeacherSchema
) => {
  console.log('createTeacher called with:', { 
    username: data.username,
    hasPassword: !!data.password,
    name: data.name,
    surname: data.surname 
  });

  try {
    // Validate required fields
    if (!data.username || !data.password || !data.name || !data.surname) {
      return { 
        success: false, 
        error: true,
        message: 'Username, password, name, and surname are required'
      };
    }



    // Create user in Clerk
    const user = await (await clerkClient()).users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "teacher" }
    });

    console.log('Clerk user created successfully:', user.id);

    // Create teacher in database
    await prisma.teacher.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        birthday: data.birthday ? new Date(data.birthday) : null,
        sex: data.sex,
        subjects: {
          connect: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });

    console.log('Teacher created in database');
    revalidatePath("/list/teachers");
    return { 
      success: true, 
      error: false,
      message: 'Teacher created successfully'
    };
    
  } catch (err: any) {
    console.error('Error creating teacher:', err);
    
    let errorMessage = 'Failed to create teacher';
    
    // Parse Clerk validation errors
    if (err.errors && err.errors.length > 0) {
      const clerkErrors = err.errors.map((error: any) => {
        switch (error.code) {
          case 'form_param_format_invalid':
            return `Invalid format for ${error.param || 'field'}`;
          case 'form_password_length_too_short':
            return 'Password must be at least 8 characters';
          case 'form_password_no_uppercase':
            return 'Password must contain at least one uppercase letter';
          case 'form_password_no_lowercase':
            return 'Password must contain at least one lowercase letter';
          case 'form_password_no_number':
            return 'Password must contain at least one number';
          case 'form_username_exists':
            return 'Username already exists. Please choose a different one.';
          case 'form_param_nil':
            return `Missing required field: ${error.param || 'unknown'}`;
          default:
            return error.message || 'Validation error';
        }
      });
      
      errorMessage = clerkErrors.join('. ');
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    return {
      success: false,
      error: true,
      message: errorMessage
    };
  }
};

export const createResult = async (
  data: ResultSchema
) => {
  try {
    await prisma.result.create({
      data: {
        score: data.score,
        examId: data.examId || null,
        assignmentId: data.assignmentId || null,
        studentId: data.studentId,
      },
    });

    revalidatePath("/list/results");
    return { success: true, error: false, message: "Result created successfully" };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateResult = async (
  data: ResultSchema
) => {
  if (!data.id) {
    return { success: false, error: true, message: 'Result ID is required' };
  }

  try {
    await prisma.result.update({
      where: {
        id: data.id,
      },
      data: {
        score: data.score,
        examId: data.examId || null,
        assignmentId: data.assignmentId || null,
        studentId: data.studentId,
      },
    });

    revalidatePath("/list/results");
    return { success: true, error: false, message: "Result updated successfully" };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateTeacher = async (
  data: TeacherSchema
) => {
  console.log('updateTeacher called with:', {
    id: data.id,
    username: data.username,
    hasPassword: !!data.password,
    passwordLength: data.password?.length,
    name: data.name,
    surname: data.surname
  });

  if (!data.id) {
    console.log('No teacher ID provided');
    return { success: false, error: true, message: 'Teacher ID is required' };
  }

  // Validate password if provided
  if (data.password && data.password !== "") {
    const password = data.password;
    if (password.length < 8) {
      return {
        success: false,
        error: true,
        message: 'Password must be at least 8 characters'
      };
    }
    if (!/[A-Z]/.test(password)) {
      return {
        success: false,
        error: true,
        message: 'Password must contain at least one uppercase letter'
      };
    }
    if (!/[a-z]/.test(password)) {
      return {
        success: false,
        error: true,
        message: 'Password must contain at least one lowercase letter'
      };
    }
    if (!/[0-9]/.test(password)) {
      return {
        success: false,
        error: true,
        message: 'Password must contain at least one number'
      };
    }
  }

  try {
    console.log('Updating Clerk user...');
    const clerkUpdateData: any = {
      username: data.username,
      firstName: data.name,
      lastName: data.surname,
    };

    // Only include password if it's provided and not empty
    if (data.password && data.password !== "") {
      clerkUpdateData.password = data.password;
    }

    const user = await (await clerkClient()).users.updateUser(data.id, clerkUpdateData);
    console.log('Clerk user updated successfully');

    console.log('Updating teacher in database...');

    // Build update data object with only provided fields
    const updateData: any = {
      username: data.username,
      name: data.name,
      surname: data.surname,
      address: data.address,
      bloodType: data.bloodType,
      sex: data.sex,
    };

    // Only update optional fields if they are provided and not empty
    if (data.email !== undefined && data.email !== "") {
      updateData.email = data.email;
    }

    if (data.phone !== undefined && data.phone !== "") {
      updateData.phone = data.phone;
    }

    // Only update image if provided
    if (data.img !== undefined && data.img !== "") {
      updateData.img = data.img;
    }

    // Only update subjects if provided
    if (data.subjects && data.subjects.length > 0) {
      updateData.subjects = {
        set: data.subjects.map((subjectId: string) => ({
          id: parseInt(subjectId),
        })),
      };
    }

    // Only update birthday if provided
    if (data.birthday !== undefined) {
      updateData.birthday = data.birthday ? new Date(data.birthday) : null;
    }

    await prisma.teacher.update({
      where: {
        id: data.id,
      },
      data: updateData,
    });
    console.log('Teacher updated in database successfully');
    revalidatePath("/list/teachers");
    return { success: true, error: false, message: "Teacher updated successfully" };
  } catch (err: any) {
    console.error('Error updating teacher:', err);

    let errorMessage = 'Failed to update teacher';

    // Parse Clerk validation errors
    if (err.errors && err.errors.length > 0) {
      const clerkErrors = err.errors.map((error: any) => {
        switch (error.code) {
          case 'form_param_format_invalid':
            return `Invalid format for ${error.param || 'field'}`;
          case 'form_password_length_too_short':
            return 'Password must be at least 8 characters';
          case 'form_password_no_uppercase':
            return 'Password must contain at least one uppercase letter';
          case 'form_password_no_lowercase':
            return 'Password must contain at least one lowercase letter';
          case 'form_password_no_number':
            return 'Password must contain at least one number';
          case 'form_username_exists':
            return 'Username already exists. Please choose a different one.';
          case 'form_param_nil':
            return `Missing required field: ${error.param || 'unknown'}`;
          default:
            return error.message || 'Validation error';
        }
      });

      errorMessage = clerkErrors.join('. ');
    } else if (err.message) {
      errorMessage = err.message;
    }

    return {
      success: false,
      error: true,
      message: errorMessage
    };
  }
};

export const deleteTeacher = async (data: FormData) => {
  const id = data.get("id") as string;
  try {
    console.log('Starting deleteTeacher for id:', id);

    // First, check if teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: { id: id },
      select: { id: true, name: true, surname: true },
    });

    if (!teacher) {
      console.log('Teacher not found:', id);
      throw new Error(`Teacher with id ${id} not found`);
    }

    console.log('Teacher found:', teacher.name, teacher.surname);

    await prisma.$transaction(async (tx) => {
      console.log('Starting transaction');

      // Find all subjects that have this teacher
      const subjectsWithTeacher = await tx.subject.findMany({
        where: { teachers: { some: { id: id } } },
        select: { id: true, name: true },
      });
      console.log('Subjects with teacher:', subjectsWithTeacher.length);

      // Disconnect teacher from each subject
      for (const subject of subjectsWithTeacher) {
        console.log('Disconnecting from subject:', subject.name);
        await tx.subject.update({
          where: { id: subject.id },
          data: { teachers: { disconnect: { id: id } } },
        });
      }

      // Find all lessons that have this teacher
      const lessonsWithTeacher = await tx.lesson.findMany({
        where: { teachers: { some: { id: id } } },
        select: { id: true, name: true },
      });
      console.log('Lessons with teacher:', lessonsWithTeacher.length);

      // Disconnect teacher from each lesson
      for (const lesson of lessonsWithTeacher) {
        console.log('Disconnecting from lesson:', lesson.name);
        await tx.lesson.update({
          where: { id: lesson.id },
          data: { teachers: { disconnect: { id: id } } },
        });
      }

      // Set supervisorId to null for classes where this teacher is supervisor
      const classesUpdated = await tx.class.updateMany({
        where: { supervisorId: id },
        data: { supervisorId: null },
      });
      console.log('Classes updated (supervisor set to null):', classesUpdated.count);

      // Finally, delete the teacher
      console.log('Deleting teacher from database');
      await tx.teacher.delete({
        where: {
          id: id,
        },
      });
      console.log('Teacher deleted from database');
    });

    // Now delete from Clerk
    console.log('Deleting from Clerk');
    try {
      await (await clerkClient()).users.deleteUser(id);
      console.log('Deleted from Clerk successfully');
    } catch (clerkErr) {
      console.error('Failed to delete from Clerk:', clerkErr);
      // Teacher is already deleted from DB, so perhaps it's ok
    }

    revalidatePath("/list/teachers");
    console.log('Delete teacher completed successfully');
  } catch (err) {
    console.error('Error deleting teacher:', err);
    throw err; // Throw the actual error
  }
};

export const createStudent = async (
  data: StudentSchema
) => {
  console.log('createStudent called with full data:', data);
  console.log('createStudent called with:', {
    username: data.username,
    hasPassword: !!data.password,
    name: data.name,
    surname: data.surname
  });

  try {
    console.log('Starting validation...');
    // Validate required fields
    if (!data.username || !data.password || !data.name || !data.surname) {
      console.log('Validation failed: missing required fields');
      return {
        success: false,
        error: true,
        message: 'Username, password, name, and surname are required'
      };
    }

    // Validate password format
    const password = data.password;
    if (password.length < 8) {
      return {
        success: false,
        error: true,
        message: 'Password must be at least 8 characters'
      };
    }
    if (!/[A-Z]/.test(password)) {
      return {
        success: false,
        error: true,
        message: 'Password must contain at least one uppercase letter'
      };
    }
    if (!/[a-z]/.test(password)) {
      return {
        success: false,
        error: true,
        message: 'Password must contain at least one lowercase letter'
      };
    }
    if (!/[0-9]/.test(password)) {
      return {
        success: false,
        error: true,
        message: 'Password must contain at least one number'
      };
    }

    console.log('Required fields validation passed');



    const classItem = await prisma.class.findUnique({
      where: { id: data.classId },
      include: { _count: { select: { students: true } } },
    });

    if (classItem && classItem.capacity === classItem._count.students) {
      return { success: false, error: true, message: 'Class is at full capacity' };
    }

    // Check if parentId is provided and exists; if not, set to null
    let validParentId = null;
    if (data.parentId && data.parentId.trim() !== '') {
      const parentExists = await prisma.parent.findUnique({
        where: { id: data.parentId },
      });
      if (parentExists) {
        validParentId = data.parentId;
      }
      // If parent doesn't exist, validParentId remains null
    }

    // Create user in Clerk
    const clerkData: any = {
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "student" }
    };

    // Only include email if it's provided and not empty
    if (data.email && data.email.trim() !== '') {
      clerkData.email = data.email;
    }

    const user = await (await clerkClient()).users.createUser(clerkData);

    console.log('Clerk user created successfully:', user.id);

    // Create student in database
    console.log('Creating student in database with data:', {
      id: user.id,
      username: data.username,
      name: data.name,
      surname: data.surname,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address,
      img: data.img || null,
      bloodType: data.bloodType,
      sex: data.sex,
      birthday: new Date(data.birthday),
      gradeId: data.gradeId,
      classId: data.classId,
      parentId: validParentId,
    });

    const student = await prisma.student.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: new Date(data.birthday),
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: validParentId,
      },
    });

    console.log('Student created in database:', student.id);
    revalidatePath("/list/students", "page");
    return {
      success: true,
      error: false,
      message: 'Student created successfully'
    };

  } catch (err: any) {
    console.error('Error creating student:', err);

    let errorMessage = 'Failed to create student';

    // Parse Clerk validation errors
    if (err.errors && err.errors.length > 0) {
      const clerkErrors = err.errors.map((error: any) => {
        switch (error.code) {
          case 'form_param_format_invalid':
            return `Invalid format for ${error.param || 'field'}`;
          case 'form_password_length_too_short':
            return 'Password must be at least 8 characters';
          case 'form_password_no_uppercase':
            return 'Password must contain at least one uppercase letter';
          case 'form_password_no_lowercase':
            return 'Password must contain at least one lowercase letter';
          case 'form_password_no_number':
            return 'Password must contain at least one number';
          case 'form_username_exists':
            return 'Username already exists. Please choose a different one.';
          case 'form_param_nil':
            return `Missing required field: ${error.param || 'unknown'}`;
          default:
            return error.message || 'Validation error';
        }
      });

      errorMessage = clerkErrors.join('. ');
    } else if (err.message) {
      errorMessage = err.message;
    }

    return {
      success: false,
      error: true,
      message: errorMessage
    };
  }
};

export const updateStudent = async (
  data: StudentSchema
) => {
  console.log('updateStudent called with:', {
    id: data.id,
    username: data.username,
    hasPassword: !!data.password,
    passwordLength: data.password?.length,
    name: data.name,
    surname: data.surname
  });

  if (!data.id) {
    console.log('No student ID provided');
    return { success: false, error: true, message: 'Student ID is required' };
  }

  // Validate password if provided
  if (data.password && data.password !== "") {
    const password = data.password;
    if (password.length < 8) {
      return {
        success: false,
        error: true,
        message: 'Password must be at least 8 characters'
      };
    }
    if (!/[A-Z]/.test(password)) {
      return {
        success: false,
        error: true,
        message: 'Password must contain at least one uppercase letter'
      };
    }
    if (!/[a-z]/.test(password)) {
      return {
        success: false,
        error: true,
        message: 'Password must contain at least one lowercase letter'
      };
    }
    if (!/[0-9]/.test(password)) {
      return {
        success: false,
        error: true,
        message: 'Password must contain at least one number'
      };
    }
  }

  try {
    console.log('Updating Clerk user...');
    const user = await (await clerkClient()).users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });
    console.log('Clerk user updated successfully');

    console.log('Updating student in database...');

    // Check if parentId is provided and exists; if not, set to null
    let validParentId = null;
    if (data.parentId && data.parentId.trim() !== '') {
      const parentExists = await prisma.parent.findUnique({
        where: { id: data.parentId },
      });
      if (parentExists) {
        validParentId = data.parentId;
      }
      // If parent doesn't exist, validParentId remains null
    }

    await prisma.student.update({
      where: {
        id: data.id,
      },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday ? new Date(data.birthday) : null,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: validParentId,
      },
    });
    console.log('Student updated in database successfully');
    revalidatePath("/list/students");
    return { success: true, error: false, message: "Student updated successfully" };
  } catch (err: any) {
    console.error('Error updating student:', err);

    let errorMessage = 'Failed to update student';

    // Parse Clerk validation errors
    if (err.errors && err.errors.length > 0) {
      const clerkErrors = err.errors.map((error: any) => {
        switch (error.code) {
          case 'form_param_format_invalid':
            return `Invalid format for ${error.param || 'field'}`;
          case 'form_password_length_too_short':
            return 'Password must be at least 8 characters';
          case 'form_password_no_uppercase':
            return 'Password must contain at least one uppercase letter';
          case 'form_password_no_lowercase':
            return 'Password must contain at least one lowercase letter';
          case 'form_password_no_number':
            return 'Password must contain at least one number';
          case 'form_username_exists':
            return 'Username already exists. Please choose a different one.';
          case 'form_param_nil':
            return `Missing required field: ${error.param || 'unknown'}`;
          default:
            return error.message || 'Validation error';
        }
      });

      errorMessage = clerkErrors.join('. ');
    } else if (err.message) {
      errorMessage = err.message;
    }

    return {
      success: false,
      error: true,
      message: errorMessage
    };
  }
};

export const deleteStudent = async (data: FormData) => {
  const id = data.get("id") as string;
  try {
    await prisma.$transaction(async (tx) => {
      // Delete related attendances
      await tx.attendance.deleteMany({
        where: { studentId: id },
      });

      // Delete related results
      await tx.result.deleteMany({
        where: { studentId: id },
      });

      // Delete the student
      await tx.student.delete({
        where: {
          id: id,
        },
      });
    });

    // Delete from Clerk after DB deletion
    try {
      await (await clerkClient()).users.deleteUser(id);
    } catch (clerkErr) {
      console.error('Failed to delete from Clerk:', clerkErr);
      // Student is already deleted from DB, so perhaps it's ok
    }

    revalidatePath("/list/students");
  } catch (err) {
    console.log(err);
    throw new Error("Failed to delete student");
  }
};

export const createExam = async (
  data: ExamSchema
) => {
  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    // if (role === "teacher") {
    //   const teacherLesson = await prisma.lesson.findFirst({
    //     where: {
    //       teacherId: userId!,
    //       id: data.lessonId,
    //     },
    //   });

    //   if (!teacherLesson) {
    //     return { success: false, error: true };
    //   }
    // }

    await prisma.exam.create({
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    revalidatePath("/list/exams");
    return { success: true, error: false, message: "Exam created successfully" };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateExam = async (
  data: ExamSchema
) => {
  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    // if (role === "teacher") {
    //   const teacherLesson = await prisma.lesson.findFirst({
    //     where: {
    //       teacherId: userId!,
    //       id: data.lessonId,
    //     },
    //   });

    //   if (!teacherLesson) {
    //     return { success: false, error: true };
    //   }
    // }

    await prisma.exam.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    revalidatePath("/list/exams");
    return { success: true, error: false, message: "Exam updated successfully" };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteExam = async (data: FormData) => {
  const id = data.get("id") as string;

  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    await prisma.$transaction(async (tx) => {
      // Delete results related to this exam
      await tx.result.deleteMany({
        where: { examId: parseInt(id) },
      });

      // Delete the exam
      await tx.exam.delete({
        where: {
          id: parseInt(id),
          // ...(role === "teacher" ? { lesson: { teacherId: userId! } } : {}),
        },
      });
    });

    revalidatePath("/list/exams");
  } catch (err) {
    console.log(err);
    throw new Error("Failed to delete exam");
  }
};

export const deleteParent = async (data: FormData) => {
  const id = data.get("id") as string;
  try {
    console.log('Starting deleteParent for id:', id);

    // First, check if parent exists
    const parent = await prisma.parent.findUnique({
      where: { id: id },
      select: { id: true, name: true, surname: true },
    });

    if (!parent) {
      console.log('Parent not found:', id);
      throw new Error(`Parent with id ${id} not found`);
    }

    console.log('Parent found:', parent.name, parent.surname);

    // Delete from Clerk first
    console.log('Deleting from Clerk');
    try {
      await (await clerkClient()).users.deleteUser(id);
      console.log('Deleted from Clerk successfully');
    } catch (clerkErr) {
      console.error('Failed to delete from Clerk:', clerkErr);
      // Parent might not exist in Clerk, but continue with DB deletion
    }

    // Delete from database
    console.log('Deleting parent from database');
    await prisma.parent.delete({
      where: {
        id: id,
      },
    });
    console.log('Parent deleted from database');

    revalidatePath("/list/parents");
    console.log('Delete parent completed successfully');
  } catch (err) {
    console.error('Error deleting parent:', err);
    throw err; // Throw the actual error
  }
};

export const deleteLesson = async (data: FormData) => {
  const id = data.get("id") as string;
  try {
    await prisma.$transaction(async (tx) => {
      // Find the lesson with related data
      const lesson = await tx.lesson.findUnique({
        where: { id: parseInt(id) },
        include: {
          exams: true,
          assignments: true,
          attendances: true,
        },
      });

      if (!lesson) {
        throw new Error("Lesson not found");
      }

      // Delete results related to exams and assignments of this lesson
      await tx.result.deleteMany({
        where: {
          OR: [
            { examId: { in: lesson.exams.map((e) => e.id) } },
            { assignmentId: { in: lesson.assignments.map((a) => a.id) } },
          ],
        },
      });

      // Delete attendances for this lesson
      await tx.attendance.deleteMany({
        where: { lessonId: lesson.id },
      });

      // Delete exams for this lesson
      await tx.exam.deleteMany({
        where: { lessonId: lesson.id },
      });

      // Delete assignments for this lesson
      await tx.assignment.deleteMany({
        where: { lessonId: lesson.id },
      });

      // Finally, delete the lesson
      await tx.lesson.delete({
        where: {
          id: parseInt(id),
        },
      });
    });

    revalidatePath("/list/lessons");
  } catch (err) {
    console.log(err);
    throw new Error("Failed to delete lesson");
  }
};

export const deleteAssignment = async (data: FormData) => {
  const id = data.get("id") as string;
  try {
    await prisma.assignment.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/assignments");
  } catch (err) {
    console.log(err);
    throw new Error("Failed to delete assignment");
  }
};

export const createAssignment = async (
  data: AssignmentSchema
) => {
  try {
    await prisma.assignment.create({
      data: {
        title: data.title,
        startDate: data.startDate,
        dueDate: data.dueDate,
        lessonId: data.lessonId,
      },
    });

    revalidatePath("/list/assignments");
    return { success: true, error: false, message: "Assignment created successfully" };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateAssignment = async (
  data: AssignmentSchema
) => {
  try {
    await prisma.assignment.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        startDate: data.startDate,
        dueDate: data.dueDate,
        lessonId: data.lessonId,
      },
    });

    revalidatePath("/list/assignments");
    return { success: true, error: false, message: "Assignment updated successfully" };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteResult = async (data: FormData) => {
  const id = data.get("id") as string;
  try {
    await prisma.result.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/results");
  } catch (err) {
    console.log(err);
    throw new Error("Failed to delete result");
  }
};

export const deleteAttendance = async (data: FormData) => {
  const id = data.get("id") as string;
  try {
    await prisma.attendance.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/attendances");
  } catch (err) {
    console.log(err);
    throw new Error("Failed to delete attendance");
  }
};

export const createEvent = async (
  data: EventFormSchema
) => {
  try {
    const startTime = new Date(`${data.date}T${data.startTime}`);
    const endTime = new Date(`${data.date}T${data.endTime}`);

    await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        classId: parseInt(data.classId),
        startTime: startTime,
        endTime: endTime,
      },
    });

    revalidatePath("/list/events");
    return { success: true, error: false, message: "Event created successfully" };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateEvent = async (
  data: EventFormSchema
) => {
  if (!data.id) {
    return { success: false, error: true, message: 'Event ID is required' };
  }

  try {
    const startTime = new Date(`${data.date}T${data.startTime}`);
    const endTime = new Date(`${data.date}T${data.endTime}`);

    await prisma.event.update({
      where: {
        id: parseInt(data.id),
      },
      data: {
        title: data.title,
        description: data.description,
        classId: data.classId ? parseInt(data.classId) : null,
        startTime: startTime,
        endTime: endTime,
      },
    });

    revalidatePath("/list/events");
    return { success: true, error: false, message: "Event updated successfully" };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteEvent = async (data: FormData) => {
  const id = data.get("id") as string;
  try {
    await prisma.event.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/events");
  } catch (err) {
    console.log(err);
    throw new Error("Failed to delete event");
  }
};

export const createAnnouncement = async (
  data: AnnouncementSchema
) => {
  try {
    await prisma.announcement.create({
      data: {
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        classId: data.classId || null,
      },
    });

    revalidatePath("/list/announcements");
    return { success: true, error: false, message: "Announcement created successfully" };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateAnnouncement = async (
  data: AnnouncementSchema
) => {
  if (!data.id) {
    return { success: false, error: true, message: 'Announcement ID is required' };
  }

  try {
    await prisma.announcement.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        classId: data.classId || null,
      },
    });

    revalidatePath("/list/announcements");
    return { success: true, error: false, message: "Announcement updated successfully" };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteAnnouncement = async (data: FormData) => {
  const id = data.get("id") as string;
  try {
    await prisma.announcement.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/announcements");
  } catch (err) {
    console.log(err);
    throw new Error("Failed to delete announcement");
  }
};

export const createParent = async (
  data: ParentSchema
) => {
  console.log('createParent called with:', {
    username: data.username,
    hasPassword: !!data.password,
    name: data.name,
    surname: data.surname
  });

  try {
    // Validate required fields
    if (!data.username || !data.password || !data.name || !data.surname) {
      return {
        success: false,
        error: true,
        message: 'Username, password, name, and surname are required'
      };
    }

    // Validate password format
    const password = data.password;
    if (password.length < 8) {
      return {
        success: false,
        error: true,
        message: 'Password must be at least 8 characters'
      };
    }
    if (!/[A-Z]/.test(password)) {
      return {
        success: false,
        error: true,
        message: 'Password must contain at least one uppercase letter'
      };
    }
    if (!/[a-z]/.test(password)) {
      return {
        success: false,
        error: true,
        message: 'Password must contain at least one lowercase letter'
      };
    }
    if (!/[0-9]/.test(password)) {
      return {
        success: false,
        error: true,
        message: 'Password must contain at least one number'
      };
    }

    // Create user in Clerk
    const clerkData: any = {
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "parent" }
    };

    // Only include email if it's provided and not empty
    if (data.email && data.email.trim() !== '') {
      clerkData.email = data.email;
    }

    const user = await (await clerkClient()).users.createUser(clerkData);

    console.log('Clerk user created successfully:', user.id);

    // Create parent in database
    await prisma.parent.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
        students: {
          connect: data.students?.map((studentId: string) => ({
            id: studentId,
          })),
        },
      },
    });

    console.log('Parent created in database');
    revalidatePath("/list/parents");
    return {
      success: true,
      error: false,
      message: 'Parent created successfully'
    };

  } catch (err: any) {
    console.error('Error creating parent:', err);

    let errorMessage = 'Failed to create parent';

    // Parse Prisma unique constraint errors
    if (err.code === 'P2002') {
      if (err.meta?.target?.includes('phone')) {
        errorMessage = 'Phone number already exists. Please use a different one.';
      } else if (err.meta?.target?.includes('username')) {
        errorMessage = 'Username already exists. Please choose a different one.';
      } else if (err.meta?.target?.includes('email')) {
        errorMessage = 'Email already exists. Please use a different one.';
      } else {
        errorMessage = 'A unique constraint was violated. Please check your input.';
      }
    }
    // Parse Clerk validation errors
    else if (err.errors && err.errors.length > 0) {
      const clerkErrors = err.errors.map((error: any) => {
        switch (error.code) {
          case 'form_param_format_invalid':
            return `Invalid format for ${error.param || 'field'}`;
          case 'form_password_length_too_short':
            return 'Password must be at least 8 characters';
          case 'form_password_no_uppercase':
            return 'Password must contain at least one uppercase letter';
          case 'form_password_no_lowercase':
            return 'Password must contain at least one lowercase letter';
          case 'form_password_no_number':
            return 'Password must contain at least one number';
          case 'form_username_exists':
            return 'Username already exists. Please choose a different one.';
          case 'form_param_nil':
            return `Missing required field: ${error.param || 'unknown'}`;
          default:
            return error.message || 'Validation error';
        }
      });

      errorMessage = clerkErrors.join('. ');
    } else if (err.message) {
      errorMessage = err.message;
    }

    return {
      success: false,
      error: true,
      message: errorMessage
    };
  }
};

export const createLesson = async (
  data: LessonSchema
) => {
  try {
    await prisma.lesson.create({
      data: {
        name: data.name,
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime,
        subjectId: data.subjectId,
        classId: data.classId,
        teachers: {
          connect: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    revalidatePath("/list/lessons");
    return { success: true, error: false, message: "Lesson created successfully" };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateLesson = async (
  data: LessonSchema
) => {
  try {
    const updateData: any = {
      name: data.name,
      day: data.day,
      subjectId: data.subjectId,
      classId: data.classId,
      teachers: {
        set: data.teachers.map((teacherId) => ({ id: teacherId })),
      },
    };

    if (data.startTime) {
      updateData.startTime = data.startTime;
    }

    if (data.endTime) {
      updateData.endTime = data.endTime;
    }

    await prisma.lesson.update({
      where: {
        id: data.id,
      },
      data: updateData,
    });

    revalidatePath("/list/lessons");
    return { success: true, error: false, message: "Lesson updated successfully" };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createAttendance = async (
  data: AttendanceSchema
) => {
  try {
    await prisma.attendance.create({
      data: {
        student: { connect: { id: data.studentId } },
        date: data.date,
        present: data.present,
        lesson: { connect: { id: data.lessonId } },
      },
    });

    revalidatePath("/list/attendances");
    return { success: true, error: false, message: "Attendance created successfully" };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateAttendance = async (
  data: AttendanceSchema
) => {
  if (!data.id) {
    return { success: false, error: true, message: 'Attendance ID is required' };
  }

  try {
    await prisma.attendance.update({
      where: {
        id: data.id,
      },
      data: {
        studentId: data.studentId,
        date: data.date,
        present: data.present,
        lessonId: data.lessonId,
      },
    });

    revalidatePath("/list/attendances");
    return { success: true, error: false, message: "Attendance updated successfully" };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateParent = async (
  data: ParentSchema
) => {
  console.log('updateParent called with:', {
    id: data.id,
    username: data.username,
    hasPassword: !!data.password,
    passwordLength: data.password?.length,
    name: data.name,
    surname: data.surname
  });

  if (!data.id) {
    console.log('No parent ID provided');
    return { success: false, error: true, message: 'Parent ID is required' };
  }

  // Validate password if provided
  if (data.password && data.password !== "") {
    const password = data.password;
    if (password.length < 8) {
      return {
        success: false,
        error: true,
        message: 'Password must be at least 8 characters'
      };
    }
    if (!/[A-Z]/.test(password)) {
      return {
        success: false,
        error: true,
        message: 'Password must contain at least one uppercase letter'
      };
    }
    if (!/[a-z]/.test(password)) {
      return {
        success: false,
        error: true,
        message: 'Password must contain at least one lowercase letter'
      };
    }
    if (!/[0-9]/.test(password)) {
      return {
        success: false,
        error: true,
        message: 'Password must contain at least one number'
      };
    }
  }

  try {
    console.log('Updating Clerk user...');
    const user = await (await clerkClient()).users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });
    console.log('Clerk user updated successfully');

    console.log('Updating parent in database...');
    await prisma.parent.update({
      where: {
        id: data.id,
      },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
        students: {
          set: data.students?.map((studentId: string) => ({
            id: studentId,
          })),
        },
      },
    });
    console.log('Parent updated in database successfully');
    revalidatePath("/list/parents");
    return { success: true, error: false, message: "Parent updated successfully" };
  } catch (err: any) {
    console.error('Error updating parent:', err);

    let errorMessage = 'Failed to update parent';

    // Parse Prisma unique constraint errors
    if (err.code === 'P2002') {
      if (err.meta?.target?.includes('phone')) {
        errorMessage = 'Phone number already exists. Please use a different one.';
      } else if (err.meta?.target?.includes('username')) {
        errorMessage = 'Username already exists. Please choose a different one.';
      } else if (err.meta?.target?.includes('email')) {
        errorMessage = 'Email already exists. Please use a different one.';
      } else {
        errorMessage = 'A unique constraint was violated. Please check your input.';
      }
    }
    // Parse Clerk validation errors
    else if (err.errors && err.errors.length > 0) {
      const clerkErrors = err.errors.map((error: any) => {
        switch (error.code) {
          case 'form_param_format_invalid':
            return `Invalid format for ${error.param || 'field'}`;
          case 'form_password_length_too_short':
            return 'Password must be at least 8 characters';
          case 'form_password_no_uppercase':
            return 'Password must contain at least one uppercase letter';
          case 'form_password_no_lowercase':
            return 'Password must contain at least one lowercase letter';
          case 'form_password_no_number':
            return 'Password must contain at least one number';
          case 'form_username_exists':
            return 'Username already exists. Please choose a different one.';
          case 'form_param_nil':
            return `Missing required field: ${error.param || 'unknown'}`;
          default:
            return error.message || 'Validation error';
        }
      });

      errorMessage = clerkErrors.join('. ');
    } else if (err.message) {
      errorMessage = err.message;
    }

    return {
      success: false,
      error: true,
      message: errorMessage
    };
  }
};
