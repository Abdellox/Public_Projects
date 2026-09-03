"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { SITE_NAME } from "@/lib/constants";
import { ChevronDown, Mail, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "How do I create an event?",
    answer: "Sign up as an organizer, then navigate to your dashboard and click 'Create Event'. Fill in the details across our step-by-step form and submit for review.",
  },
  {
    question: "Is it free to use?",
    answer: "Yes! Browsing and attending events is completely free. Organizers can publish free events at no cost. Paid event listings may have a small fee.",
  },
  {
    question: "How do reminders work?",
    answer: "You can set reminders for any event. We'll notify you before the event starts so you never miss out on something you're interested in.",
  },
  {
    question: "Can I cancel my registration?",
    answer: "Yes, you can manage your registrations from your dashboard at any time.",
  },
];

function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Mail className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold">Message Sent!</h3>
          <p className="text-muted-foreground mt-2">
            We&apos;ll get back to you as soon as possible.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" rows={5} required />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}

function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {faqs.map((faq, i) => (
        <div key={i} className="border rounded-lg">
          <button
            className="w-full flex items-center justify-between p-4 text-left font-medium"
            onClick={() => setOpen(open === i ? null : i)}
          >
            {faq.question}
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                open === i && "rotate-180"
              )}
            />
          </button>
          {open === i && (
            <div className="px-4 pb-4 text-muted-foreground">
              {faq.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">Contact Us</h1>
          <p className="text-lg text-muted-foreground mt-4">
            Have questions? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div>
            <h2 className="text-2xl font-bold mb-6">Send a Message</h2>
            <ContactForm />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">hello@eventatlas.com</span>
              </div>
              <a
                href="#"
                className="flex items-center gap-3 text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="h-5 w-5" />
                <span>Twitter / X</span>
              </a>
            </div>
            <h2 className="text-2xl font-bold mb-6">FAQ</h2>
            <FAQAccordion />
          </div>
        </div>
      </section>
    </div>
  );
}
