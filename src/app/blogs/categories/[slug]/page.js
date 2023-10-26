import BlogPage from "@/components/blog/blog_page/BlogPage";
import {allBlogs} from "/.contentlayer/generated";

export default function CategoryPage({ params }) {
  return (
    // <BlogPage blog={allBlogs.find((blog) => blog._raw.flattenedPath === params.slug)} />
    <div>Category Name: {params.slug} </div>
  );
};
