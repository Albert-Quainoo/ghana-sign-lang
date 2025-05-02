"use client"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"

export default function AboutPage() {
  const { t } = useLanguage()

  return (
    <>
      <section className="section-padding hero-bg">
        <div className="container px-4 md:px-6 relative max-w-screen-xl mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="heading-1 gradient-text-hero">
                <span suppressHydrationWarning>{t("about.title")}</span>
              </h1>
              <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl/relaxed text-enhanced">
                <span suppressHydrationWarning>{t("about.subtitle")}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding content-bg-1">
        <div className="container px-4 md:px-6 max-w-screen-xl mx-auto">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4 lg:space-y-5">
              <h2 className="heading-2 gradient-text-heading">
                <span suppressHydrationWarning>{t("about.breakingBarriers.title")}</span>
              </h2>
              <p className="text-muted-foreground md:text-lg/relaxed text-enhanced">
                <span suppressHydrationWarning>{t("about.breakingBarriers.description")}</span>
              </p>
              <p className="text-muted-foreground text-base text-enhanced">
                <span suppressHydrationWarning>{t("about.breakingBarriers.content1")}</span>
              </p>
              <p className="text-muted-foreground text-base text-enhanced">
                <span suppressHydrationWarning>{t("about.breakingBarriers.content2")}</span>
              </p>
            </div>
            <div className="flex justify-center">
              <div className="relative w-full max-w-md mx-auto lg:max-w-lg">
                <div className="absolute -inset-2 gradient-artsy-2 rounded-2xl blur-lg opacity-75 rotate-3 prismatic-glow"></div>
                <Image
                  src="/placeholder.svg?height=400&width=600"
                  width={600}
                  height={400}
                  alt={t("about.breakingBarriers.imageAlt") || "Breaking barriers image"}
                  className="rounded-xl relative shadow-lg object-cover border-4 border-background rotate-3 w-full h-auto img-duotone-pink-purple"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding content-bg-2">
        <div className="container px-4 md:px-6 max-w-screen-xl mx-auto">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex justify-center order-2 lg:order-1">
              <div className="relative w-full max-w-md mx-auto lg:max-w-lg">
                <div className="absolute -inset-2 gradient-artsy-2 rounded-2xl blur-lg opacity-75 -rotate-3 prismatic-glow"></div>
                <Image
                  src="/placeholder.svg?height=400&width=600"
                  width={600}
                  height={400}
                  alt={t("about.team.imageAlt") || "Team image"}
                  className="rounded-xl relative shadow-lg object-cover border-4 border-background -rotate-3 w-full h-auto img-duotone-blue-purple"
                />
              </div>
            </div>
            <div className="space-y-4 lg:space-y-5 order-1 lg:order-2">
              <h2 className="heading-2 gradient-text-heading">
                <span suppressHydrationWarning>{t("about.team.heading")}</span>
              </h2>
              <p className="text-muted-foreground md:text-lg/relaxed text-enhanced">
                <span suppressHydrationWarning>{t("about.team.description")}</span>
              </p>
              <p className="text-muted-foreground text-base text-enhanced">
                <span suppressHydrationWarning>{t("about.team.content1")}</span>
              </p>
              <p className="text-muted-foreground text-base text-enhanced">
                <span suppressHydrationWarning>{t("about.team.content2")}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding cta-bg">
        <div className="container px-4 md:px-6 max-w-screen-xl mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2 max-w-3xl">
              <h2 className="heading-2 text-white">
                <span suppressHydrationWarning>{t("about.join.heading")}</span>
              </h2>
              <p className="max-w-[900px] text-white/80 md:text-xl/relaxed">
                <span suppressHydrationWarning>{t("about.join.description")}</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Link href="/learn" scroll={true} className="w-full sm:w-auto">
                  <Button size="lg" className="bg-white/90 text-purple-600 btn-gradient w-full sm:w-auto">
                    <span suppressHydrationWarning>{t("about.join.button1")}</span>
                  </Button>
                </Link>
                <Link href="/contact" scroll={true} className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="btn-outline prismatic-glow w-full sm:w-auto">
                    <span suppressHydrationWarning>{t("about.join.button2")}</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
