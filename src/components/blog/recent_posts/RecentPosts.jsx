import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { slug } from "github-slugger";

const RecentPosts = ({blogs, header}) => {
  return (
    <section className="d-flex flex-col align-items-start mt-5 pt-5">
      <div className="flex-center justify-content-between" style={{width: "100%"}}>
        <h1 className="fw-bold fs-1">{header}</h1>
        <Link href="/blogs/categories/all" className="simple-link">View all</Link>
      </div>
      <div className="blogs-container row">
        {blogs.map((blog, index) => (
          <article className="featured-blog position-relative d-flex flex-center p-3 my-3 overflow-hidden col-12 col-sm-6 col-md-4 col-xxl-3" key={`blog-${index+1}`}>
            <Link href={`/blogs/${slug(blog._raw.flattenedPath)}`} className="blog-post text-light d-flex flex-col">
              <div className="blog-img-container">
                <Image
                  src={blog.image.filePath.replace("../public", "")}
                  alt={blog.title}
                  placeholder="blur"
                  blurDataURL={blog.image.blurhashDataUrl}
                  className="blog-image rounded-1"
                  width={blog.image.width}
                  height={blog.image.height}
                  quality={100}
                  style={{objectFit: 'cover'}}
                />
              </div>  
              <div className="d-flex flex-column">
                <h2 className="text-capitalize tag-btn fw-medium border my-3 fs-6">
                  <Link href={`/blogs/categories/${slug(blog.tags[0])}`} className="flex-center p-3">{slug(blog.tags[0])}</Link>
                </h2>
                <h1 className="text-capitalize fw-semibold blog-title">
                  {blog.title}
                </h1>
                <span className="date-text">{format(new Date(blog.publishedAt), "MMM dd, yyyy")}</span>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}

export default RecentPosts;
