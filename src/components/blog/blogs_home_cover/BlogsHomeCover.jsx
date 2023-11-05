import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { slug } from "github-slugger";

const BlogsHomeCover = ({blog}) => {
  return (
    <article className="cover-blog-container border rounded-4 border-secondary position-relative d-flex flex-center overflow-hidden" id="cover-blog">
      <Link href={`/blogs/${blog._raw.flattenedPath}`} className="cover-blog-link d-flex flex-col flex-lg-row">
        <div className="py-5 px-3 p-lg-5 pe-lg-4 cover-blog-text">
          <h2 className="text-capitalize tag-btn fw-semibold border fs-5">
            <Link href={`blogs/categories/${slug(blog.tags[0])}`} className="flex-center p-3">{blog.tags[0]}</Link>
          </h2>
          <h1 className="text-capitalize fw-bolder">
            {blog.title}
          </h1>
          <p>{blog.description}</p>  
          <span className="date-text">{format(new Date(blog.publishedAt), "MMM dd, yyyy")}</span>
        </div>  
        <div className="cover-img-container overflow-hidden">
          <Image
            src={blog.image.filePath.replace("../public", "")}
            alt={blog.title}
            placeholder="blur"
            blurDataURL={blog.image.blurhashDataUrl}
            className="cover-image position-relative col-6"
            fill
            quality={100}
            style={{objectFit: 'cover'}}
          />
        </div>
      </Link>
    </article>
  )
};

export default BlogsHomeCover;
