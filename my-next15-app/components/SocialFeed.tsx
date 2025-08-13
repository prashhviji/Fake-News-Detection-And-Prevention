"use client";

import { useState } from "react";

type Post = {
  id: string;
  user: { name: string; handle: string; avatar: string };
  image: string;
  caption: string;
  likes: number;
  time: string;
};

const MOCK_POSTS: Post[] = [
  {
    id: "1",
    user: { name: "Sociaguard", handle: "@sociaguard", avatar: "/vercel.svg" },
    image: "https://images.unsplash.com/photo-1522199710521-72d69614c702?q=80&w=1400&auto=format&fit=crop",
    caption: "Election claims fact-check: quick breakdown and sources linked.",
    likes: 128,
    time: "2h",
  },
  {
    id: "2",
    user: { name: "Trusted News", handle: "@trustednews", avatar: "/globe.svg" },
    image: "https://images.unsplash.com/photo-1495562569060-2eec283d3391?q=80&w=1400&auto=format&fit=crop",
    caption: "Context matters. Reverse-searched images can reveal original sources.",
    likes: 312,
    time: "5h",
  },
  {
    id: "3",
    user: { name: "Fact Lab", handle: "@factlab", avatar: "/file.svg" },
    image: "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?q=80&w=1400&auto=format&fit=crop",
    caption: "How to spot framing manipulation in video clips.",
    likes: 87,
    time: "1d",
  },
  {
    id: "4",
    user: { name: "Analyst", handle: "@analyst", avatar: "/window.svg" },
    image: "https://images.unsplash.com/photo-1543286386-2e659306cd6c?q=80&w=1400&auto=format&fit=crop",
    caption: "Weekly trends: health myths declining, finance scams rising.",
    likes: 204,
    time: "2d",
  },
];

export default function SocialFeed() {
  return (
    <section className="bg-black py-16 text-white">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold">Feed</h2>
            <p className="text-sm text-white/60">Recent posts and content checks</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_POSTS.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const likes = post.likes + (liked ? 1 : 0);

  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
      <header className="flex items-center justify-between gap-3 p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white/10">
            <img src={post.user.avatar} alt="avatar" className="h-5 w-5 object-contain" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-medium text-white/90">{post.user.name}</div>
            <div className="text-xs text-white/60">{post.user.handle} • {post.time}</div>
          </div>
        </div>
        <button className="rounded-md p-1.5 text-white/60 hover:bg-white/10 hover:text-white/90" aria-label="More">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <circle cx="5" cy="12" r="2"></circle>
            <circle cx="12" cy="12" r="2"></circle>
            <circle cx="19" cy="12" r="2"></circle>
          </svg>
        </button>
      </header>

      <div className="relative bg-black" style={{ aspectRatio: 1 }}>
        <img
          src={post.image}
          alt="post"
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="p-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setLiked((v) => !v)}
              className={`rounded-md p-1.5 transition-colors ${liked ? "text-red-400" : "text-white/80 hover:bg-white/10 hover:text-white"}`}
              aria-label="Like"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
            <button className="rounded-md p-1.5 text-white/80 hover:bg-white/10 hover:text-white" aria-label="Comment">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"></path>
              </svg>
            </button>
            <button className="rounded-md p-1.5 text-white/80 hover:bg-white/10 hover:text-white" aria-label="Share">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <path d="M8.59 13.51l6.83 3.98"></path>
                <path d="M15.41 6.51L8.59 10.49"></path>
              </svg>
            </button>
          </div>
          <button
            onClick={() => setSaved((v) => !v)}
            className={`rounded-md p-1.5 transition-colors ${saved ? "text-white" : "text-white/80 hover:bg-white/10 hover:text-white"}`}
            aria-label="Save"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"></path>
            </svg>
          </button>
        </div>

        <div className="text-sm font-medium">{likes} likes</div>
        <div className="mt-1 text-sm">
          <span className="font-medium">{post.user.name}</span>{" "}
          <span className="text-white/90">{post.caption}</span>
        </div>
        <button className="mt-1 text-xs text-white/60 hover:text-white/80">View all comments</button>
        <div className="mt-1 text-[11px] uppercase tracking-wide text-white/50">{post.time} ago</div>

        <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3">
          <input
            placeholder="Add a comment..."
            className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-xs text-white placeholder-white/40 outline-none focus:border-white/30"
          />
          <button className="text-xs font-medium text-white/70 hover:text-white">Post</button>
        </div>
      </div>
    </article>
  );
}


