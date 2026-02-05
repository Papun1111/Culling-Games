import { cn } from "@/lib/utils";

export const Input = ({ value, onChange, placeholder, className, type = "text" }) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={cn(
        "w-full bg-[#0f0f0f] border border-[#333] text-gray-200 px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors",
        className
      )}
    />
  );
};