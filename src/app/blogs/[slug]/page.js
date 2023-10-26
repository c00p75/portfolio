import BlogPage from "@/components/blog/blog_page/BlogPage";
import {allBlogs} from "/.contentlayer/generated";
import '../globals.css';

export default function Page({ params }) {
  return (
    <BlogPage blog={allBlogs.find((blog) => blog._raw.flattenedPath === params.slug)} />
  );
};
