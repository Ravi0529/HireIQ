import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Github, Twitter, Mail, ShieldCheck, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background/80 supports-[backdrop-filter]:bg-background/60 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 select-none">
              <span className="text-xl font-bold tracking-tight text-blue-600">
                HireIQ
              </span>
              <Sparkles className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-powered interviews, structured feedback, and faster hiring.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Role-based access and privacy-first analytics</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/companies"
                  className="hover:text-foreground transition"
                >
                  Companies
                </Link>
              </li>
              <li>
                <Link
                  href="/job/new"
                  className="hover:text-foreground transition"
                >
                  Post a Job
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="hover:text-foreground transition"
                >
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">Get started</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/signup"
                  className="hover:text-foreground transition"
                >
                  Create account
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="hover:text-foreground transition"
                >
                  Sign in
                </Link>
              </li>
              <li>
                <Link
                  href="/companies"
                  className="hover:text-foreground transition"
                >
                  Browse jobs
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">Stay in touch</h3>
            <div className="flex items-center gap-2">
              <Button
                asChild
                variant="outline"
                size="icon"
                className="h-9 w-9"
                aria-label="GitHub"
              >
                <a href="https://github.com/Ravi0529/" target="_blank" rel="noreferrer">
                  <Github className="h-4 w-4" />
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="icon"
                className="h-9 w-9"
                aria-label="Twitter"
              >
                <a href="https://x.com/Ravidotexe/" target="_blank" rel="noreferrer">
                  <Twitter className="h-4 w-4" />
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="icon"
                className="h-9 w-9"
                aria-label="Email"
              >
                <a href="mailto:mistryravi051005@gmail.com">
                  <Mail className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} HireIQ. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition">
              Privacy
            </Link>
            <Link href="#" className="hover:text-foreground transition">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
