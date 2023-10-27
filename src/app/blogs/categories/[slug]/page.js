import CategoriesPage from "@/components/blog/categories_page/CategoriesPage";

export async function generateMetadata({ params }) {
  const category = params.slug.replaceAll("-", " ").split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  return {
    title: `${category === "all" ? "All" : category} Blogs`,
    description: `Learn more about ${category === "all" ? "Web Development": category} through my collection of blogs and tutorials.`,
  }
};

export default function Category({ params }) {
  return (
    <CategoriesPage category={params.slug} />
  );
};
