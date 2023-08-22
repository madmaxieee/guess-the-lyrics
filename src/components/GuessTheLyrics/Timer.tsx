import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import { type ClassValue } from "clsx";

import { cn } from "@/utils/ui";

type CountDownProps = {
  className?: ClassValue;
  duration: number; // seconds
  running: boolean;
  onEnd?: () => void;
};

const Timer = forwardRef(
  ({ className, duration, running, onEnd }: CountDownProps, ref) => {
    const [time, setTime] = useState(duration);
    const intervalRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
      if (running) {
        if (intervalRef.current) return;
        intervalRef.current = setInterval(() => {
          if (time === 0) {
            onEnd?.();
            clearInterval(intervalRef.current);
            intervalRef.current = undefined;
          } else if (time > 0) {
            setTime((time) => time - 1);
          }
        }, 1000);
      } else {
        setTime(duration);
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    }, [running, duration, time, onEnd]);

    useImperativeHandle(
      ref,
      () => ({
        reset() {
          setTime(duration);
        },
      }),
      [setTime, duration]
    );

    return <p className={cn(className)}>{toTimeDisplay(time)}</p>;
  }
);

Timer.displayName = "Timer";

function toTimeDisplay(time: number) {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return [minutes, seconds].map((t) => t.toString().padStart(2, "0")).join(":");
}

export default Timer;
