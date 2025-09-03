"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Brain,
  Video,
  MessageSquare,
  Building2,
  FileText,
  Sparkles,
  ShieldCheck,
  Mic,
  ChevronRight,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6 } },
};

export default function Home() {
  const { data: session } = useSession();
  const isAuthed = Boolean(session?.user);

  return (
    <main className="relative">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/20 dark:to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-600/10 text-blue-700 dark:text-blue-300 px-3 py-1 text-xs font-medium ring-1 ring-inset ring-blue-600/20">
              <Sparkles className="h-3.5 w-3.5" />
              AI Interview Platform
            </span>
            <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              HireIQ — Your AI-powered Interview Assistant
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              Practice interviews, analyze feedback, and land jobs faster.
              Create roles, run structured AI interviews, and review insights in
              real-time.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {isAuthed ? (
                <>
                  <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <Link href="/companies">
                      Go to Dashboard
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/job/new">Post a Job</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <Link href="/signup">
                      Get Started
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/login">Sign in</Link>
                  </Button>
                </>
              )}
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeIn}
            className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Card className="border-blue-100 dark:border-blue-900/50 cursor-pointer hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Video className="h-4 w-4 text-blue-600" />
                    Mock Interviews
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 dark:text-gray-300">
                  Conduct structured AI-led interviews with live QnA.
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Card className="border-blue-100 dark:border-blue-900/50 cursor-pointer hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Brain className="h-4 w-4 text-blue-600" />
                    Feedback Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 dark:text-gray-300">
                  Get instant, explainable feedback on each response.
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Card className="border-blue-100 dark:border-blue-900/50 cursor-pointer hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    Jobs & Companies
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 dark:text-gray-300">
                  Explore roles, manage postings, and track applications.
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Card className="border-blue-100 dark:border-blue-900/50 cursor-pointer hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                    Role-based Access
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 dark:text-gray-300">
                  Applicant and recruiter workflows with secure auth.
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-12 sm:py-16 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-2xl sm:text-3xl font-semibold tracking-tight"
          >
            Everything you need to nail your next interview
          </motion.h2>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: <FileText className="h-4 w-4 text-blue-600" />,
                title: "Resume Parsing",
                desc: "Upload resumes and auto-extract key skills.",
              },
              {
                icon: <MessageSquare className="h-4 w-4 text-blue-600" />,
                title: "Smart QnA",
                desc: "Context-aware questions for each role.",
              },
              {
                icon: <Mic className="h-4 w-4 text-blue-600" />,
                title: "Voice Ready",
                desc: "Speak your answers with live transcription.",
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      {f.icon}
                      {f.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {f.desc}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            variants={fadeUp}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href={isAuthed ? "/companies" : "/signup"}>
                {isAuthed ? "Open Companies" : "Create your free account"}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/companies">Browse Jobs</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-muted/30 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <motion.div
              whileHover={{ y: -2, scale: 1.01 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Card className="cursor-pointer hover:shadow-md transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="text-base">For Applicants</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>Practice interviews and get actionable feedback.</p>
                  <p>Track applications and improve responses.</p>
                  <Button asChild size="sm" className="mt-2">
                    <Link href={isAuthed ? "/companies" : "/signup"}>
                      Start practicing
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              whileHover={{ y: -2, scale: 1.01 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Card className="cursor-pointer hover:shadow-md transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="text-base">For Recruiters</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>Create roles, run interviews, and review analytics.</p>
                  <p>Hire faster with structured AI workflows.</p>
                  <Button asChild size="sm" variant="outline" className="mt-2">
                    <Link href={isAuthed ? "/job/new" : "/signup"}>
                      Post a role
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              whileHover={{ y: -2, scale: 1.01 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Card className="cursor-pointer hover:shadow-md transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="text-base">
                    Privacy & Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>Your data stays protected with role-based access.</p>
                  <p>We only use information to improve your experience.</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
