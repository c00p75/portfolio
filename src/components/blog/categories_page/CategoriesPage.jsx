'use client'

import { format } from 'date-fns'
import Image from 'next/image'
import Link from 'next/link'
import React, { useContext } from 'react'
import {allBlogs} from "/.contentlayer/generated";
import GithubSlugger, { slug } from 'github-slugger';
import "./categoriesPage.css";
import { ThemeContext } from '@/app/theme-provider';

export async function generateStaticParams() {
  const categories = [];
  const paths = [{slug: "all"}];

  allBlogs.map((blog) => {
    if(blog.isPublished){
      blog.tags.map((tag) => {
        let slugified = new GithubSlugger().slug(tag);
        if(!categories.includes(slugified)){
          categories.push(slugified);
          paths.push({slug: slugified});
        }
      })
    }
  })
  return paths;
}

const CategoriesPage = ({category}) => {
  const { darkMode } = useContext(ThemeContext);
  const allCategories = ["all"];
  const blogs = allBlogs.filter((blog) => {
    return blog.tags.some((tag) => {
      const slugged = slug(tag);
      if(!allCategories.includes(slugged)){ allCategories.push(slugged) }
      if(category === "all") { return true }
      return slugged === category;
    })
  });
  return (
    <section style={{opacity: "1", minHeight: "90vh"}} className="flex-center flex-col" id={darkMode ? 'dark' : 'light'}>
      <div id="categories-page" className='container'>
        <div className='category-links flex-center my-2'>
          {allCategories.map((categoryLink) => {
            return (
            <Link
              key={categoryLink}
              href={`/blogs/categories/${categoryLink}`}
              className="border"
              id={categoryLink === category ? 'active-category': ''}
              >
                {categoryLink}
              </Link>
          )
          })}
        </div>
        <div className="blogs-container row" id='categories'>
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
                    <Link href={`/blogs/categories/${slug(blog.tags[0])}`} className="flex-center p-3">{blog.tags[0]}</Link>
                  </h2>
                  <h1 className="text-capitalize fw-semibold">
                    {blog.title}
                  </h1>
                  <span className="date-text">{format(new Date(blog.publishedAt), "MMM dd, yyyy")}</span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CategoriesPage