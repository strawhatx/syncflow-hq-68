import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  ArrowRight, 
  Database, 
  Zap, 
  Shield, 
  Code, 
  GitBranch, 
  Check,
  ArrowUpRight,
  Mail,
  Github,
  Terminal,
  Clock,
  Users
} from 'lucide-react';

const IndexPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { user } = useAuth();

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    // Here you would typically send the email to your backend
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
              <Database className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Syncflow</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How it works</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            {user ? (
              <Button asChild>
                <Link to="/syncs">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/auth">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary border border-primary/20">
              <Zap className="h-4 w-4" />
              Now in Beta
            </span>
          </div>
          
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Sync Airtable and Postgres
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              — both ways.
            </span>
          </h1>
          
          <p className="mb-8 text-xl text-muted-foreground max-w-2xl mx-auto">
            No Zapier. No cron jobs. No surprises.
            <br />
            Built for developers who want simple, reliable data sync.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="btn-gradient">
              Connect and sync your first table free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg">
              <Github className="mr-2 h-5 w-5" />
              View on GitHub
            </Button>
          </div>

          {/* Visual Demo */}
          <div className="relative mx-auto max-w-3xl">
            <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="p-6 rounded-xl border border-border bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
                  <div className="flex items-center justify-center w-12 h-12 bg-orange-500 rounded-lg mb-4 mx-auto">
                    <Database className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">Airtable</h3>
                  <p className="text-sm text-orange-700 dark:text-orange-300">Team workspace</p>
                </div>
                
                <div className="flex justify-center">
                  <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-full">
                    <ArrowRight className="h-6 w-6 text-primary-foreground animate-pulse" />
                  </div>
                </div>
                
                <div className="p-6 rounded-xl border border-border bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-lg mb-4 mx-auto">
                    <Database className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">PostgreSQL</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Production database</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-muted/50 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Built for developers who value simplicity
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need for reliable data synchronization, nothing you don't.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-card border border-border card-hover">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">2-Way Sync</h3>
              <p className="text-muted-foreground">
                Changes flow both directions automatically. Update in Airtable or Postgres — it just works.
              </p>
            </div>
            
            <div className="p-6 rounded-xl bg-card border border-border card-hover">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                <Terminal className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Schema Mapping</h3>
              <p className="text-muted-foreground">
                Visual field mapping with type conversion. Map Airtable columns to Postgres fields effortlessly.
              </p>
            </div>
            
            <div className="p-6 rounded-xl bg-card border border-border card-hover">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Secure by Default</h3>
              <p className="text-muted-foreground">
                Encrypted credentials, audit logs, and SOC 2 compliance. Your data stays safe.
              </p>
            </div>
            
            <div className="p-6 rounded-xl bg-card border border-border card-hover">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Real-time Sync</h3>
              <p className="text-muted-foreground">
                Near-instant synchronization with intelligent conflict resolution and retry logic.
              </p>
            </div>
            
            <div className="p-6 rounded-xl bg-card border border-border card-hover">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                <Code className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Developer API</h3>
              <p className="text-muted-foreground">
                REST API, webhooks, and SDKs. Integrate Syncflow into your existing workflows.
              </p>
            </div>
            
            <div className="p-6 rounded-xl bg-card border border-border card-hover">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                <GitBranch className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Version Control</h3>
              <p className="text-muted-foreground">
                Track configuration changes like code. Rollback, compare, and deploy with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Three steps to sync everything
            </h2>
            <p className="text-xl text-muted-foreground">
              Get up and running in under 5 minutes
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-full mx-auto mb-6">
                <span className="text-2xl font-bold text-primary-foreground">1</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Connect</h3>
              <p className="text-muted-foreground">
                Link your Airtable base and PostgreSQL database. We support Supabase, RDS, and self-hosted instances.
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-full mx-auto mb-6">
                <span className="text-2xl font-bold text-primary-foreground">2</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Map</h3>
              <p className="text-muted-foreground">
                Visual field mapping interface. Match Airtable columns to database fields with type conversion and validation.
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-full mx-auto mb-6">
                <span className="text-2xl font-bold text-primary-foreground">3</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Sync</h3>
              <p className="text-muted-foreground">
                Choose sync direction and frequency. Your data stays in sync automatically, with full audit trails.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-muted/50 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-muted-foreground">
              Start free, scale as you grow
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="p-8 rounded-xl bg-card border border-border">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">Free</h3>
                <p className="text-muted-foreground">Perfect for trying out Syncflow</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-emerald-500 mr-3" />
                  <span className="text-foreground">1 project</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-emerald-500 mr-3" />
                  <span className="text-foreground">1 sync table</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-emerald-500 mr-3" />
                  <span className="text-foreground">1,000 rows/month</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-emerald-500 mr-3" />
                  <span className="text-foreground">Community support</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full" size="lg">
                Get Started Free
              </Button>
            </div>
            
            <div className="p-8 rounded-xl bg-card border-2 border-primary relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">Pro</h3>
                <p className="text-muted-foreground">For growing teams and projects</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">$49</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-emerald-500 mr-3" />
                  <span className="text-foreground">Unlimited projects</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-emerald-500 mr-3" />
                  <span className="text-foreground">Unlimited sync tables</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-emerald-500 mr-3" />
                  <span className="text-foreground">100,000 rows/month</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-emerald-500 mr-3" />
                  <span className="text-foreground">Priority support</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-emerald-500 mr-3" />
                  <span className="text-foreground">Advanced webhooks</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-emerald-500 mr-3" />
                  <span className="text-foreground">Team collaboration</span>
                </li>
              </ul>
              <Button className="w-full btn-gradient" size="lg">
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Ready to keep your data in sync?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join developers who've eliminated data drift with Syncflow.
            </p>
            
            <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-8">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
              <Button
                type="submit"
                disabled={isSubmitted}
                className="btn-gradient"
                size="lg"
              >
                {isSubmitted ? (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    Added!
                  </>
                ) : (
                  <>
                    Get Early Access
                    <Mail className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
            
            <p className="text-sm text-muted-foreground">
              No spam. We'll only email you about important updates.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
                <Database className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Syncflow</span>
            </div>
            <div className="flex items-center space-x-6 text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Documentation</a>
              <a href="#" className="hover:text-foreground transition-colors">Support</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-muted-foreground">
            <p>&copy; 2025 Syncflow. Built for developers who value simplicity.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default IndexPage;