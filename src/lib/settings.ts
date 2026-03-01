export const  ITEM_PER_PAGE = 10;
export const  ITEM_PER_PAGE_STUDENT = 10;

type RouteAccessMap = {
  [key: string]: string[];
};

export const routeAccessMap: RouteAccessMap = {
  "/admin(.*)": ["admin"],
  "/student(.*)": ["student"],
  "/teacher(.*)": ["teacher"],
  "/parent(.*)": ["parent"],
  "/list/teachers": ["admin"],
  "/list/students": ["admin"],
  "/list/parents": ["admin"],
  "/list/subjects": ["admin"],
  "/list/classes": ["admin"],
  "/list/lessons": ["teacher"],
  // "/list/finances": ["admin"],
  "/list/exams": ["admin", "teacher", "student", "parent"],
  "/list/assignments": ["admin", "teacher", "student", "parent"],
  "/list/results": ["admin", "teacher", "student", "parent"],
  "/list/events": ["admin", "teacher", "student", "parent"],
  "/list/announcements": ["admin", "teacher", "student", "parent"],
};
