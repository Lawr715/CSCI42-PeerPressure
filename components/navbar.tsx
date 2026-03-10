// Will transfer to components later, unsure how root is defined in javascript

import Image from "next/image"

export function Navbar() {
  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-[#780000] text-[#E9DABB]">
      <div>
        <h1 className="text-xl font-bold m-0">Peer Pressure</h1>
      </div>

      <div className="flex items-center gap-5">
        <h2 className="text-base cursor-pointer hover:text-gray-700 transition-colors">
          Task List
        </h2>
        <h2 className="text-base cursor-pointer hover:text-gray-700 transition-colors">
          Pomodoro Timer
        </h2>
        <h2 className="text-base cursor-pointer hover:text-gray-700 transition-colors">
          Schedule Meeting
        </h2>
        <h2 className="text-base cursor-pointer hover:text-gray-700 transition-colors">
          Weekly Report
        </h2>

        {/* Notification icon will change color later*/}
        <Image
          src="/images/notification.png"
          alt="notification"
          width={40}
          height={40}
          className="cursor-pointer"
        />
      </div>
    </nav>
  );
}