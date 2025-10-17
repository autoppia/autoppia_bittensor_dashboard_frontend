import { UseCase } from "./query";

interface UseCaseData {
  success_count: number;
  total: number;
  success_rate: number;
  avg_solution_time: number;
}

interface WebsiteData {
  use_cases: Record<string, UseCaseData>;
  overall: {
    success_count: number;
    total: number;
    success_rate: number;
    avg_solution_time: number;
  };
}

interface AgentData {
  [website: string]: WebsiteData;
}

interface SampleData {
  agents: {
    [key: string]: AgentData;
    AutoppiaAgent: {
      "Autoppia AutoZone": WebsiteData;
      Books: WebsiteData;
      Cinema: WebsiteData;
    };
    "openai-cua": {
      Autozone: WebsiteData;
      Books: WebsiteData;
      Cinema: WebsiteData;
    };
    "browser-gpt-o3": {
      Autozone: WebsiteData;
      Books: WebsiteData;
      Cinema: WebsiteData;
    };
    "browser-sonnet4": {
      Autozone: WebsiteData;
      Books: WebsiteData;
      Cinema: WebsiteData;
    };
    "anthropic-cua": {
      Autozone: WebsiteData;
      Books: WebsiteData;
      Cinema: WebsiteData;
    };
  };
}

export const useCaseCatalogues: Record<string, UseCase[]> = {
  autozone: [
    { id: 1, name: "CAROUSEL_SCROLL" },
    { id: 2, name: "SEARCH_PRODUCT" },
    { id: 3, name: "VIEW_DETAIL" },
    { id: 4, name: "ADD_TO_CART" },
    { id: 5, name: "CHECKOUT_STARTED" },
    { id: 6, name: "VIEW_CART" },
    { id: 7, name: "QUANTITY_CHANGED" },
    { id: 8, name: "PROCEED_TO_CHECKOUT" },
    { id: 9, name: "ORDER_COMPLETED" },
    { id: 10, name: "FILTER_PRODUCTS" },
    { id: 11, name: "VIEW_PROMOTIONS" },
    { id: 12, name: "APPLY_COUPON" },
  ],
  autobooks: [
    { id: 1, name: "ADD_BOOK" },
    { id: 2, name: "ADD_COMMENT_BOOK" },
    { id: 3, name: "BOOK_DETAIL" },
    { id: 4, name: "CONTACT_BOOK" },
    { id: 5, name: "DELETE_BOOK" },
    { id: 6, name: "EDIT_BOOK" },
    { id: 7, name: "EDIT_USER_BOOK" },
    { id: 8, name: "FILTER_BOOK" },
    { id: 9, name: "LOGIN_BOOK" },
    { id: 10, name: "LOGOUT_BOOK" },
    { id: 11, name: "PURCHASE_BOOK" },
    { id: 12, name: "REGISTRATION_BOOK" },
  ],
  autocinema: [
    { id: 1, name: "ADD_COMMENT" },
    { id: 2, name: "ADD_FILM" },
    { id: 3, name: "CONTACT" },
    { id: 4, name: "DELETE_FILM" },
    { id: 5, name: "EDIT_FILM" },
    { id: 6, name: "EDIT_USER" },
    { id: 7, name: "FILM_DETAIL" },
    { id: 8, name: "FILTER_FILM" },
    { id: 9, name: "LOGIN" },
    { id: 10, name: "LOGOUT" },
    { id: 11, name: "REGISTRATION" },
    { id: 12, name: "SEARCH_FILM" },
  ],
};

