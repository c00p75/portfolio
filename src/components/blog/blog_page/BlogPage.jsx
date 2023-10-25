'use client'

import { useMDXComponent } from 'next-contentlayer/hooks'

import Link from "next/link";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import { useContext } from "react";
import { ThemeContext } from "@/app/theme-provider";
import "./blogPage.css";
import "../blogs_home_cover/blogsHomeCover.css";

export default function BlogPage({ blog }) {
  const { darkMode } = useContext(ThemeContext);
  const MDXContent = useMDXComponent(blog.body.code);
  const mdxComponents = {
    Image
  }

  return (
    <section style={{opacity: "1"}} className="flex-center flex-col" id={darkMode ? 'dark' : 'light'}>
      <span className="current-section" id="current-section-blog" />
      <article>
        <div className="cover-blog-container position-relative d-flex flex-center overflow-hidden" id="blog-details" style={{ backgroundImage: `url(${blog.image.filePath.replace("../public", "")})` }}>
          <div className="cover-blog-overlay" />
          <div className="cover-blog-link position-absolute text-light z-1 flex-center flex-column text-center p-5">
            <h1 className="text-capitalize fw-bolder">
              {blog.title}
            </h1>
          </div>
          <h2 className="blog-category text-capitalize fw-semibold fs-5 position-absolute top-1 right-1 z-2 ">
            <Link href={`categories/${blog.tags[0]}`} className="flex-center p-3">#{blog.tags[0]}</Link>
          </h2>
        </div>
        <div className="flex-center flex-col">
          <div className="blog-details flex-center">
            <time className="m-4">{format(parseISO(blog.publishedAt), "LLLL d, yyyy")}</time>
            <span className="m-4">20 views</span>
            <span className="m-4">{blog.readingTime.text}</span>
          </div>

          <div className="row container blog-content">
            <div className="toc col-12 col-md-3 overflow-y">
              <details>
                <summary>Table of Content</summary>
                <ul>
                  {
                    blog.toc.map((heading) => {
                      return(
                        <li key={heading.slug}><a href={`#${heading.slug}`}><span>{heading.text}</span></a></li>
                      )
                    })
                  }
                </ul>
              </details>
            </div>
            <div className="col-12 col-md-9 prose prose-lg ps-5">
              <MDXContent components={mdxComponents} />
            </div>
          </div>
        </div>
      </article>
    </section>
  );
};
