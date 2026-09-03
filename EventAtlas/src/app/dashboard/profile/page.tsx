"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { getInitials, formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ favorites: 0, registrations: 0 });

  useEffect(() => {
    Promise.all([
      fetch("/api/user/profile").then((r) => r.json()),
      fetch("/api/user/favorites").then((r) => r.json()),
      fetch("/api/user/registrations").then((r) => r.json()),
    ]).then(([profileData, favs, regs]) => {
      setProfile(profileData);
      setStats({ favorites: favs.length, registrations: regs.length });
    });
  }, []);

  if (!profile) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Profile</h1>
        <div className="border rounded-lg p-8 animate-pulse bg-muted h-48" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">My Profile</h1>

      <Card>
        <CardContent className="py-8">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{profile.name}</h2>
              <p className="text-muted-foreground">{profile.email}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Member since {formatDate(new Date(profile.createdAt))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="py-6 text-center">
            <p className="text-3xl font-bold">{stats.favorites}</p>
            <p className="text-muted-foreground">Favorites</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-6 text-center">
            <p className="text-3xl font-bold">{stats.registrations}</p>
            <p className="text-muted-foreground">Registrations</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