export const sampleData: SampleData = {
  agents: {
    AutoppiaAgent: {
      "Autoppia AutoZone": {
        use_cases: {
          CAROUSEL_SCROLL: {
            success_count: 8,
            total: 9,
            success_rate: 0.889,
            avg_solution_time: 3.339,
          },
          SEARCH_PRODUCT: {
            success_count: 9,
            total: 9,
            success_rate: 1.0,
            avg_solution_time: 3.912,
          },
          VIEW_DETAIL: {
            success_count: 9,
            total: 9,
            success_rate: 1.0,
            avg_solution_time: 5.405,
          },
          ADD_TO_CART: {
            success_count: 9,
            total: 9,
            success_rate: 1.0,
            avg_solution_time: 5.761,
          },
          CHECKOUT_STARTED: {
            success_count: 6,
            total: 9,
            success_rate: 0.667,
            avg_solution_time: 5.647,
          },
          VIEW_CART: {
            success_count: 9,
            total: 9,
            success_rate: 1.0,
            avg_solution_time: 2.645,
          },
          QUANTITY_CHANGED: {
            success_count: 6,
            total: 9,
            success_rate: 0.667,
            avg_solution_time: 6.673,
          },
          PROCEED_TO_CHECKOUT: {
            success_count: 9,
            total: 9,
            success_rate: 1.0,
            avg_solution_time: 7.23,
          },
          ORDER_COMPLETED: {
            success_count: 4,
            total: 9,
            success_rate: 0.444,
            avg_solution_time: 5.787,
          },
          FILTER_PRODUCTS: {
            success_count: 7,
            total: 9,
            success_rate: 0.778,
            avg_solution_time: 4.123,
          },
          VIEW_PROMOTIONS: {
            success_count: 8,
            total: 9,
            success_rate: 0.889,
            avg_solution_time: 3.456,
          },
          APPLY_COUPON: {
            success_count: 6,
            total: 9,
            success_rate: 0.667,
            avg_solution_time: 5.892,
          },
        },
        overall: {
          success_count: 90,
          total: 108,
          success_rate: 0.833,
          avg_solution_time: 4.986,
        },
      },
      Books: {
        use_cases: {
          ADD_BOOK: {
            success_count: 7,
            total: 10,
            success_rate: 0.7,
            avg_solution_time: 4.2,
          },
          ADD_COMMENT_BOOK: {
            success_count: 8,
            total: 10,
            success_rate: 0.8,
            avg_solution_time: 3.8,
          },
          BOOK_DETAIL: {
            success_count: 9,
            total: 10,
            success_rate: 0.9,
            avg_solution_time: 5.1,
          },
          CONTACT_BOOK: {
            success_count: 6,
            total: 10,
            success_rate: 0.6,
            avg_solution_time: 4.5,
          },
          DELETE_BOOK: {
            success_count: 5,
            total: 10,
            success_rate: 0.5,
            avg_solution_time: 5.3,
          },
          EDIT_BOOK: {
            success_count: 7,
            total: 10,
            success_rate: 0.7,
            avg_solution_time: 4.8,
          },
          EDIT_USER_BOOK: {
            success_count: 6,
            total: 10,
            success_rate: 0.6,
            avg_solution_time: 5.0,
          },
          FILTER_BOOK: {
            success_count: 8,
            total: 10,
            success_rate: 0.8,
            avg_solution_time: 3.9,
          },
          LOGIN_BOOK: {
            success_count: 9,
            total: 10,
            success_rate: 0.9,
            avg_solution_time: 3.2,
          },
          LOGOUT_BOOK: {
            success_count: 9,
            total: 10,
            success_rate: 0.9,
            avg_solution_time: 2.8,
          },
          PURCHASE_BOOK: {
            success_count: 7,
            total: 10,
            success_rate: 0.7,
            avg_solution_time: 6.1,
          },
          REGISTRATION_BOOK: {
            success_count: 6,
            total: 10,
            success_rate: 0.6,
            avg_solution_time: 5.4,
          },
        },
        overall: {
          success_count: 87,
          total: 120,
          success_rate: 0.725,
          avg_solution_time: 4.508,
        },
      },
      Cinema: {
        use_cases: {
          ADD_COMMENT: {
            success_count: 8,
            total: 10,
            success_rate: 0.8,
            avg_solution_time: 3.7,
          },
          ADD_FILM: {
            success_count: 6,
            total: 10,
            success_rate: 0.6,
            avg_solution_time: 5.2,
          },
          CONTACT: {
            success_count: 7,
            total: 10,
            success_rate: 0.7,
            avg_solution_time: 4.3,
          },
          DELETE_FILM: {
            success_count: 5,
            total: 10,
            success_rate: 0.5,
            avg_solution_time: 5.5,
          },
          EDIT_FILM: {
            success_count: 6,
            total: 10,
            success_rate: 0.6,
            avg_solution_time: 5.0,
          },
          EDIT_USER: {
            success_count: 7,
            total: 10,
            success_rate: 0.7,
            avg_solution_time: 4.8,
          },
          FILM_DETAIL: {
            success_count: 9,
            total: 10,
            success_rate: 0.9,
            avg_solution_time: 4.1,
          },
          FILTER_FILM: {
            success_count: 8,
            total: 10,
            success_rate: 0.8,
            avg_solution_time: 3.9,
          },
          LOGIN: {
            success_count: 9,
            total: 10,
            success_rate: 0.9,
            avg_solution_time: 3.3,
          },
          LOGOUT: {
            success_count: 9,
            total: 10,
            success_rate: 0.9,
            avg_solution_time: 2.9,
          },
          REGISTRATION: {
            success_count: 6,
            total: 10,
            success_rate: 0.6,
            avg_solution_time: 5.6,
          },
          SEARCH_FILM: {
            success_count: 8,
            total: 10,
            success_rate: 0.8,
            avg_solution_time: 4.0,
          },
        },
        overall: {
          success_count: 88,
          total: 120,
          success_rate: 0.733,
          avg_solution_time: 4.367,
        },
      },
    },
    "openai-cua": {
      Autozone: {
        use_cases: {
          CAROUSEL_SCROLL: {
            success_count: 7,
            total: 10,
            success_rate: 0.7,
            avg_solution_time: 4.0,
          },
          SEARCH_PRODUCT: {
            success_count: 8,
            total: 10,
            success_rate: 0.8,
            avg_solution_time: 3.5,
          },
          VIEW_DETAIL: {
            success_count: 9,
            total: 10,
            success_rate: 0.9,
            avg_solution_time: 5.0,
          },
          ADD_TO_CART: {
            success_count: 8,
            total: 10,
            success_rate: 0.8,
            avg_solution_time: 5.2,
          },
          CHECKOUT_STARTED: {
            success_count: 6,
            total: 10,
            success_rate: 0.6,
            avg_solution_time: 5.8,
          },
          VIEW_CART: {
            success_count: 8,
            total: 10,
            success_rate: 0.8,
            avg_solution_time: 3.0,
          },
          QUANTITY_CHANGED: {
            success_count: 5,
            total: 10,
            success_rate: 0.5,
            avg_solution_time: 6.0,
          },
          PROCEED_TO_CHECKOUT: {
            success_count: 7,
            total: 10,
            success_rate: 0.7,
            avg_solution_time: 6.5,
          },
          ORDER_COMPLETED: {
            success_count: 5,
            total: 10,
            success_rate: 0.5,
            avg_solution_time: 6.2,
          },
          FILTER_PRODUCTS: {
            success_count: 6,
            total: 10,
            success_rate: 0.6,
            avg_solution_time: 4.5,
          },
          VIEW_PROMOTIONS: {
            success_count: 7,
            total: 10,
            success_rate: 0.7,
            avg_solution_time: 3.8,
          },
          APPLY_COUPON: {
            success_count: 6,
            total: 10,
            success_rate: 0.6,
            avg_solution_time: 5.3,
          },
        },
        overall: {
          success_count: 82,
          total: 120,
          success_rate: 0.683,
          avg_solution_time: 4.983,
        },
      },
      Books: {
        use_cases: {
          ADD_BOOK: {
            success_count: 6,
            total: 10,
            success_rate: 0.6,
            avg_solution_time: 4.5,
          },
          ADD_COMMENT_BOOK: {
            success_count: 7,
            total: 10,
            success_rate: 0.7,
            avg_solution_time: 3.9,
          },
          BOOK_DETAIL: {
            success_count: 8,
            total: 10,
            success_rate: 0.8,
            avg_solution_time: 5.2,
          },
          CONTACT_BOOK: {
            success_count: 5,
            total: 10,
            success_rate: 0.5,
            avg_solution_time: 4.7,
          },
          DELETE_BOOK: {
            success_count: 4,
            total: 10,
            success_rate: 0.4,
            avg_solution_time: 5.5,
          },
          EDIT_BOOK: {
            success_count: 6,
            total: 10,
            success_rate: 0.6,
            avg_solution_time: 4.9,
          },
          EDIT_USER_BOOK: {
            success_count: 5,
            total: 10,
            success_rate: 0.5,
            avg_solution_time: 5.1,
          },
          FILTER_BOOK: {
            success_count: 7,
            total: 10,
            success_rate: 0.7,
            avg_solution_time: 4.0,
          },
          LOGIN_BOOK: {
            success_count: 8,
            total: 10,
            success_rate: 0.8,
            avg_solution_time: 3.4,
          },
          LOGOUT_BOOK: {
            success_count: 8,
            total: 10,
            success_rate: 0.8,
            avg_solution_time: 3.0,
          },
          PURCHASE_BOOK: {
            success_count: 6,
            total: 10,
            success_rate: 0.6,
            avg_solution_time: 6.2,
          },
          REGISTRATION_BOOK: {
            success_count: 5,
            total: 10,
            success_rate: 0.5,
            avg_solution_time: 5.5,
          },
        },
        overall: {
          success_count: 75,
          total: 120,
          success_rate: 0.625,
          avg_solution_time: 4.667,
        },
      },
      Cinema: {
        use_cases: {
          ADD_COMMENT: {
            success_count: 7,
            total: 10,
            success_rate: 0.7,
            avg_solution_time: 3.8,
          },
          ADD_FILM: {
            success_count: 5,
            total: 10,
            success_rate: 0.5,
            avg_solution_time: 5.3,
          },
          CONTACT: {
            success_count: 6,
            total: 10,
            success_rate: 0.6,
            avg_solution_time: 4.4,
          },
          DELETE_FILM: {
            success_count: 4,
            total: 10,
            success_rate: 0.4,
            avg_solution_time: 5.6,
          },
          EDIT_FILM: {
            success_count: 5,
            total: 10,
            success_rate: 0.5,
            avg_solution_time: 5.1,
          },
          EDIT_USER: {
            success_count: 6,
            total: 10,
            success_rate: 0.6,
            avg_solution_time: 4.9,
          },
          FILM_DETAIL: {
            success_count: 8,
            total: 10,
            success_rate: 0.8,
            avg_solution_time: 4.2,
          },
          FILTER_FILM: {
            success_count: 7,
            total: 10,
            success_rate: 0.7,
            avg_solution_time: 4.0,
          },
          LOGIN: {
            success_count: 8,
            total: 10,
            success_rate: 0.8,
            avg_solution_time: 3.4,
          },
          LOGOUT: {
            success_count: 8,
            total: 10,
            success_rate: 0.8,
            avg_solution_time: 3.0,
          },
          REGISTRATION: {
            success_count: 5,
            total: 10,
            success_rate: 0.5,
            avg_solution_time: 5.7,
          },
          SEARCH_FILM: {
            success_count: 7,
            total: 10,
            success_rate: 0.7,
            avg_solution_time: 4.1,
          },
        },
        overall: {
          success_count: 76,
          total: 120,
          success_rate: 0.633,
          avg_solution_time: 4.458,
        },
      },
    },
    "browser-gpt-o3": {
      Autozone: {
        use_cases: {
          CAROUSEL_SCROLL: {
            success_count: 9,
            total: 10,
            success_rate: 0.9,
            avg_solution_time: 3.2,
          },
          SEARCH_PRODUCT: {
            success_count: 9,
            total: 10,
            success_rate: 0.9,
            avg_solution_time: 3.4,
          },
          VIEW_DETAIL: {
            success_count: 10,
            total: 10,
            success_rate: 1.0,
            avg_solution_time: 4.8,
          },
          ADD_TO_CART: {
            success_count: 9,
            total: 10,
            success_rate: 0.9,
            avg_solution_time: 5.0,
          },
          CHECKOUT_STARTED: {
            success_count: 7,
            total: 10,
            success_rate: 0.7,
            avg_solution_time: 5.5,
          },
          VIEW_CART: {
            success_count: 9,
            total: 10,
            success_rate: 0.9,
            avg_solution_time: 2.8,
          },
          QUANTITY_CHANGED: {
            success_count: 6,
            total: 10,
            success_rate: 0.6,
            avg_solution_time: 5.8,
          },
          PROCEED_TO_CHECKOUT: {
            success_count: 8,
            total: 10,
            success_rate: 0.8,
            avg_solution_time: 6.0,
          },
          ORDER_COMPLETED: {
            success_count: 6,
            total: 10,
            success_rate: 0.6,
            avg_solution_time: 5.9,
          },
          FILTER_PRODUCTS: {
            success_count: 7,
            total: 10,
            success_rate: 0.7,
            avg_solution_time: 4.2,
          },
          VIEW_PROMOTIONS: {
            success_count: 8,
            total: 10,
            success_rate: 0.8,
            avg_solution_time: 3.5,
          },
          APPLY_COUPON: {
            success_count: 7,
            total: 10,
            success_rate: 0.7,
            avg_solution_time: 5.1,
          },
        },
        overall: {
          success_count: 95,
          total: 120,
          success_rate: 0.792,
          avg_solution_time: 4.617,
        },
      },
      Books: {
        use_cases: {
          ADD_BOOK: {
            success_count: 8,
            total: 10,
            success_rate: 0.8,
            avg_solution_time: 4.3,
          },
          ADD_COMMENT_BOOK: {
            success_count: 9,
            total: 10,
            success_rate: 0.9,
            avg_solution_time: 3.7,
          },
          BOOK_DETAIL: {
            success_count: 9,
            total: 10,
            success_rate: 0.9,
            avg_solution_time: 5.0,
          },
          CONTACT_BOOK: {
            success_count: 7,
            total: 10,
            success_rate: 0.7,
            avg_solution_time: 4.4,
          },
          DELETE_BOOK: {
            success_count: 6,
            total: 10,
            success_rate: 0.6,
            avg_solution_time: 5.2,
          },
          EDIT_BOOK: {
            success_count: 8,
            total: 10,
            success_rate: 0.8,
            avg_solution_time: 4.7,
          },
          EDIT_USER_BOOK: {
            success_count: 7,
            total: 10,
            success_rate: 0.7,
            avg_solution_time: 4.9,
          },
          FILTER_BOOK: {
            success_count: 9,
            total: 10,
            success_rate: 0.9,
            avg_solution_time: 3.8,
          },
          LOGIN_BOOK: {
            success_count: 9,
            total: 10,
            success_rate: 0.9,
            avg_solution_time: 3.3,
          },
          LOGOUT_BOOK: {
            success_count: 9,
            total: 10,
            success_rate: 0.9,
            avg_solution_time: 2.9,
          },
          PURCHASE_BOOK: {
            success_count: 8,
            total: 10,
            success_rate: 0.8,
            avg_solution_time: 6.0,
          },
          REGISTRATION_BOOK: {
            success_count: 7,
            total: 10,
            success_rate: 0.7,
            avg_solution_time: 5.3,
          },
        },
        overall: {
          success_count: 96,
          total: 120,
          success_rate: 0.8,
          avg_solution_time: 4.458,
        },
      },
      Cinema: {
        use_cases: {
          ADD_COMMENT: {
            success_count: 9,
            total: 10,
            success_rate: 0.9,
            avg_solution_time: 3.6,
          },
          ADD_FILM: {
            success_count: 7,
            total: 10,
            success_rate: 0.7,
            avg_solution_time: 5.1,
          },
          CONTACT: {
            success_count: 8,
            total: 10,
            success_rate: 0.8,
            avg_solution_time: 4.2,
          },
          DELETE_FILM: {
            success_count: 6,
            total: 10,
            success_rate: 0.6,
            avg_solution_time: 5.4,
          },
          EDIT_FILM: {
            success_count: 7,
            total: 10,
            success_rate: 0.7,
            avg_solution_time: 4.9,
          },
          EDIT_USER: {
            success_count: 8,
            total: 10,
            success_rate: 0.8,
            avg_solution_time: 4.7,
          },
          FILM_DETAIL: {
            success_count: 9,
            total: 10,
            success_rate: 0.9,
            avg_solution_time: 4.0,
          },
          FILTER_FILM: {
            success_count: 9,
            total: 10,
            success_rate: 0.9,
            avg_solution_time: 3.8,
          },
          LOGIN: {
            success_count: 9,
            total: 10,
            success_rate: 0.9,
            avg_solution_time: 3.2,
          },
          LOGOUT: {
            success_count: 9,
            total: 10,
            success_rate: 0.9,
            avg_solution_time: 2.8,
          },
          REGISTRATION: {
            success_count: 7,
            total: 10,
            success_rate: 0.7,
            avg_solution_time: 5.5,
          },
          SEARCH_FILM: {
            success_count: 8,
            total: 10,
            success_rate: 0.8,
            avg_solution_time: 3.9,
          },
        },
        overall: {
          success_count: 96,
          total: 120,
          success_rate: 0.8,
          avg_solution_time: 4.317,
        },
      },
    },
    "browser-sonnet4": {
      Autozone: {
        use_cases: {
          CAROUSEL_SCROLL: {
            success_count: 8,
            total: 10,
            success_rate: 0.8,
            avg_solution_time: 3.5,
          },
          SEARCH_PRODUCT: {
            success_count: 8,
            total: 10,
            success_rate: 0.8,
            avg_solution_time: 3.7,
          },
          VIEW_DETAIL: {
            success_count: 9,
            total: 10,
            success_rate: 0.9,
            avg_solution_time: 5.1,
          },
          ADD_TO_CART: {
            success_count: 8,
            total: 10,
            success_rate: 0.8,
            avg_solution_time: 5.3,
          },
          CHECKOUT_STARTED: {
            success_count: 6,
            total: 10,
            success_rate: 0.6,
            avg_solution_time: 5.7,
          },
          VIEW_CART: {
            success_count: 8,
            total: 10,
            success_rate: 0.8,
            avg_solution_time: 3.1,
          },
          QUANTITY_CHANGED: {
            success_count: 5,
            total: 10,
            success_rate: 0.5,
            avg_solution_time: 6.1,
          },
          PROCEED_TO_CHECKOUT: {
            success_count: 7,
            total: 10,
            success_rate: 0.7,
            avg_solution_time: 6.3,
          },
          ORDER_COMPLETED: {
            success_count: 5,
            total: 10,
            success_rate: 0.5,
            avg_solution_time: 6.1,
          },
          FILTER_PRODUCTS: {
            success_count: 6,
            total: 10,
            success_rate: 0.6,
            avg_solution_time: 4.4,
          },
          VIEW_PROMOTIONS: {
            success_count: 7,
            total: 10,
            success_rate: 0.7,
            avg_solution_time: 3.7,
          },
          APPLY_COUPON: {
            success_count: 6,
            total: 10,
            success_rate: 0.6,
            avg_solution_time: 5.2,
          },
        },
        overall: {
          success_count: 83,
          total: 120,
          success_rate: 0.692,
          avg_solution_time: 4.925,
        },
      },
      Books: {
        use_cases: {
          ADD_BOOK: {
            success_count: 7,
            total: 10,
            success_rate: 0.7,
            avg_solution_time: 4.4,
          },
          ADD_COMMENT_BOOK: {
            success_count: 8,
            total: 10,
            success_rate: 0.8,
            avg_solution_time: 3.8,
          },
          BOOK_DETAIL: {
            success_count: 8,
            total: 10,
            success_rate: 0.8,
            avg_solution_time: 5.1,
          },
          CONTACT_BOOK: {
            success_count: 6,
            total: 10,
            success_rate: 0.6,
            avg_solution_time: 4.5,
          },
          DELETE_BOOK: {
            success_count: 5,
            total: 10,
            success_rate: 0.5,
            avg_solution_time: 5.3,
          },
          EDIT_BOOK: {
            success_count: 7,
            total: 10,
            success_rate: 0.7,
            avg_solution_time: 4.8,
          },
          EDIT_USER_BOOK: {
            success_count: 6,
            total: 10,
            success_rate: 0.6,
            avg_solution_time: 5.0,
          },
          FILTER_BOOK: {
            success_count: 8,
            total: 10,
            success_rate: 0.8,
            avg_solution_time: 3.9,
          },
          LOGIN_BOOK: {
            success_count: 8,
            total: 10,
            success_rate: 0.8,
            avg_solution_time: 3.3,
          },
          LOGOUT_BOOK: {
            success_count: 8,
            total: 10,
            success_rate: 0.8,
            avg_solution_time: 2.9,
          },
          PURCHASE_BOOK: {
            success_count: 7,
            total: 10,
            success_rate: 0.7,
            avg_solution_time: 6.0,
          },
          REGISTRATION_BOOK: {
            success_count: 6,
            total: 10,
            success_rate: 0.6,
            avg_solution_time: 5.4,
          },
        },
        overall: {
          success_count: 84,
          total: 120,
          success_rate: 0.7,
          avg_solution_time: 4.583,
        },
      },
      Cinema: {
        use_cases: {
          ADD_COMMENT: {
            success_count: 8,
            total: 10,
            success_rate: 0.8,
            avg_solution_time: 3.7,
          },
          ADD_FILM: {
            success_count: 6,
            total: 10,
            success_rate: 0.6,
            avg_solution_time: 5.2,
          },
          CONTACT: {
            success_count: 7,
            total: 10,
            success_rate: 0.7,
            avg_solution_time: 4.3,
          },
          DELETE_FILM: {
            success_count: 5,
            total: 10,
            success_rate: 0.5,
            avg_solution_time: 5.5,
          },
          EDIT_FILM: {
            success_count: 6,
            total: 10,
            success_rate: 0.6,
            avg_solution_time: 5.0,
          },
          EDIT_USER: {
            success_count: 7,
            total: 10,
            success_rate: 0.7,
            avg_solution_time: 4.8,
          },
          FILM_DETAIL: {
            success_count: 8,
            total: 10,
            success_rate: 0.8,
            avg_solution_time: 4.1,
          },
          FILTER_FILM: {
            success_count: 8,
            total: 10,
            success_rate: 0.8,
            avg_solution_time: 3.9,
          },
          LOGIN: {
            success_count: 8,
            total: 10,
            success_rate: 0.8,
            avg_solution_time: 3.3,
          },
          LOGOUT: {
            success_count: 8,
            total: 10,
            success_rate: 0.8,
            avg_solution_time: 2.9,
          },
          REGISTRATION: {
            success_count: 6,
            total: 10,
            success_rate: 0.6,
            avg_solution_time: 5.6,
          },
          SEARCH_FILM: {
            success_count: 7,
            total: 10,
            success_rate: 0.7,
            avg_solution_time: 4.0,
          },
        },
        overall: {
          success_count: 84,
          total: 120,
          success_rate: 0.7,
          avg_solution_time: 4.433,
        },
      },
    },
    "anthropic-cua": {
      Autozone: {
        use_cases: {
          CAROUSEL_SCROLL: {
            success_count: 7,
            total: 10,
            success_rate: 0.7,
            avg_solution_time: 3.8,
          },
          SEARCH_PRODUCT: {
            success_count: 8,
            total: 10,
            success_rate: 0.8,
            avg_solution_time: 3.6,
          },
          VIEW_DETAIL: {
            success_count: 8,
            total: 10,
            success_rate: 0.8,
            avg_solution_time: 5.2,
          },
          ADD_TO_CART: {
            success_count: 7,
            total: 10,
            success_rate: 0.7,
            avg_solution_time: 5.4,
          },
          CHECKOUT_STARTED: {
            success_count: 5,
            total: 10,
            success_rate: 0.5,
            avg_solution_time: 5.9,
          },
          VIEW_CART: {
            success_count: 7,
            total: 10,
            success_rate: 0.7,
            avg_solution_time: 3.2,
          },
          QUANTITY_CHANGED: {
            success_count: 4,
            total: 10,
            success_rate: 0.4,
            avg_solution_time: 6.2,
          },
          PROCEED_TO_CHECKOUT: {
            success_count: 6,
            total: 10,
            success_rate: 0.6,
            avg_solution_time: 6.4,
          },
          ORDER_COMPLETED: {
            success_count: 4,
            total: 10,
            success_rate: 0.4,
            avg_solution_time: 6.3,
          },
          FILTER_PRODUCTS: {
            success_count: 5,
            total: 10,
            success_rate: 0.5,
            avg_solution_time: 4.6,
          },
          VIEW_PROMOTIONS: {
            success_count: 6,
            total: 10,
            success_rate: 0.6,
            avg_solution_time: 3.9,
          },
          APPLY_COUPON: {
            success_count: 5,
            total: 10,
            success_rate: 0.5,
            avg_solution_time: 5.4,
          },
        },
        overall: {
          success_count: 77,
          total: 120,
          success_rate: 0.642,
          avg_solution_time: 5.058,
        },
      },
      Books: {
        use_cases: {
          ADD_BOOK: {
            success_count: 6,
            total: 10,
            success_rate: 0.6,
            avg_solution_time: 4.5,
          },
          ADD_COMMENT_BOOK: {
            success_count: 7,
            total: 10,
            success_rate: 0.7,
            avg_solution_time: 3.9,
          },
          BOOK_DETAIL: {
            success_count: 8,
            total: 10,
            success_rate: 0.8,
            avg_solution_time: 5.2,
          },
          CONTACT_BOOK: {
            success_count: 5,
            total: 10,
            success_rate: 0.5,
            avg_solution_time: 4.7,
          },
          DELETE_BOOK: {
            success_count: 4,
            total: 10,
            success_rate: 0.4,
            avg_solution_time: 5.5,
          },
          EDIT_BOOK: {
            success_count: 6,
            total: 10,
            success_rate: 0.6,
            avg_solution_time: 4.9,
          },
          EDIT_USER_BOOK: {
            success_count: 5,
            total: 10,
            success_rate: 0.5,
            avg_solution_time: 5.1,
          },
          FILTER_BOOK: {
            success_count: 7,
            total: 10,
            success_rate: 0.7,
            avg_solution_time: 4.0,
          },
          LOGIN_BOOK: {
            success_count: 8,
            total: 10,
            success_rate: 0.8,
            avg_solution_time: 3.4,
          },
          LOGOUT_BOOK: {
            success_count: 8,
            total: 10,
            success_rate: 0.8,
            avg_solution_time: 3.0,
          },
          PURCHASE_BOOK: {
            success_count: 6,
            total: 10,
            success_rate: 0.6,
            avg_solution_time: 6.2,
          },
          REGISTRATION_BOOK: {
            success_count: 5,
            total: 10,
            success_rate: 0.5,
            avg_solution_time: 5.5,
          },
        },
        overall: {
          success_count: 75,
          total: 120,
          success_rate: 0.625,
          avg_solution_time: 4.667,
        },
      },
      Cinema: {
        use_cases: {
          ADD_COMMENT: {
            success_count: 7,
            total: 10,
            success_rate: 0.7,
            avg_solution_time: 3.8,
          },
          ADD_FILM: {
            success_count: 5,
            total: 10,
            success_rate: 0.5,
            avg_solution_time: 5.3,
          },
          CONTACT: {
            success_count: 6,
            total: 10,
            success_rate: 0.6,
            avg_solution_time: 4.4,
          },
          DELETE_FILM: {
            success_count: 4,
            total: 10,
            success_rate: 0.4,
            avg_solution_time: 5.6,
          },
          EDIT_FILM: {
            success_count: 5,
            total: 10,
            success_rate: 0.5,
            avg_solution_time: 5.1,
          },
          EDIT_USER: {
            success_count: 6,
            total: 10,
            success_rate: 0.6,
            avg_solution_time: 4.9,
          },
          FILM_DETAIL: {
            success_count: 8,
            total: 10,
            success_rate: 0.8,
            avg_solution_time: 4.2,
          },
          FILTER_FILM: {
            success_count: 7,
            total: 10,
            success_rate: 0.7,
            avg_solution_time: 4.0,
          },
          LOGIN: {
            success_count: 8,
            total: 10,
            success_rate: 0.8,
            avg_solution_time: 3.4,
          },
          LOGOUT: {
            success_count: 8,
            total: 10,
            success_rate: 0.8,
            avg_solution_time: 3.0,
          },
          REGISTRATION: {
            success_count: 5,
            total: 10,
            success_rate: 0.5,
            avg_solution_time: 5.7,
          },
          SEARCH_FILM: {
            success_count: 7,
            total: 10,
            success_rate: 0.7,
            avg_solution_time: 4.1,
          },
        },
        overall: {
          success_count: 76,
          total: 120,
          success_rate: 0.633,
          avg_solution_time: 4.458,
        },
      },
    },
  },
};