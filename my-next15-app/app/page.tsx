import Hero from "../components/Hero";
import VerifySuite from "../components/VerifySuite";
import SocialFeed from "../components/SocialFeed";

export default function Home() {
  return (
    <div className="font-sans min-h-screen bg-black">
      <Hero />
      <VerifySuite />
      <SocialFeed />
    </div>
  );
}
