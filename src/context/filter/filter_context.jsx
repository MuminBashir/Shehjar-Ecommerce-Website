import { useReducer, useContext, createContext, useEffect } from "react";
import reducer from "../../reducers/filter/filter_reducer";
import {
  LOAD_PRODUCTS,
  SET_GRID_VIEW,
  SET_LIST_VIEW,
  UPDATE_SORT,
  UPDATE_FILTERS,
  SORT_PRODUCTS,
  FILTER_PRODUCTS,
  CLEAR_FILTERS,
} from "../../actions/actions";
import { useProductsContext } from "../product/products_context";

const initialState = {
  filtered_products: [],
  all_products: [],
  grid_view: true,
  sort: "newest", // Default to newest first
  filters: {
    categoryId: "",
    min_price: null,
    max_price: null,
    price_range: false,
  },
};

const FilterContext = createContext();

export const FiltersProvider = ({ children }) => {
  const { products } = useProductsContext();
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load products into context when they change
  useEffect(() => {
    dispatch({ type: LOAD_PRODUCTS, payload: products });
  }, [products]);

  // Apply filters and sort when products or filter settings change
  // This is used for client-side filtering when needed
  useEffect(() => {
    dispatch({ type: FILTER_PRODUCTS });
    dispatch({ type: SORT_PRODUCTS });
  }, [products, state.sort, state.filters]);

  const setGridView = () => {
    dispatch({ type: SET_GRID_VIEW });
  };

  const setListView = () => {
    dispatch({ type: SET_LIST_VIEW });
  };

  const updateSort = (e) => {
    const value = e.target.value;
    dispatch({ type: UPDATE_SORT, payload: value });
  };

  const updateFilters = (e) => {
    let name = e.target.name;
    let value = e.target.value;

    // Handle price reset
    if (name === "clear_price") {
      dispatch({
        type: UPDATE_FILTERS,
        payload: { name: "min_price", value: null },
      });
      dispatch({
        type: UPDATE_FILTERS,
        payload: { name: "max_price", value: null },
      });
      dispatch({
        type: UPDATE_FILTERS,
        payload: { name: "price_range", value: false },
      });
      return;
    }

    // Handle category selection
    if (name === "categoryId") {
      // Ensure we're passing the value properly
      dispatch({ type: UPDATE_FILTERS, payload: { name, value } });
      return;
    }

    // Handle empty price fields
    if ((name === "min_price" || name === "max_price") && value === "") {
      value = null;
    }
    // Convert price fields to numbers if they have values
    else if (name === "min_price" || name === "max_price") {
      value = value === "" ? null : Number(value);

      // Update price_range flag when either min or max price is set
      const otherPriceField = name === "min_price" ? "max_price" : "min_price";
      const otherPriceValue = state.filters[otherPriceField];

      const hasPriceFilter = value !== null || otherPriceValue !== null;

      dispatch({
        type: UPDATE_FILTERS,
        payload: { name: "price_range", value: hasPriceFilter },
      });
    }

    dispatch({ type: UPDATE_FILTERS, payload: { name, value } });
  };

  const clearFilters = () => {
    dispatch({ type: CLEAR_FILTERS });
  };

  return (
    <FilterContext.Provider
      value={{
        ...state,
        setGridView,
        setListView,
        updateSort,
        updateFilters,
        clearFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilterContext = () => {
  return useContext(FilterContext);
};
