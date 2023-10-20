import Link from "next/link";
import "./featuredBlogs.css";
import "../blogs_home_cover/blogsHomeCover.css";
import Image from "next/image";
import { format } from "date-fns";

const FeaturedBlogs = ({blogs}) => {
  const firstFeaturedBlog = blogs[2]
  const secondFeaturedBlog = blogs[5]
  const thirdFeaturedBlog = blogs[6]
  return (
    <section className="flex-col align-items-start">
      <h1 className="fw-bold">Featured Posts</h1>
      <div className="row mt-4">
        <div className="col-12 col-md-6">
          <article className="cover-blog-container position-relative d-flex flex-center overflow-hidden" id="first-featured-blog">
            <div className="cover-blog-overlay" />
            <Link href="#" className="cover-blog-link border text-light z-1 d-flex flex-column justify-content-end p-5">
              <h2 className="text-capitalize tag-btn fw-medium p-3 border fs-5">
                <Link href={`/categories/${firstFeaturedBlog.tags[0]}`}>{firstFeaturedBlog.tags[0]}</Link>
              </h2>
              <h1 className="text-capitalize fw-bolder fs-4">
                {firstFeaturedBlog.title}
              </h1>
              <p>{firstFeaturedBlog.description}</p>
              <span className="date-text">{format(new Date(firstFeaturedBlog.publishedAt), "MMM dd, yyyy")}</span>
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
        <div className="col-12 col-md-6 d-flex gap-1 flex-col justify-content-between">
          <article className="featured-blog row position-relative d-flex flex-center overflow-hidden">
            <Link href="#" className="text-light d-flex">
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
                <h2 className="text-capitalize tag-btn fw-medium p-3 border fs-6">
                  <Link href={`/categories/${secondFeaturedBlog.tags[0]}`}>{secondFeaturedBlog.tags[0]}</Link>
                </h2>
                <h1 className="text-capitalize fw-semibold fs-5">
                  {secondFeaturedBlog.title}
                </h1>
                <span className="date-text">{format(new Date(secondFeaturedBlog.publishedAt), "MMM dd, yyyy")}</span>
              </div>
            </Link>
          </article>
          
          <article className="featured-blog row position-relative d-flex flex-center overflow-hidden">
            <Link href="#" className="text-light d-flex">
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
                <h2 className="text-capitalize tag-btn fw-medium p-3 border fs-6">
                  <Link href={`/categories/${thirdFeaturedBlog.tags[0]}`}>{thirdFeaturedBlog.tags[0]}</Link>
                </h2>
                <h1 className="text-capitalize fw-semibold fs-5">
                  {thirdFeaturedBlog.title}
                </h1>
                <span className="date-text">{format(new Date(thirdFeaturedBlog.publishedAt), "MMM dd, yyyy")}</span>
              </div>
            </Link>
          </article>
        </div>
      </div>
    </section>
  )
}

export default FeaturedBlogs;
