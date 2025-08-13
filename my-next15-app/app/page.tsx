import Hero from "../components/Hero";
import SocialFeed from "../components/SocialFeed";

export default function Home() {
  return (
    <div className="font-sans min-h-screen bg-black">
      <Hero />
      <SocialFeed />
    </div>
  );
}
