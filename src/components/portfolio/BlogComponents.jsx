'use client'
import { sectionObserver, visibilityObserver } from "@/utils/observer";
import { useContext, useEffect } from "react";
import {allBlogs} from "/.contentlayer/generated";
import BlogsHomeCover from "@/components/blog/blogs_home_cover/BlogsHomeCover";
import { ThemeContext } from "@/app/theme-provider";
import FeaturedBlogs from "@/components/blog/featured_blogs/FeaturedBlogs";
import { sortBlogs } from "@/utils";
import RecentPosts from "@/components/blog/recent_posts/RecentPosts";

export default function BlogComponents() {
  const { darkMode } = useContext(ThemeContext);
  useEffect(() => {
    setTimeout(() => {
      const sections = document.querySelectorAll('section');
      const sectionMark = document.querySelectorAll('.current-section');
      visibilityObserver(sections, 0.1);
      sectionObserver(sectionMark);
    }, 1000);
  });

  const sortedBlogs = sortBlogs(allBlogs);
  return (
    <section className="flex-center" id={darkMode ? 'dark' : 'light'} style={{opacity: "1"}}>
      <main className="container flex-center flex-col">
        <span className="current-section" id="current-section-blog" />
        <BlogsHomeCover blog={sortedBlogs[0]} />
        <FeaturedBlogs blogs={sortedBlogs} />
        <RecentPosts blogs={sortedBlogs.slice(1,6)} header={"Recent posts"} />
      </main>
    </section>
  )
}
