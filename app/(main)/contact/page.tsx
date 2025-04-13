"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card" // Removed unused Card sub-components
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin } from "lucide-react" // Removed Heart
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils" // Keep cn

// Fallback Texts
const fallbacks = {
    heroTitle: "Contact Us",
    heroSubtitle: "We'd love to hear from you. Reach out with questions, feedback, or partnership inquiries.",
    getInTouchTitle: "Get in Touch",
    getInTouchDesc: "Have questions or want to collaborate? Reach out to us!",
    emailTitle: "Email",
    emailValue: "info@lendingahelpingear.org",
    phoneTitle: "Phone",
    phoneValue: "+233 20 123 4567",
    addressTitle: "Address",
    addressLine1: "123 Education Street",
    addressLine2: "Accra, Ghana",
    sendMessageTitle: "Send a Message",
    sendMessageDesc: "Fill out the form below and we'll get back to you as soon as possible.",
    formFirstName: "First Name",
    formFirstNamePlaceholder: "John",
    formLastName: "Last Name",
    formLastNamePlaceholder: "Doe",
    formEmail: "Email",
    formEmailPlaceholder: "john@example.com",
    formSubject: "Subject",
    formSubjectPlaceholder: "How can we help you?",
    formMessage: "Message",
    formMessagePlaceholder: "Your message here...",
    formButton: "Send Message",
};


