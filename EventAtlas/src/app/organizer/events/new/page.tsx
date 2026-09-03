"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { eventSchema } from "@/lib/validations";
import { CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react";

type EventForm = {
  title: string;
  category: string;
  shortDescription: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  timezone: string;
  country: string;
  city: string;
  venue: string;
  address: string;
  isFree: boolean;
  price: string;
  currency: string;
  ticketUrl: string;
  registrationUrl: string;
  ageRequirement: string;
  accessibility: string;
  indoorOutdoor: string;
  contactEmail: string;
};

const steps = [
  "Basic Info",
  "Date & Time",
  "Location",
  "Tickets",
  "Details",
];

export default function NewEventPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EventForm>({
    resolver: zodResolver(eventSchema),
    defaultValues: { isFree: true },
  });

  const isFree = watch("isFree");

  const onSubmit = async (data: EventForm) => {
    setLoading(true);
    setError("");

    try {
      const body = {
        ...data,
        price: data.isFree ? 0 : parseFloat(data.price),
        startDate: new Date(`${data.startDate}T${data.startTime}`).toISOString(),
        endDate: new Date(`${data.endDate}T${data.endTime}`).toISOString(),
      };

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json();
        setError(errData.error || "Failed to create event");
        return;
      }

      router.push("/organizer/events");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Create New Event</h1>

      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className={cn(
                "h-2 flex-1 rounded-full transition-colors",
                i <= step ? "bg-blue-600" : "bg-muted"
              )}
            />
            <span className="text-xs text-muted-foreground whitespace-nowrap">{s}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{steps[step]}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (step === steps.length - 1) {
                handleSubmit(onSubmit)(e);
              } else {
                nextStep();
              }
            }}
            className="space-y-4"
          >
            {step === 0 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" {...register("title")} />
                  {errors.title && <p className="text-sm text-red-500">{String(errors.title?.message)}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    {...register("category")}
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((cat: any) => (
                      <option key={cat.slug} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Input id="shortDescription" {...register("shortDescription")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Full Description</Label>
                  <Textarea id="description" rows={5} {...register("description")} />
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input id="startDate" type="date" {...register("startDate")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input id="startTime" type="time" {...register("startTime")} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input id="endDate" type="date" {...register("endDate")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input id="endTime" type="time" {...register("endTime")} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <select
                    id="timezone"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    {...register("timezone")}
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Berlin">Berlin</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                  </select>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" {...register("country")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" {...register("city")} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="venue">Venue Name</Label>
                  <Input id="venue" {...register("venue")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" {...register("address")} />
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={isFree}
                      onChange={() => setValue("isFree", true)}
                    />
                    Free Event
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={!isFree}
                      onChange={() => setValue("isFree", false)}
                    />
                    Paid Event
                  </label>
                </div>
                {!isFree && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price</Label>
                      <Input id="price" type="number" step="0.01" {...register("price")} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <select
                        id="currency"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        {...register("currency")}
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="ticketUrl">Ticket URL</Label>
                  <Input id="ticketUrl" type="url" {...register("ticketUrl")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationUrl">Registration URL</Label>
                  <Input id="registrationUrl" type="url" {...register("registrationUrl")} />
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="ageRequirement">Age Requirement</Label>
                  <select
                    id="ageRequirement"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    {...register("ageRequirement")}
                  >
                    <option value="all">All Ages</option>
                    <option value="18+">18+</option>
                    <option value="21+">21+</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accessibility">Accessibility Info</Label>
                  <Input id="accessibility" {...register("accessibility")} />
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" value="indoor" {...register("indoorOutdoor")} />
                    Indoor
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" value="outdoor" {...register("indoorOutdoor")} />
                    Outdoor
                  </label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input id="contactEmail" type="email" {...register("contactEmail")} />
                </div>
              </>
            )}

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={prevStep} disabled={step === 0}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              {step < steps.length - 1 ? (
                <Button type="submit">
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Event"
                  )}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
