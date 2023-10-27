import BlogPage from "@/components/blog/blog_page/BlogPage";
import {allBlogs} from "/.contentlayer/generated";
import '../globals.css';
import siteMetadata from "@/utils/siteMetaData";

export async function generateStaticParams() {
  return allBlogs.map((blog) => ({slug: blog._raw.flattenedPath}));
}

export async function generateMetadata({ params }) {
  const blog = allBlogs.find((blog) => blog._raw.flattenedPath === params.slug);
  const publishDate = new Date(blog.publishedAt).toISOString();
  const modifiedAt = new Date(blog.updatedAt || blog.publishedAt).toISOString();
  let imageList = [siteMetadata.socialBanner]
  if(blog.image){
    imageList = typeof(blog.image.filePath) === "string" ?
      [siteMetadata.siteUrl + blog.image.filePath.replace("../public","")] :
      blog.image;
  }

  const ogImages = imageList.map((img) => {
    return { url: img.includes("http") ? img : siteMetadata.siteUrl + img }
  })
  if(!blog){ return };
  return {
    title: blog.title,
    description: blog.description,
    openGraph: {
      title: blog.title,
      description: blog.description,
      url: siteMetadata.siteUrl + blog.url,
      siteName: siteMetadata.title,
      locale: 'en_US',
      type: 'article',
      publishedTime: publishDate,
      modifiedTime: modifiedAt,
      images: ogImages,
      authors: [ siteMetadata.author ],
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.title,
      description: blog.description,
      images: ogImages,
    },
  }
}

export default function Page({ params }) {
  return (
    <BlogPage blog={allBlogs.find((blog) => blog._raw.flattenedPath === params.slug)} />
  );
};
