import CategoriesPage from "@/components/blog/categories_page/CategoriesPage";

export default function Category({ params }) {
  return (
    <CategoriesPage category={params.slug} />
  );
};
