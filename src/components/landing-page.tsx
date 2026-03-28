import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Zap, BrainCircuit, Target } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function LandingPage() {
  const features = [
    {
      icon: <Zap className="h-8 w-8" />,
      title: 'Instant Test Generation',
      description: 'Define your exam, subject, and difficulty. Our AI creates a unique mock test for you in seconds.',
    },
    {
      icon: <BrainCircuit className="h-8 w-8" />,
      title: 'Smart Feedback',
      description: 'Get detailed, AI-powered explanations for every answer to understand concepts, not just memorize.',
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: 'Personalized Study Plan',
      description: 'Our system analyzes your results to identify weak spots and suggests focused topics for improvement.',
    },
  ];

  const heroImage = PlaceHolderImages.find(p => p.id === "hero-image");

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <main className="flex-1">
        <section className="relative w-full pt-24 md:pt-32 lg:pt-40 pb-12 md:pb-24 lg:pb-32 overflow-hidden">
          <div className="absolute top-0 left-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(29,78,216,0.15),rgba(255,255,255,0))]"></div>
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-6 text-center animate-in fade-in slide-in-from-top-12 duration-1000 ease-out">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-headline bg-clip-text text-transparent bg-gradient-to-r from-primary to-foreground/80 leading-tight">
                  Master Your Competitive Exams with AI
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Vidyarthi Vista is your AI co-pilot for mastering Indian government exams. Generate endless mock tests, receive personalized feedback, and conquer your goals.
                </p>
              </div>
              <div className="flex flex-col gap-4 min-[400px]:flex-row">
                <Button asChild size="lg" className="shadow-lg shadow-primary/30 transition-transform duration-300 hover:scale-105">
                  <Link href="/test/new">
                    Create Your First Test
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="lg" className="transition-transform duration-300 hover:scale-105">
                  <Link href="/history">View My History</Link>
                </Button>
              </div>
            </div>
             {heroImage && (
                <div className="relative mt-16 flex items-center justify-center animate-in fade-in zoom-in-95 duration-1000 ease-out delay-300">
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10"></div>
                     <Image
                        src={heroImage.imageUrl}
                        alt={heroImage.description}
                        width={800}
                        height={450}
                        className="rounded-2xl object-cover border shadow-2xl shadow-primary/10 transition-transform duration-500 hover:scale-105 hover:-rotate-1"
                        data-ai-hint={heroImage.imageHint}
                        priority
                    />
                </div>
              )}
          </div>
        </section>
        
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-secondary/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-primary/10 text-primary px-3 py-1 text-sm font-medium">Key Features</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">The Ultimate Prep Toolkit</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Go beyond simple practice. Our AI tools analyze your performance and guide you to success.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-stretch gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                 <div key={feature.title} className="animate-in fade-in slide-in-from-bottom-16 duration-1000 ease-out" style={{ animationDelay: `${300 + index * 200}ms`}}>
                    <Card className="h-full flex flex-col border-transparent shadow-md hover:shadow-xl hover:border-primary/30 hover:-translate-y-2 transition-all duration-300 bg-card/50 backdrop-blur-sm">
                        <CardHeader className="items-center text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-primary text-primary-foreground mb-4 shadow-lg shadow-primary/20">
                                {feature.icon}
                            </div>
                            <CardTitle className="text-xl font-headline">{feature.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center flex-1">
                            <p className="text-muted-foreground">{feature.description}</p>
                        </CardContent>
                    </Card>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">Ready to Elevate Your Preparation?</h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Stop guessing and start improving. Create a tailored mock test now and get the insights you need to succeed.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
                <Button asChild size="lg" className="w-full shadow-lg shadow-primary/30 transition-transform duration-300 hover:scale-105">
                    <Link href="/test/new">
                      Start a Free Mock Test Now
                       <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 Vidyarthi Vista. All rights reserved.</p>
      </footer>
    </div>
  );
}
