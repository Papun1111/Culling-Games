import { cn } from "@/lib/utils";

export const Card = ({ children, className }) => {
  return (
    <div className={cn(
      "bg-[#1a1a1a] border border-[#333] rounded-xl p-5 shadow-xl backdrop-blur-sm", 
      className
    )}>
      {children}
    </div>
  );
};