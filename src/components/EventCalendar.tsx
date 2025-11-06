"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];

// TEMPORARY
const events = [
  {
    id: 1,
    title: "Lorem ipsum dolor",
    time: "12:00 PM - 2:00 PM",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    id: 2,
    title: "Lorem ipsum dolor",
    time: "12:00 PM - 2:00 PM",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    id: 3,
    title: "Lorem ipsum dolor",
    time: "12:00 PM - 2:00 PM",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
];

const EventCalendar = () => {
  const [value, onChange] = useState<Value>(new Date());

   const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Event Calendar</h2>
        <div className="h-64 flex items-center justify-center">
          <p>Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-md">
      <h2 className="text-xl font-bold mb-4">Calendar</h2>
      <Calendar onChange={onChange} value={value} className="mb-4 rounded-md flex-col flex items-center justify-center text-[#000000] font-[Outfit] w-[300px]" />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold my-4">Events</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>
      <div className="flex flex-col gap-4">
        {events.map((event) => (
          <div
            className="p-5 rounded-md border-2 border-gray-100 border-t-4 odd:border-t-ZekSky even:border-t-ZekPurple text-[#000000]"
            key={event.id}
          >
            <div className="flex items-center justify-between">
              <h1 className="font-semibold text-[#000000]">{event.title}</h1>
              <span className="text-[#000000] text-xs">{event.time}</span>
            </div>
            <p className="mt-2 text-[#000000] text-sm">{event.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventCalendar;