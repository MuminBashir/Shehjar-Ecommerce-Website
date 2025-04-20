import {
  LOAD_PRODUCTS,
  SET_GRID_VIEW,
  SET_LIST_VIEW,
  UPDATE_SORT,
  SORT_PRODUCTS,
  UPDATE_FILTERS,
  FILTER_PRODUCTS,
  CLEAR_FILTERS,
} from "../../actions/actions";

const filter_reducer = (state, action) => {
  switch (action.type) {
    case LOAD_PRODUCTS:
      // Set up products and find highest price
      return {
        ...state,
        all_products: [...action.payload],
        filtered_products: [...action.payload],
      };

    case SET_GRID_VIEW:
      return { ...state, grid_view: true };

    case SET_LIST_VIEW:
      return { ...state, grid_view: false };

    case UPDATE_SORT:
      return { ...state, sort: action.payload };

    case SORT_PRODUCTS:
      // Sort logic is now handled in Firebase query
      // This remains for client-side sorting if needed
      const { sort, filtered_products } = state;
      let tempProducts = [...filtered_products];

      if (sort === "price_lowest") {
        tempProducts = tempProducts.sort((a, b) => a.price - b.price);
      }
      if (sort === "price_highest") {
        tempProducts = tempProducts.sort((a, b) => b.price - a.price);
      }
      if (sort === "name_a_z") {
        tempProducts = tempProducts.sort((a, b) => {
          return a.name.localeCompare(b.name);
        });
      }
      if (sort === "name_z_a") {
        tempProducts = tempProducts.sort((a, b) => {
          return b.name.localeCompare(a.name);
        });
      }
      if (sort === "newest") {
        tempProducts = tempProducts.sort((a, b) => {
          // Sort by created_at timestamp (newest first)
          return b.created_at - a.created_at;
        });
      }
      if (sort === "oldest") {
        tempProducts = tempProducts.sort((a, b) => {
          // Sort by created_at timestamp (oldest first)
          return a.created_at - b.created_at;
        });
      }
      return { ...state, filtered_products: tempProducts };

    case UPDATE_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.name]: action.payload.value,
        },
      };

    case FILTER_PRODUCTS:
      // Filter logic is mostly handled in Firebase query now
      // This remains for client-side filtering if needed
      const { all_products } = state;
      const { categoryId, min_price, max_price } = state.filters;

      let tempFilteredProducts = [...all_products];

      // Filter by category
      if (categoryId) {
        tempFilteredProducts = tempFilteredProducts.filter(
          (product) => product.category_id === categoryId
        );
      }

      // Filter by price range
      if (min_price !== null) {
        tempFilteredProducts = tempFilteredProducts.filter(
          (product) => product.price >= min_price
        );
      }

      if (max_price !== null) {
        tempFilteredProducts = tempFilteredProducts.filter(
          (product) => product.price <= max_price
        );
      }

      return { ...state, filtered_products: tempFilteredProducts };

    case CLEAR_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          categoryId: "",
          min_price: null,
          max_price: null,
          price_range: false,
        },
      };

    default:
      throw new Error(`No Matching "${action.type}" - action type`);
  }
};

export default filter_reducer;
