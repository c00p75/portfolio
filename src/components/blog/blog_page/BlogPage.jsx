'use client'

import { useMDXComponent } from 'next-contentlayer/hooks'
import Image from "next/image";
import { format, parseISO } from "date-fns";
import {allBlogs} from "/.contentlayer/generated";
import { useContext } from "react";
import { ThemeContext } from "@/app/theme-provider";
import "./blogPage.css";
import RecentPosts from '../recent_posts/RecentPosts';

export default function BlogPage({ blog }) {
  const { darkMode } = useContext(ThemeContext);
  const MDXContent = useMDXComponent(blog.body.code);
  const mdxComponents = {
    Image
  }
  const recentBlogs = allBlogs.filter((relatedBlog) => {
    return relatedBlog.tags.some((tag) => {
      return tag === blog.tags[0];
    })
  });

  return (
    <section style={{opacity: "1"}} className="flex-center flex-col" id={darkMode ? 'dark' : 'light'}>
      <span className="current-section" id="current-section-blog" />
      <article>
        <div className="cover-blog-container position-relative d-flex flex-center overflow-hidden" id="blog-details" style={{ backgroundImage: `url(${blog.image.filePath.replace("../public", "")})` }}>
          <div className="cover-blog-overlay" />
          <div className="cover-blog-link position-absolute text-light z-1 flex-center flex-column text-center" style={{height:"fit-content"}}>
            <h1 className="text-capitalize fw-bolder flex-center">
              {blog.title}
            </h1>
          </div>
        </div>
        <div className="flex-center flex-col">
          <div className="blog-tags flex-center">
            <time className="m-4">{format(parseISO(blog.publishedAt), "LLLL d, yyyy")}</time>
            <span className="m-4">{blog.readingTime.text}</span>
            <span className="m-4">{blog.tags[0]}</span>
          </div>

          <div className="row container-fluid blog-content pt-4 p-md-4">
            <div className="toc col-12 col-lg-3 overflow-y">
              <details open>
                <summary className='p-3'>Table of Content</summary>
                <ul className='mt-2 p-0'>
                  {
                    blog.toc.map((heading) => {
                      return(
                        <li key={heading.slug} className='my-2'>
                          <a href={`#${heading.slug}`} data-level={heading.level}>
                            <p className='flex'>
                              <span className="dot"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><path fill="white" d="M12 10a2 2 0 0 0-2 2a2 2 0 0 0 2 2c1.11 0 2-.89 2-2a2 2 0 0 0-2-2Z" /></svg></span>
                              <span className='flex-center'>{heading.text}</span>
                            </p>
                          </a>
                        </li>
                      )
                    })
                  }
                </ul>
              </details>
            </div>
            <div className="col-12 col-lg-9 prose prose-lg px-lg-5">
              <MDXContent components={mdxComponents} />
            </div>
          </div>
        </div>
        <div className='m-5' id='related-blogs'>
          <RecentPosts blogs={recentBlogs.slice(0,3)} header={"Related posts"} />
        </div>
      </article>
    </section>
  );
};
