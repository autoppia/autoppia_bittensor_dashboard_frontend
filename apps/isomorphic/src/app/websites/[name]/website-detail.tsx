"use client";

import { useParams } from "next/navigation";
import { Title, Text, Button } from "rizzui";
import Link from "next/link";
import Image from "next/image";
import { websitesData } from "@/data/websites-data";
import { useCaseCatalogues } from "@/data/sample-data";
import { routes } from "@/config/routes";
import { LuArrowRight, LuExternalLink } from "react-icons/lu";
import WidgetCard from "@core/components/cards/widget-card";

const useCasePrompts: Record<string, Record<string, string>> = {
  autozone: {
    CAROUSEL_SCROLL: "Scroll through the product carousel on the homepage",
    SEARCH_PRODUCT: "Search for 'brake pads' in the search bar",
    VIEW_DETAIL: "Click on a product to view its details",
    ADD_TO_CART: "Add the selected product to your cart",
    CHECKOUT_STARTED: "Start the checkout process from the cart",
    VIEW_CART: "Navigate to view your shopping cart",
    QUANTITY_CHANGED: "Change the quantity of an item in the cart to 3",
    PROCEED_TO_CHECKOUT: "Proceed to checkout from the cart page",
    ORDER_COMPLETED: "Complete the order with test payment details",
    FILTER_PRODUCTS: "Filter products by category 'Automotive Parts'",
    VIEW_PROMOTIONS: "View current promotions and deals",
    APPLY_COUPON: "Apply coupon code 'SAVE10' at checkout",
  },
  books: {
    ADD_BOOK: "Add a new book with title 'Test Book' and author 'John Doe'",
    ADD_COMMENT_BOOK: "Add a comment to a book: 'Great read!'",
    BOOK_DETAIL: "View the details of a specific book",
    CONTACT_BOOK: "Fill out the contact form with your details",
    DELETE_BOOK: "Delete a book from your collection",
    EDIT_BOOK: "Edit book details - change the price to $29.99",
    EDIT_USER_BOOK: "Update user profile information",
    FILTER_BOOK: "Filter books by genre 'Science Fiction'",
    LOGIN_BOOK: "Login with username 'testuser' and password 'test123'",
    LOGOUT_BOOK: "Logout from the current session",
    PURCHASE_BOOK: "Purchase a book using test payment details",
    REGISTRATION_BOOK:
      "Register a new user account with email test@example.com",
  },
  cinema: {
    ADD_COMMENT: "Add a comment to a film: 'Excellent movie!'",
    ADD_FILM: "Add a new film with title 'Test Film' and director 'Jane Smith'",
    CONTACT: "Submit a contact form inquiry",
    DELETE_FILM: "Delete a film from the database",
    EDIT_FILM: "Edit film details - update the release year",
    EDIT_USER: "Update user profile settings",
    FILM_DETAIL: "View detailed information about a specific film",
    FILTER_FILM: "Filter films by genre 'Action' and rating above 4 stars",
    LOGIN: "Login with email user@example.com and password test123",
    LOGOUT: "Logout from your account",
    REGISTRATION: "Register a new account with email newuser@example.com",
    SEARCH_FILM: "Search for films containing 'Star Wars'",
  },
};

export default function WebsiteDetail() {
  const params = useParams();
  const websiteName = (params?.name as string)?.toLowerCase();

  const website = websitesData.find(
    (w) => w.name.toLowerCase() === websiteName
  );

  const useCasesKey =
    websiteName === "autozone"
      ? "autozone"
      : websiteName === "autobooks"
        ? "books"
        : websiteName === "autocinema"
          ? "cinema"
          : "autozone";

  const useCases = useCaseCatalogues[useCasesKey] || [];
  const prompts = useCasePrompts[useCasesKey] || {};

  if (!website) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
        <Title as="h1" className="text-3xl font-bold mb-4">
          Website Not Found
        </Title>
        <Text className="text-gray-400 mb-6">
          {`The website you're looking for doesn't exist.`}
        </Text>
        <Link href={routes.websites}>
          <Button>Back to All Projects</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full px-6 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:max-w-7xl 2xl:mx-auto">
      <div className="flex items-center gap-4 self-end mt-6 mb-8">
        <a
          href="https://github.com/autoppia"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-white text-black px-3 py-2 rounded-full text-sm font-medium transition-colors duration-200 border border-gray-200 hover:bg-gray-50"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          <span className="hidden sm:inline">GitHub</span>
        </a>
      </div>

      <div className="mb-6">
        <Link
          href={routes.websites}
          className="text-blue-400 hover:text-blue-300 inline-flex items-center mb-4"
        >
          ← Back to All Projects
        </Link>
        <Title as="h1" className="text-3xl md:text-4xl font-bold mb-2">
          {website.name}
        </Title>
        <Text className="text-gray-400 text-lg">Origin: {website.origin}</Text>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div>
          <WidgetCard title="Preview" className="h-full">
            <div className="relative w-full h-64 bg-gray-900 rounded-lg overflow-hidden">
              <Image
                src={website.image}
                alt={website.name}
                fill
                className="object-cover"
              />
            </div>
          </WidgetCard>
        </div>

        <div className="space-y-6">
          <WidgetCard title="Website Information">
            <div className="space-y-4">
              <div>
                <Text className="text-sm text-gray-400 mb-1">Description</Text>
                <Text>
                  A synthetic {website.origin}-inspired web application designed
                  for testing web agents in realistic scenarios.
                </Text>
              </div>
              <div>
                <Text className="text-sm text-gray-400 mb-1">Website URL</Text>
                <a
                  href={website.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-2"
                >
                  {website.href}
                  <LuExternalLink className="h-4 w-4" />
                </a>
              </div>
              <div>
                <Text className="text-sm text-gray-400 mb-1">Total Tasks</Text>
                <Text>
                  Easy: {website.totalTasks[0]} | Medium:{" "}
                  {website.totalTasks[1]} | Hard: {website.totalTasks[2]}
                </Text>
              </div>
            </div>
          </WidgetCard>

          {!website.isComingSoon && (
            <Link href={routes.agent_run} className="block">
              <Button size="lg" className="w-full font-semibold">
                {/* <PiFlask className="mr-2" /> */}
                Test Your Agent on This Project
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="mb-12">
        <Title as="h2" className="text-2xl font-bold mb-6">
          Use Cases
        </Title>

        {website.isComingSoon ? (
          <div className="text-center py-12 bg-gray-900/50 rounded-lg">
            <Text className="text-gray-400 text-lg">
              Use cases coming soon for this website
            </Text>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {useCases.map((useCase) => (
              <WidgetCard
                key={useCase.id}
                className="hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <Title as="h3" className="text-lg font-semibold">
                    {useCase.name}
                  </Title>
                  <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded">
                    #{useCase.id}
                  </span>
                </div>
                <div className="space-y-2">
                  <Text className="text-sm text-gray-400">Example Prompt:</Text>
                  <Text className="text-sm bg-gray-900/50 p-3 rounded border border-gray-800">
                    {prompts[useCase.name] ||
                      `Perform ${useCase.name} action on the website`}
                  </Text>
                </div>
              </WidgetCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
