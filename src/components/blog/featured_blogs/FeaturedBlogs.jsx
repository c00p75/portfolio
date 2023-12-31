 import Link from "next/link";
import "./featuredBlogs.css";
import Image from "next/image";
import { format } from "date-fns";
import { slug } from "github-slugger";

const FeaturedBlogs = ({blogs}) => {
  const firstFeaturedBlog = blogs.find((blog) => blog.title === "3 pieces of advice I would give someone who’s just beginning their journey with software development");
  const secondFeaturedBlog = blogs.find((blog) => blog.title === 'why TypeScript?');
  const thirdFeaturedBlog = blogs.find((blog) => blog.title === 'Best Practices for SEO in Web Development');
  return (
    <section className="flex-col align-items-start" style={{width: "100%"}}>
      <h1 className="fw-bold fs-1 mb-4">Featured Posts</h1>
      <div className="row">
        <div className="col-12 col-md-6 mb-3 mb-md-0">
          <article className="cover-blog-container position-relative d-flex flex-center overflow-hidden" id="first-featured-blog">
            <div className="cover-blog-overlay" />
            <Link href={`blogs/${firstFeaturedBlog._raw.flattenedPath}`} className="cover-blog-link border text-light z-1 d-flex flex-column justify-content-end p-5">
              <h2 className="text-capitalize tag-btn fw-medium border fs-5">
                <Link href={`blogs/categories/${slug(firstFeaturedBlog.tags[0])}`} className="flex-center p-3">{firstFeaturedBlog.tags[0]}</Link>
              </h2>
              <h1 className="text-capitalize fw-bolder fs-4 my-3">
                {firstFeaturedBlog.title}
              </h1>
              <p>{firstFeaturedBlog.description}</p>
              <span className="date-text mt-2">{format(new Date(firstFeaturedBlog.publishedAt), "MMM dd, yyyy")}</span>
            </Link>
            <Image
              src={firstFeaturedBlog.image.filePath.replace("../public", "")}
              alt={firstFeaturedBlog.title}
              placeholder="blur"
              blurDataURL={firstFeaturedBlog.image.blurhashDataUrl}
              className="cover-image"
              fill
              quality={100}
              style={{objectFit: 'cover'}}
            />
          </article>
        </div>
        <div className="col-12 col-md-6 d-flex gap-3 flex-col justify-content-between">
          <article className="featured-blog row position-relative d-flex flex-center overflow-hidden">
            <Link href={`blogs/${secondFeaturedBlog._raw.flattenedPath}`} className="text-light d-flex">
              <Image
                src={secondFeaturedBlog.image.filePath.replace("../public", "")}
                alt={secondFeaturedBlog.title}
                placeholder="blur"
                blurDataURL={secondFeaturedBlog.image.blurhashDataUrl}
                className="feature-image flex-shrink-1 rounded-1"
                width={secondFeaturedBlog.image.width}
                height={secondFeaturedBlog.image.height}
                quality={100}
                style={{objectFit: 'cover'}}
              />

              <div className="d-flex flex-column p-3">
                <h2 className="text-capitalize tag-btn fw-medium border fs-6">
                  <Link href={`blogs/categories/${slug(secondFeaturedBlog.tags[0])}`} className="flex-center p-3">{secondFeaturedBlog.tags[0]}</Link>
                </h2>
                <h1 className="text-capitalize fw-semibold my-3">
                  {secondFeaturedBlog.title}
                </h1>
                <span className="date-text mt-2">{format(new Date(secondFeaturedBlog.publishedAt), "MMM dd, yyyy")}</span>
              </div>
            </Link>
          </article>
          
          <article className="featured-blog row position-relative d-flex flex-center overflow-hidden">
            <Link href={`blogs/${thirdFeaturedBlog._raw.flattenedPath}`} className="text-light d-flex">
              <Image
                src={thirdFeaturedBlog.image.filePath.replace("../public", "")}
                alt={thirdFeaturedBlog.title}
                placeholder="blur"
                blurDataURL={thirdFeaturedBlog.image.blurhashDataUrl}
                className="feature-image flex-shrink-1 rounded-1"
                width={thirdFeaturedBlog.image.width}
                height={thirdFeaturedBlog.image.height}
                quality={100}
                style={{objectFit: 'cover'}}
              />

              <div className="d-flex flex-column p-3">
                <h2 className="text-capitalize tag-btn fw-medium border fs-6">
                  <Link href={`blogs/categories/${slug(thirdFeaturedBlog.tags[0])}`} className="flex-center p-3">{thirdFeaturedBlog.tags[0]}</Link>
                </h2>
                <h1 className="text-capitalize fw-semibold my-3">
                  {thirdFeaturedBlog.title}
                </h1>
                <span className="date-text mt-2">{format(new Date(thirdFeaturedBlog.publishedAt), "MMM dd, yyyy")}</span>
              </div>
            </Link>
          </article>
        </div>
      </div>
    </section>
  )
}

export default FeaturedBlogs;
