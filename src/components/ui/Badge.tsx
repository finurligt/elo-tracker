import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

type Color = "gray" | "green" | "red" | "indigo" | "yellow";

const colors: Record<Color, string> = {
  gray: "bg-gray-100 text-gray-700",
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  indigo: "bg-indigo-100 text-indigo-700",
  yellow: "bg-yellow-100 text-yellow-700",
};

export function Badge({
  color = "gray",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { color?: Color }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        colors[color],
        className
      )}
      {...props}
    />
  );
}
