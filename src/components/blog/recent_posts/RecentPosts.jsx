import Link from "next/link";
import "./recentPosts.css";
import Image from "next/image";
import { format } from "date-fns";

const RecentPosts = ({blogs}) => {
  const secondFeaturedBlog = blogs[5]
  return (
    <section className="flex-col align-items-start">
      <h1 className="fw-bold">Recent Posts</h1>
      <article className="featured-blog position-relative d-flex flex-center p-3 overflow-hidden">
        <Link href="#" className="text-light d-flex flex-col">
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

          <div className="d-flex flex-column">
            <h2 className="text-capitalize tag-btn fw-medium border fs-6">
              <Link href={`/categories/${secondFeaturedBlog.tags[0]}`}>{secondFeaturedBlog.tags[0]}</Link>
            </h2>
            <h1 className="text-capitalize fw-semibold fs-5">
              {secondFeaturedBlog.title}
            </h1>
            <span className="date-text">{format(new Date(secondFeaturedBlog.publishedAt), "MMM dd, yyyy")}</span>
          </div>
        </Link>
      </article>
    </section>
  )
}

export default RecentPosts;
