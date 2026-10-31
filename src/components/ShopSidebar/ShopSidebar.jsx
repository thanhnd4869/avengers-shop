import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { Link } from "react-router";

import Icon from "@components/Icon";
import ProductCard from "@components/ProductCard";
import SocialWidget from "@components/SocialWidget";
import Widget from "@components/Widget";
import useAsync from "@hooks/useAsync";
import { PATHS } from "@routes/paths";
import { getProductCategories, getProducts } from "@services/productService";

import "./ShopSidebar.css";

const POPULAR_LIMIT = 3;

/**
 * Sidebar beside a product page: shop search, the category menu, social
 * links and the most popular games, as on the reference product page.
 */
function ShopSidebar() {
  const categories = useAsync(() => getProductCategories(), []);
  const popular = useAsync(() => getProducts({ sort: "-sales", limit: POPULAR_LIMIT }), []);

  const categoryList = categories.error ? [] : (categories.data?.data ?? []);
  const products = popular.error ? [] : (popular.data?.data ?? []);

  return (
    <aside className="shop-sidebar d-grid gap-4">
      <Widget>
        <Form action={PATHS.SHOP} role="search">
          <Form.Label htmlFor="shop-sidebar-search" className="visually-hidden">
            Search games
          </Form.Label>
          <InputGroup>
            <Form.Control
              id="shop-sidebar-search"
              name="q"
              type="search"
              placeholder="Search games..."
            />
            <Button type="submit" variant="primary" aria-label="Search">
              <Icon name="search" />
            </Button>
          </InputGroup>
        </Form>
      </Widget>

      {categoryList.length ? (
        <Widget title="Category Menu">
          <ul className="shop-sidebar__categories list-unstyled mb-0">
            {categoryList.map((category) => (
              <li key={category.id}>
                <Link to={`${PATHS.SHOP}?category=${category.slug}`}>{category.name}</Link>
              </li>
            ))}
          </ul>
        </Widget>
      ) : null}

      <SocialWidget />

      {products.length ? (
        <Widget title="Most Popular">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} variant="list" />
          ))}
        </Widget>
      ) : null}
    </aside>
  );
}

export default ShopSidebar;
