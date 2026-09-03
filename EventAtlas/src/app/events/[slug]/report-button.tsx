"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReportButtonProps {
  eventId: string;
}

export function ReportButton({ eventId }: ReportButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleReport = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      await fetch(`/api/events/${eventId}/report`, { method: "POST" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" size="icon" onClick={handleReport} disabled={loading}>
      <Flag className="h-5 w-5" />
    </Button>
  );
}
