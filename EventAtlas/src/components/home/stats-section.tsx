"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, MapPin, Globe, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  {
    label: "Events",
    value: "1,000+",
    icon: Calendar,
    color: "bg-indigo-100 text-indigo-600",
  },
  {
    label: "Cities",
    value: "50+",
    icon: MapPin,
    color: "bg-purple-100 text-purple-600",
  },
  {
    label: "Countries",
    value: "15+",
    icon: Globe,
    color: "bg-blue-100 text-blue-600",
  },
  {
    label: "Users",
    value: "10,000+",
    icon: Users,
    color: "bg-pink-100 text-pink-600",
  },
];

export function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="w-full bg-slate-50 py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.label}
                className={cn(
                  "border-0 shadow-sm transition-all duration-500",
                  visible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0"
                )}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <CardContent className="flex items-center gap-4 p-6">
                  <div
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
                      stat.color
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {stat.value}
                    </p>
                    <p className="text-sm text-slate-500">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
