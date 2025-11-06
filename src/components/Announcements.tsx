const Announcements = () => {
  return (
    <div className="bg-white p-4 rounded-md text-gray-900">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Announcements</h1>
        <span className="text-xs text-gray-900">View All</span>
      </div>
      <div className="flex flex-col gap-4 mt-4">
        <div className="bg-ZekBlueLight rounded-md p-4 ">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Lorem ipsum dolor sit</h2>
            <span className="text-xs text-gray-700 bg-white rounded-md px-1 py-1">
              2025-01-01
            </span>
          </div>
          <p className="text-sm text-gray-700 mt-1">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum,
            expedita. Rerum, quidem facilis?
          </p>
        </div>
        <div className="bg-ZekPurpleLight rounded-md p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Lorem ipsum dolor sit</h2>
            <span className="text-xs text-gray-700 bg-white rounded-md px-1 py-1">
              2025-01-01
            </span>
          </div>
          <p className="text-sm text-gray-700 mt-1">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum,
            expedita. Rerum, quidem facilis?
          </p>
        </div>
        <div className="bg-ZekBlueLight rounded-md p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Lorem ipsum dolor sit</h2>
            <span className="text-xs text-gray-700 bg-white rounded-md px-1 py-1">
              2025-01-01
            </span>
          </div>
          <p className="text-sm text-gray-700 mt-1">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum,
            expedita. Rerum, quidem facilis?
          </p>
        </div>
      </div>
    </div>
  );
};

export default Announcements;