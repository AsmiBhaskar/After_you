import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, Link2, Lock, Shield } from "lucide-react";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Header */}
      <header className="relative z-10">
        <div className="container mx-auto px-6 py-6 flex items-center justify-between">
          <Link to="/" className="font-serif text-2xl text-foreground">
            AfterYou
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-full"
            >
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 md:pt-32 md:pb-48">
        {/* Background elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-breathe" />
          <div
            className="absolute bottom-20 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-breathe"
            style={{ animationDelay: "2s" }}
          />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-stagger">
            {/* Tagline */}
            <p className="text-primary font-medium tracking-widest uppercase text-sm mb-6">
              A legacy platform
            </p>

            {/* Main heading */}
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-foreground leading-tight mb-8 text-balance">
              Our words should outlive our silence
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-12 leading-relaxed">
              Write messages now, to be delivered after you're gone. A love
              letter to the future. A vessel for memory. A bridge between
              presence and absence.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="rounded-full px-8 group">
                <Link to="/register">
                  Begin Your Legacy
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="rounded-full"
              >
                <Link to="/about">Learn More</Link>
              </Button>
            </div>
          </div>

          {/* Floating envelope illustration */}
          <div className="relative mt-20 max-w-2xl mx-auto">
            <div className="aspect-video rounded-2xl bg-card shadow-envelope overflow-hidden animate-float">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent" />
              <div className="h-full flex items-center justify-center p-12">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                  <p className="font-serif text-xl text-muted-foreground italic">
                    "To my beloved, when the time comes..."
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground/60">
                    <span>Scheduled for delivery</span>
                    <span>•</span>
                    <span>December 25, 2030</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
              Leave behind what matters
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              More than messages — a complete digital legacy for those you love.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Feature 1 */}
            <div className="letter-card text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Mail className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-serif text-xl mb-3">Legacy Messages</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Write heartfelt messages to be delivered at the right moment —
                on a birthday, anniversary, or when you're no longer here.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="letter-card text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Link2 className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-serif text-xl mb-3">Legacy Chains</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Start a message that can be passed forward through generations,
                creating a chain of wisdom and love across time.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="letter-card text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Lock className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-serif text-xl mb-3">Digital Locker</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Store important credentials and information safely, to be
                accessed by your trusted inheritor when needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
                Simple, thoughtful, secure
              </h2>
              <p className="text-muted-foreground">
                Your legacy is protected by a gentle, respectful system.
              </p>
            </div>

            <div className="space-y-12">
              {/* Step 1 */}
              <div className="flex gap-8 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-serif text-xl text-primary">
                  1
                </div>
                <div>
                  <h3 className="font-serif text-xl mb-2">
                    Write your messages
                  </h3>
                  <p className="text-muted-foreground">
                    Pour your heart into letters for your loved ones. Schedule
                    them for specific dates or let our Dead Man's Switch ensure
                    delivery when you're gone.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-8 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-serif text-xl text-primary">
                  2
                </div>
                <div>
                  <h3 className="font-serif text-xl mb-2">
                    Check in periodically
                  </h3>
                  <p className="text-muted-foreground">
                    A gentle reminder will ask you to confirm you're still here.
                    Miss a check-in, and after a grace period, your messages
                    will be delivered.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-8 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-serif text-xl text-primary">
                  3
                </div>
                <div>
                  <h3 className="font-serif text-xl mb-2">
                    Your words live on
                  </h3>
                  <p className="text-muted-foreground">
                    Your messages arrive exactly when needed — bringing comfort,
                    guidance, or a final word of love to those who matter most.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-8">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-6">
              Your privacy is sacred
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              We treat your messages with the reverence they deserve. End-to-end
              encryption ensures only your intended recipients will ever read
              your words. Your legacy is yours alone.
            </p>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/security">Learn About Our Security</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/15 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-5xl text-foreground mb-6">
              Begin your legacy today
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              Some words are too important to leave unsaid.
            </p>
            <Button asChild size="lg" className="rounded-full px-10 group">
              <Link to="/register">
                Start Writing
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl text-foreground">
                AfterYou
              </span>
              <span className="text-muted-foreground text-sm">
                © {new Date().getFullYear()}
              </span>
            </div>
            <nav className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link
                to="/about"
                className="hover:text-foreground transition-colors"
              >
                About
              </Link>
              <Link
                to="/privacy"
                className="hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                className="hover:text-foreground transition-colors"
              >
                Terms
              </Link>
              <Link
                to="/contact"
                className="hover:text-foreground transition-colors"
              >
                Contact
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