export default function ContactPage() {
  const { t, isLoading } = useLanguage(); // Use hook

  return (
    <>
      {/* Hero Section */}
      <section className="section-padding hero-bg">
        <div className="container px-4 md:px-6 relative max-w-screen-xl mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="heading-1 gradient-text-hero">
                {isLoading ? fallbacks.heroTitle : <span suppressHydrationWarning>{t("contact.title") ?? fallbacks.heroTitle}</span>}
              </h1>
              <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                {isLoading ? fallbacks.heroSubtitle : <span suppressHydrationWarning>{t("contact.subtitle") ?? fallbacks.heroSubtitle}</span>}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="section-padding content-bg-1">
        <div className="container px-4 md:px-6 max-w-screen-xl mx-auto">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
            {/* Get in Touch Section */}
            <div id="get-in-touch" className="space-y-6">
              <h2 className="heading-2 gradient-text-heading">
                {isLoading ? fallbacks.getInTouchTitle : <span suppressHydrationWarning>{t("contact.getInTouch.title") ?? fallbacks.getInTouchTitle}</span>}
              </h2>
              <p className="text-muted-foreground md:text-lg/relaxed">
                 {isLoading ? fallbacks.getInTouchDesc : <span suppressHydrationWarning>{t("contact.getInTouch.description") ?? fallbacks.getInTouchDesc}</span>}
              </p>
              <Card className="card-standard glass-card-content subtle-shadow shine-effect">
                <CardContent className="p-6 space-y-6">
                  {/* Email */}
                  <div className="flex items-start space-x-4">
                    <div className="bg-pink-100 p-3 rounded-lg flex-shrink-0 glow-primary"><Mail className="h-5 w-5 text-pink-600" /></div>
                    <div>
                      <h3 className="font-medium text-base">{isLoading ? fallbacks.emailTitle : <span suppressHydrationWarning>{t("contact.email.title") ?? fallbacks.emailTitle}</span>}</h3>
                      <a href={`mailto:${isLoading ? fallbacks.emailValue : t("contact.email.value") ?? fallbacks.emailValue}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        {isLoading ? fallbacks.emailValue : <span suppressHydrationWarning>{t("contact.email.value") ?? fallbacks.emailValue}</span>}
                      </a>
                    </div>
                  </div>
                  {/* Phone */}
                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-100 p-3 rounded-lg flex-shrink-0 glow-purple"><Phone className="h-5 w-5 text-purple-600" /></div>
                    <div>
                      <h3 className="font-medium text-base">{isLoading ? fallbacks.phoneTitle : <span suppressHydrationWarning>{t("contact.phone.title") ?? fallbacks.phoneTitle}</span>}</h3>
                      <a href={`tel:${isLoading ? fallbacks.phoneValue : t("contact.phone.value") ?? fallbacks.phoneValue}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                         {isLoading ? fallbacks.phoneValue : <span suppressHydrationWarning>{t("contact.phone.value") ?? fallbacks.phoneValue}</span>}
                      </a>
                    </div>
                  </div>
                   {/* Address */}
                   <div className="flex items-start space-x-4">
                     <div className="bg-indigo-100 p-3 rounded-lg flex-shrink-0 glow-purple"><MapPin className="h-5 w-5 text-indigo-600" /></div>
                     <div>
                       <h3 className="font-medium text-base">{isLoading ? fallbacks.addressTitle : <span suppressHydrationWarning>{t("contact.address.title") ?? fallbacks.addressTitle}</span>}</h3>
                       <p className="text-sm text-muted-foreground">
                         {isLoading ? fallbacks.addressLine1 : <span suppressHydrationWarning>{t("contact.address.line1") ?? fallbacks.addressLine1}</span>}<br />
                         {isLoading ? fallbacks.addressLine2 : <span suppressHydrationWarning>{t("contact.address.line2") ?? fallbacks.addressLine2}</span>}
                       </p>
                     </div>
                   </div>
                </CardContent>
              </Card>
            </div>

             {/* Send Message Section */}
            <div id="send-message" className="space-y-6">
              <h2 className="heading-2 gradient-text-heading">
                {isLoading ? fallbacks.sendMessageTitle : <span suppressHydrationWarning>{t("contact.sendMessage.title") ?? fallbacks.sendMessageTitle}</span>}
              </h2>
              <p className="text-muted-foreground md:text-lg/relaxed">
                {isLoading ? fallbacks.sendMessageDesc : <span suppressHydrationWarning>{t("contact.sendMessage.description") ?? fallbacks.sendMessageDesc}</span>}
              </p>
              <Card className="card-standard glass-card-content subtle-shadow prismatic-glow">
                <CardContent className="p-6">
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="first-name" className="text-sm font-medium">{isLoading ? fallbacks.formFirstName : <span suppressHydrationWarning>{t("contact.form.firstName") ?? fallbacks.formFirstName}</span>}</Label>
                        <Input id="first-name" placeholder={isLoading ? fallbacks.formFirstNamePlaceholder : t("contact.form.firstName.placeholder") ?? fallbacks.formFirstNamePlaceholder} className="rounded-md" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="last-name" className="text-sm font-medium">{isLoading ? fallbacks.formLastName : <span suppressHydrationWarning>{t("contact.form.lastName") ?? fallbacks.formLastName}</span>}</Label>
                        <Input id="last-name" placeholder={isLoading ? fallbacks.formLastNamePlaceholder : t("contact.form.lastName.placeholder") ?? fallbacks.formLastNamePlaceholder} className="rounded-md" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-sm font-medium">{isLoading ? fallbacks.formEmail : <span suppressHydrationWarning>{t("contact.form.email") ?? fallbacks.formEmail}</span>}</Label>
                      <Input id="email" placeholder={isLoading ? fallbacks.formEmailPlaceholder : t("contact.form.email.placeholder") ?? fallbacks.formEmailPlaceholder} type="email" className="rounded-md"/>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="subject" className="text-sm font-medium">{isLoading ? fallbacks.formSubject : <span suppressHydrationWarning>{t("contact.form.subject") ?? fallbacks.formSubject}</span>}</Label>
                      <Input id="subject" placeholder={isLoading ? fallbacks.formSubjectPlaceholder : t("contact.form.subject.placeholder") ?? fallbacks.formSubjectPlaceholder} className="rounded-md"/>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="message" className="text-sm font-medium">{isLoading ? fallbacks.formMessage : <span suppressHydrationWarning>{t("contact.form.message") ?? fallbacks.formMessage}</span>}</Label>
                      <Textarea id="message" placeholder={isLoading ? fallbacks.formMessagePlaceholder : t("contact.form.message.placeholder") ?? fallbacks.formMessagePlaceholder} className="min-h-[120px] rounded-md"/>
                    </div>
                    <Button type="submit" className="w-full btn-gradient"> {/* Primary */}
                       {isLoading ? fallbacks.formButton : <span suppressHydrationWarning>{t("contact.form.button") ?? fallbacks.formButton}</span>}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}