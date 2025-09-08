import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  HelpCircle,
  ShieldCheck,
  Clock,
  UserPlus,
  KeyRound,
  PauseCircle,
} from "lucide-react";

const faqs = [
  {
    q: "How big can my file be?",
    a: "You can upload files up to 30GB per transfer. For larger files, you can split them into multiple uploads.",
    icon: <HelpCircle className="w-5 h-5 text-bolt-blue" />,
  },
  {
    q: "Is it secure?",
    a: "Yes! Files are encrypted with 256-bit AES encryption both during transfer and while stored on our servers. We use bank-level security protocols.",
    icon: <ShieldCheck className="w-5 h-5 text-bolt-purple" />,
  },
  {
    q: "How long are files stored?",
    a: "Files are automatically deleted after 30 days. You can also set custom expiry dates when uploading.",
    icon: <Clock className="w-5 h-5 text-bolt-cyan" />,
  },
  {
    q: "Do recipients need an account?",
    a: "No! Recipients only need the download link. No registration or account creation required.",
    icon: <UserPlus className="w-5 h-5 text-bolt-medium-black" />,
  },
  {
    q: "Can I protect my file with a password?",
    a: "Yes! You can add an optional password when uploading. Recipients will need this password to download the file.",
    icon: <KeyRound className="w-5 h-5 text-bolt-light-purple" />,
  },
  {
    q: "Can I pause/resume uploads?",
    a: "Yes! Our upload system supports resumable uploads. If your connection drops, you can continue from where you left off.",
    icon: <PauseCircle className="w-5 h-5 text-bolt-light-cyan" />,
  },
];

export function FaqSection() {
  return (
    <section className="py-10 lg:py-14 bg-slate-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-bolt-black mb-8 lg:mb-16">
          Frequently Asked Questions
        </h2>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-white border border-slate-200 rounded-2xl shadow-lg px-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <AccordionTrigger className="text-lg font-semibold text-bolt-black text-left hover:no-underline">
                  <div className="flex items-center space-x-3">
                    {faq.icon}
                    <span>{faq.q}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-base text-bolt-medium-black pt-2 pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}