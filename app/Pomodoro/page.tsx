import { MyButton } from "./button"
import { CountdownTimer } from "./countdownTimer"

import Image from "next/image";

export default function Home() {
  return (
    <div className="bg-sky-400">
    <div>Pomodoro Timer</div>
    <CountdownTimer />
    </div>
  );
}
