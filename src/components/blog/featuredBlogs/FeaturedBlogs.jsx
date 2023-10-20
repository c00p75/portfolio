import Link from "next/link";
import "./featuredBlogs.css";
import "../blogs_home_cover/blogsHomeCover.css";
import Image from "next/image";

const FeaturedBlogs = ({blogs}) => {
  const firstFeaturedBlog = blogs[2]
  const secondFeaturedBlog = blogs[3]
  const thirdFeaturedBlog = blogs[4]
  return (
    <section className="flex-col align-items-start">
      <h1 className="fw-bold">Featured Posts</h1>
      <div className="row flex-center">
        <div className="col-12 col-md-6">
          <article className="cover-blog-container position-relative d-flex flex-center overflow-hidden" id="first-featured-blog">
            <div className="cover-blog-overlay" />
            <Link href="#" className="cover-blog-link border text-light z-1 d-flex flex-column justify-content-end p-5">
              <h2 className="text-capitalize tag-btn fw-semibold p-3 border fs-5">
                <Link href={`/categories/${firstFeaturedBlog.tags[0]}`}>{firstFeaturedBlog.tags[0]}</Link>
              </h2>
              <h1 className="text-capitalize fw-bolder fs-4">
                {firstFeaturedBlog.title}
              </h1>
              <p>{firstFeaturedBlog.description}</p>
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
        <div className="col-12 col-md-6 d-flex flex-col justify-content-between">
          <article className="featured-blog row position-relative d-flex flex-center overflow-hidden">
            <Link href="#" className="text-light d-flex">
              <Image
                src={secondFeaturedBlog.image.filePath.replace("../public", "")}
                alt={secondFeaturedBlog.title}
                placeholder="blur"
                blurDataURL={secondFeaturedBlog.image.blurhashDataUrl}
                className="feature-image flex-shrink-1"
                width={secondFeaturedBlog.image.width}
                height={secondFeaturedBlog.image.height}
                quality={100}
              />

              <div className="d-flex flex-column">
                <h2 className="text-capitalize tag-btn fw-semibold p-3 border fs-5">
                  <Link href={`/categories/${secondFeaturedBlog.tags[0]}`}>{secondFeaturedBlog.tags[0]}</Link>
                </h2>
                <h1 className="text-capitalize fw-bolder fs-4">
                  {secondFeaturedBlog.title}
                </h1>
                <p>{secondFeaturedBlog.description}</p>
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
                className="feature-image flex-shrink-1"
                width={thirdFeaturedBlog.image.width}
                height={thirdFeaturedBlog.image.height}
                quality={100}
              />

              <div className="d-flex flex-column">
                <h2 className="text-capitalize tag-btn fw-semibold p-3 border fs-5">
                  <Link href={`/categories/${thirdFeaturedBlog.tags[0]}`}>{thirdFeaturedBlog.tags[0]}</Link>
                </h2>
                <h1 className="text-capitalize fw-bolder fs-4">
                  {thirdFeaturedBlog.title}
                </h1>
                <p>{thirdFeaturedBlog.description}</p>
              </div>
            </Link>
          </article>
        </div>
      </div>
    </section>
  )
}

export default FeaturedBlogs;
