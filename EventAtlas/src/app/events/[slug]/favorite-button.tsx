"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FavoriteButtonProps {
  eventId: string;
}

export function FavoriteButton({ eventId }: FavoriteButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/favorite`, {
        method: isFavorited ? "DELETE" : "POST",
      });
      if (res.ok) {
        setIsFavorited(!isFavorited);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={isFavorited ? "destructive" : "outline"}
      size="icon"
      onClick={handleToggle}
      disabled={loading}
    >
      <Heart className={`h-5 w-5 ${isFavorited ? "fill-current" : ""}`} />
    </Button>
  );
}
