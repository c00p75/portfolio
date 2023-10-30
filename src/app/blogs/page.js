import BlogComponents from "@/components/portfolio/BlogComponents";
import "./globals.css";

export const metadata = {
  title: {
    template: `%s | George M'sapenda`,
    default: "George M'sapenda | Blogs",
  },
  description: `Learn about Web Development through my collection of blogs and tutorials.`,
};

export default function Blog() {
  return (
    <BlogComponents />
  )
}
