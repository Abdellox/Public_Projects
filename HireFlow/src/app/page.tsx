import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Building2, Zap, Users, Briefcase, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <section className="container py-20 md:py-32 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Find Your <span className="text-primary">Dream Job</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          HireFlow connects talented candidates with top companies. Search thousands of jobs, manage your hiring pipeline, and find the perfect match.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/jobs">Browse Jobs <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/register?role=COMPANY">For Companies</Link>
          </Button>
        </div>
      </section>

      <section className="container py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why HireFlow?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Search className="h-10 w-10 text-primary mb-2" />
              <CardTitle>For Candidates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Search and apply to thousands of jobs. Track your applications and get updates on your status.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Building2 className="h-10 w-10 text-primary mb-2" />
              <CardTitle>For Companies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Post jobs, review applications, and manage your entire hiring pipeline from one dashboard.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Smart Matching</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Our intelligent matching system helps connect the right candidates with the right opportunities.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container py-16 bg-muted/50 rounded-lg">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <Users className="h-8 w-8 mx-auto mb-3 text-primary" />
            <p className="text-3xl font-bold">10,000+</p>
            <p className="text-muted-foreground">Candidates</p>
          </div>
          <div>
            <Building2 className="h-8 w-8 mx-auto mb-3 text-primary" />
            <p className="text-3xl font-bold">500+</p>
            <p className="text-muted-foreground">Companies</p>
          </div>
          <div>
            <Briefcase className="h-8 w-8 mx-auto mb-3 text-primary" />
            <p className="text-3xl font-bold">2,000+</p>
            <p className="text-muted-foreground">Jobs Posted</p>
          </div>
        </div>
      </section>

      <section className="container py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-muted-foreground mb-8">Join thousands of professionals and companies on HireFlow.</p>
        <Button size="lg" asChild>
          <Link href="/register">Get Started Free <ArrowRight className="ml-2 h-5 w-5" /></Link>
        </Button>
      </section>
    </div>
  );
}
