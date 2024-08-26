import { cn } from "@/lib/utils";
import { Globe, Lock } from "lucide-react";

const StatusBadge = ({
  status,
  className,
}: {
  status: string | undefined;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "rounded-full w-3 h-3 overflow-hidden flex items-center justify-center",
        {
          "bg-green-500": status === "chat",
          "bg-yellow-500": status === "away",
          "bg-red-500": status === "dnd" || status === "xa" || status === "new",
          "bg-gray-500":
            status === "unknown" || status === "offline" || !status,
          "bg-transparent": status === "private" || status === "public",
        },
        className
      )}
    >
      {status === "dnd" && <div className="w-full bg-white h-1" />}
      {(status === "unknown" || status === "offline" || !status) && (
        <div className="w-1.5 h-1.5 rounded-full bg-muted" />
      )}
      {status === "private" && (
        <Lock className="text-muted-foreground w-full h-full fill-muted" />
      )}
      {status === "public" && (
        <Globe className="text-muted-foreground w-full h-full fill-muted" />
      )}
      {status === "new" && (
        <div className="w-1.5 h-1.5 rounded-full bg-white/90" />
      )}
    </div>
  );
};

export default StatusBadge;
