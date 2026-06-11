import Hero from "@/components/Hero";
import Brands from "@/components/Brands";
import HowItWorks from "@/components/HowItWorks";
import WatchFor from "@/components/WatchFor";
import TrustedBy from "@/components/TrustedBy";
import Alerts from "@/components/Alerts";
import Download from "@/components/Download";
import Faq from "@/components/Faq";
import RequestForm from "@/components/RequestForm";

export default function Home() {
  return (
    <>
      <Hero />
      <Brands />
      <HowItWorks />
      <WatchFor />
      <TrustedBy />
      <Alerts />
      <Download />
      <Faq />
      <RequestForm />
    </>
  );
}
