import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "icon";
};

export function Button({ variant = "outline", ...props }: ButtonProps) {
  const baseClass =
    "flex items-center justify-center h-7 border-[1.5px] bg-black text-white border-white px-2 py-0 text-lg leading-0";
  const variantClass =
    variant === "primary"
      ? "bg-white text-black"
      : variant === "icon"
        ? "w-7 bg-black text-white border border-white p-0"
        : "bg-black text-white border border-white";
  return <button className={cn(baseClass, variantClass)} {...props} />;
}
