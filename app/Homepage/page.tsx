"use client";

import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { useEffect } from "react";

export default function HomePage() {
 /* const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/Login"); 
    }
  }, [isPending, session, router]);

  if (isPending)
    return <p className="text-center mt-8 text-white">Loading...</p>;

  if (!session?.user)
    return <p className="text-center mt-8 text-white">Redirecting...</p>;

  const { user } = session;*/

  //Yo, {user.name || "User"}
  return (
    <main className="max-w-md h-screen flex items-center justify-center flex-col mx-auto p-6 space-y-6 text-white">
      <div className="w-full bg-[#CE2632] p-4 rounded-md text-center">
      <h1 className="text-3xl font-bold text-center text-[#E9DABB]"> Yo, {"User"} </h1>
      <h2 className="text-xl text-center  text-[#E9DABB]">Ready to Work?</h2>
      </div>
      {/* Placeholder for upcoming task */}
      <div className="w-full bg-gray-800 p-4 rounded-md text-center">
        <p className="font-medium">Next Upcoming Task:</p>
        <p className="text-gray-300 mt-2">No tasks yet.</p>
      </div>

      <button
        onClick={() => signOut()}
        className="w-full bg-white text-black font-medium rounded-md px-4 py-2 hover:bg-gray-200"
      > Log Out
      </button>

    </main>
  );
}