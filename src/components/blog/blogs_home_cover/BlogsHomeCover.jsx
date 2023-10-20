import Image from "next/image";
import "./blogsHomeCover.css";
import Link from "next/link";
import { format } from "date-fns";

const BlogsHomeCover = ({blog}) => {
  return (
    <article className="cover-blog-container border border-secondary position-relative d-flex flex-center rounded-4 overflow-hidden">
      <div className="cover-blog-overlay" />
      <Link href="#" className="cover-blog-link position-absolute text-light z-1 d-flex flex-column justify-content-end p-5">
        <h2 className="text-capitalize tag-btn fw-semibold border fs-5">
          <Link href={`blogs/categories/${blog.tags[0]}`} className="flex-center p-3">{blog.tags[0]}</Link>
        </h2>
        <h1 className="text-capitalize fw-bolder">
          {blog.title}
        </h1>
        <p>{blog.description}</p>  
        <span className="date-text">{format(new Date(blog.publishedAt), "MMM dd, yyyy")}</span>      
      </Link>
      <Image
        src={blog.image.filePath.replace("../public", "")}
        alt={blog.title}
        placeholder="blur"
        blurDataURL={blog.image.blurhashDataUrl}
        className="cover-image"
        fill
        quality={100}
        style={{objectFit: 'cover'}}
      />
    </article>
  )
};

export default BlogsHomeCover;
