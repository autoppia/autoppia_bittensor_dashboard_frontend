/* src/data/websites-data.ts */

export type UseCase = {
  name: string;
  examplePrompt: string[];
};

export type TaskExample = {
  title: string;
  prompt: string;
};

export type WebsiteDataType = {
  name: string;
  slug: string; // URL-friendly version: lowercase with hyphens
  portValidator: string;
  href: string;
  origin: string;
  totalTasks: number[]; // [easy, medium, hard] - deprecated, use stats below
  image: string;
  isComingSoon?: boolean;
  color: string;
  description?: string;
  useCases: UseCase[]; // already added
  taskExamples?: TaskExample[]; // NEW: Task Examples
  comingSoonNote?: string; // NEW: note to show under section
  // New stats fields:
  avgDifficulty: number; // Average difficulty: 1-10 scale
  completionRate: number; // Success/completion rate: 0-100%
};
/**
 *  Lista de webs con su puerto público del validador.
 *  Se usa en <FilterBoard /> para construir el filtro "Ports".
 */

export const websitesData: WebsiteDataType[] = [
  {
    name: "Autoppia Cinema",
    slug: "autocinema",
    portValidator: "8000",
    href: "http://autocinema.autoppia.com",
    origin: "Movie Database",
    totalTasks: [30, 20, 12],
    image: "/images/web1.png",
    color: "#9333EA",
    description: "Movie catalog with search, reviews, and user management.",
    avgDifficulty: 6.5,
    completionRate: 78,
    useCases: [
      {
        name: "Registration",
        examplePrompt: [
          "Register with the following username:johndoe,email:johndoe@gmail.com and password:mypass123",
          "Create a new account with username:sarahlee,email:sarahlee@gmail.com and password:secure456",
        ],
      },
      {
        name: "Login",
        examplePrompt: [
          "Login for the following username:user123 and password:password123",
          "Sign in to the website username:admin and password:admin123",
        ],
      },
      {
        name: "Logout",
        examplePrompt: [
          "Login with username:user1 and password:pass123, then logout",
          "Authenticate with username:cinephile and password:movie123, then end my session",
        ],
      },
      {
        name: "Film Detail",
        examplePrompt: [
          "Navigate to The Matrix movie page",
          "Go to the film details page for Interstellar by Christopher Nolan",
        ],
      },
      {
        name: "Search Film",
        examplePrompt: [
          "Look for the film 'The Shawshank Redemption'",
          "Search for Interstellar in the movie database",
        ],
      },
      {
        name: "Add Film",
        examplePrompt: [
          "Add the movie 'The Grand Budapest Hotel' directed by 'Wes Anderson'",
          "Add the film 'Whiplash' released in 2014",
        ],
      },
      {
        name: "Edit Film",
        examplePrompt: [
          "Update the director of The Matrix to Christopher Nolan",
          "Modify the release year of Pulp Fiction to 1994",
        ],
      },
      {
        name: "Delete Film",
        examplePrompt: [
          "Remove The Matrix, a film released after 2014, from the database",
          "Permanently delete The Godfather, which has a duration greater than 175 minutes",
        ],
      },
      {
        name: "Contact",
        examplePrompt: [
          "Send a contact form with the subject 'Test Subject'",
          "Fill out the contact form and include 'Hello, I would like information about your services' in the message",
        ],
      },
      {
        name: "Edit User Profile",
        examplePrompt: [
          "Login for the following username:user1 and password:pass123. Update your first name to John.",
          "Login for the following username:filmfan and password:pass456. Modify your bio to include your passion for cinema.",
        ],
      },
      {
        name: "Filter Film",
        examplePrompt: [
          "Filter movies released in the year 1994",
          "Browse films from 2010 in the Drama genre",
        ],
      },
      {
        name: "Add Comment",
        examplePrompt: [
          "Navigate to a movie and add a comment about Inception",
          "Post a comment containing the word 'masterpiece'",
        ],
      },
    ],
    comingSoonNote: "More task examples coming soon.",
  },
  {
    name: "Autoppia Books",
    slug: "autobooks",
    portValidator: "8001",
    href: "http://autobooks.autoppia.com",
    origin: "Book Store",
    totalTasks: [28, 18, 10],
    image: "/images/web2.png",
    color: "#10B981",
    description:
      "Book store with shopping cart, reviews, and e-commerce features.",
    avgDifficulty: 7.2,
    completionRate: 74,
    useCases: [
      {
        name: "Registration",
        examplePrompt: [
          "Register with the following username:bookworm,email:bookworm@gmail.com and password:read123",
          "Create a new account with username:reader99,email:reader99@gmail.com and password:pages456",
        ],
      },
      {
        name: "Login",
        examplePrompt: [
          "Login for the following username:bookfan and password:book123",
          "Sign in to the website username:author1 and password:write456",
        ],
      },
      {
        name: "Logout",
        examplePrompt: [
          "Login with username:user1 and password:pass123, then logout",
          "Fill the Login Form with username:booklover and password:love789, once logged in, logout from my account",
        ],
      },
      {
        name: "Book Detail",
        examplePrompt: [
          "Navigate to 'The Housemaid Is Watching' book page",
          "Go to the book details page for 'Art of Computer Programming' by Donald Knuth",
        ],
      },
      {
        name: "Search Book",
        examplePrompt: [
          "Look for the book 'Lidia's Italian-American Kitchen'",
          "Search for 'Elementary Statistics' in the book database",
        ],
      },
      {
        name: "Add Book",
        examplePrompt: [
          "First, authenticate with username 'user123' and password 'PASSWORD'. Then, add the book 'A Guide to the Good Life' authored by 'William B. Irvine'",
          "Once logged in as 'reader1' with the password 'PASSWORD', add the book 'The Midnight Library' with a page_count under 320 pages",
        ],
      },
      {
        name: "Edit Book",
        examplePrompt: [
          "Sign in with username: user1 and password: pass123. After that, update the author of your book to Jamie Oliver.",
          "Using username: bookadmin and password: admin123, sign into the platform. Then change the rating of your book to 4.9.",
        ],
      },
      {
        name: "Delete Book",
        examplePrompt: [
          "Log in (username: user1, password: pass123) and remove 'My Book'.",
          "After logging in with username: reader1 and password: read123, erase all records of 'Old Book'.",
        ],
      },
      {
        name: "Contact",
        examplePrompt: [
          "Send a contact form with the subject 'Book Inquiry'",
          "Fill out the contact form and include 'I need help finding a book' in the message",
        ],
      },
      {
        name: "Edit User Profile",
        examplePrompt: [
          "Login for the following username:bookfan and password:pass456. Modify your bio to include your passion for bookworm.",
          "Login for the following username:author101 and password:pass654. Update your favorite genre to Science.",
        ],
      },
      {
        name: "Filter Book",
        examplePrompt: [
          "Filter books released in the year 2005",
          "Browse books from 2019 in the Story genre",
        ],
      },
      {
        name: "Add Comment",
        examplePrompt: [
          "Navigate to a book 'Fourth Win' and add a comment 'beautiful book'.",
          "Write a detailed review for the book 'Elementary Statistics' with a comment that does NOT contain the word 'boring'",
        ],
      },
      {
        name: "Shopping Cart",
        examplePrompt: [
          "Login with username: user1 and password: pass123. After logging in, add 'Fourth Win' to your shopping cart.",
          "Authenticate using username: reader1 and password: read123. After that, add a 'Comics' genre book with less than 400 pages to your shopping cart.",
        ],
      },
      {
        name: "Purchase Book",
        examplePrompt: [
          "First, authenticate with username: user1 and password: pass123. After successful login, purchase the book titled 'Klara and the Sun' from the year 2021.",
          "Log in with username: buyer1 and password: buy123. Then proceed to buy a book in the 'Education' genre with more than 700 pages.",
        ],
      },
    ],
    comingSoonNote: "More task examples coming soon.",
  },
  {
    name: "Autozone",
    slug: "autozone",
    portValidator: "8002",
    href: "http://autozone.autoppia.com",
    origin: "Amazon",
    totalTasks: [25, 15, 8],
    image: "/images/web3.png",
    color: "#EF4444",
    description:
      "E-commerce storefront for product search, carts, and checkout.",
    avgDifficulty: 6.8,
    completionRate: 82,
    useCases: [
      {
        name: "View Product Detail",
        examplePrompt: [
          "Show me details for the Espresso Machine",
          "View product page for a 'Kitchen' item with rating above 4.6",
        ],
      },
      {
        name: "Search Product",
        examplePrompt: [
          "Search for kitchen appliances",
          "Find products matching 'Espresso Machine'",
        ],
      },
      {
        name: "Add to Cart",
        examplePrompt: [
          "Add Air Fryer to my cart",
          "Put 2 units of the Stainless Steel Cookware Set in my shopping cart",
        ],
      },
      {
        name: "View Cart",
        examplePrompt: [
          "View my shopping cart",
          "Show me what's in my cart right now",
        ],
      },
      {
        name: "Carousel Scroll",
        examplePrompt: [
          "Scroll right in the 'Kitchen Appliances' carousel",
          "Navigate left in the 'Best Sellers' carousel",
        ],
      },
      {
        name: "Change Quantity",
        examplePrompt: [
          "Update quantity of Espresso Machine in my cart from 1 to 2",
          "Increase quantity of the Electric Kettle by 5",
        ],
      },
      {
        name: "Proceed to Checkout",
        examplePrompt: [
          "Proceed to checkout with my current cart items",
          "Go to checkout with my 3 items worth $379.97",
        ],
      },
      {
        name: "Checkout Started",
        examplePrompt: [
          "Click on Buy now to process checkout with my cart items",
          "I'm ready to checkout now, click Buy now.",
        ],
      },
      {
        name: "Order Completed",
        examplePrompt: [
          "Complete Buying 2 units of the Apple Watch",
          "Finalize the order with 3 units of 'Smart Watch'",
        ],
      },
    ],
    comingSoonNote: "More task examples coming soon.",
  },
  {
    name: "AutoDining",
    slug: "autodining",
    portValidator: "8003",
    href: "http://autodining.autoppia.com",
    origin: "OpenTable",
    totalTasks: [22, 14, 9],
    image: "/images/web4.png",
    color: "#F59E0B",
    description:
      "Restaurant booking platform with search, menus, and reservations.",
    avgDifficulty: 7.5,
    completionRate: 71,
    useCases: [
      {
        name: "Date Dropdown Opened",
        examplePrompt: [
          "Open the date selector for my booking.",
          "Click on the calendar icon to select a date after June 15th.",
        ],
      },
      {
        name: "Time Dropdown Opened",
        examplePrompt: [
          "Click on the time field to choose a reservation time.",
          "Open the time selector for dinner",
        ],
      },
      {
        name: "People Dropdown Opened",
        examplePrompt: [
          "Open the guest number selection for my table.",
          "Select the party size dropdown for a group larger than 6 people.",
        ],
      },
      {
        name: "Search Restaurant",
        examplePrompt: [
          "Search for 'italian restaurants in downtown'",
          "Look up places to eat that serve vegan food",
        ],
      },
      {
        name: "View Restaurant",
        examplePrompt: [
          "Show me details for 'The Royal Dine'",
          "Show me the page for a restaurant with rating above 4.5",
        ],
      },
      {
        name: "View Full Menu",
        examplePrompt: [
          "Show the full menu for 'The Royal Dine' for 2 people for dinner on July 18.",
          "Display the complete menu for lunch at 'Sushi Palace'",
        ],
      },
      {
        name: "Collapse Menu",
        examplePrompt: [
          "Hide the menu for 'The Royal Dine'.",
          "Close the expanded menu view",
        ],
      },
      {
        name: "Book Restaurant",
        examplePrompt: [
          "I'd like to book a table at the restaurant which name 'The Royal Dine' for 2 people on 2025-05-16 at 1:30 PM.",
          "Book a table for 7 or more people on '2025-08-06' at a time that is NOT '12:30 PM' with a rating of 5 or less.",
        ],
      },
      {
        name: "Country Selected",
        examplePrompt: [
          "Select 'India' as the country for my phone number while reserving a table at Zen Sushi.",
          "Choose a country other than United States for my reservation at Copper Kitchen.",
        ],
      },
      {
        name: "Occasion Selected",
        examplePrompt: [
          "This reservation is for a 'birthday'.",
          "Select 'business dinner' as the occasion type",
        ],
      },
      {
        name: "Reservation Complete",
        examplePrompt: [
          "Complete my reservation for 'The Royal Dine' on July 18th at 1:30 PM for 2 people. My phone is 123, it's for a birthday, and special request is 'a quiet table'.",
          "Finish booking at 'Mountain Top Grill' for 6 people at 6:15 PM on August 5. My phone is 111-222-3333. Please note it's for a corporate event.",
        ],
      },
      {
        name: "Scroll View",
        examplePrompt: [
          "Scroll right to see more available time slots.",
          "Scroll to the right in the list where the section title does NOT contain 'Award-winning'",
        ],
      },
    ],
    comingSoonNote: "More task examples coming soon.",
  },
  {
    name: "AutoCRM",
    slug: "autocrm",
    portValidator: "8004",
    href: "http://autocrm.autoppia.com",
    origin: "Legal CRM",
    totalTasks: [26, 16, 11],
    image: "/images/web5.png",
    color: "#3B82F6",
    description:
      "Legal case management with matters, clients, documents, and time tracking.",
    avgDifficulty: 8.1,
    completionRate: 68,
    useCases: [
      {
        name: "View Matter Details",
        examplePrompt: [
          "Go to the Matters page and click on 'Estate Planning' to view the details of that particular matter",
          "View details of the matter whose client name is 'Jones Legal'",
        ],
      },
      {
        name: "Add New Matter",
        examplePrompt: [
          "Create a matter named 'New Matter', with client 'Acme Co.' and status 'Active'.",
          "Add a new matter where the name is not 'Employment Agreement' and the client is 'Delta Partners'.",
        ],
      },
      {
        name: "Archive Matter",
        examplePrompt: [
          "Archive the matter whose status is set to 'Active'",
          "Archive the 'Estate Planning' matter if it was not updated 'Today'",
        ],
      },
      {
        name: "Delete Matter",
        examplePrompt: [
          "Delete the matter whose status is set to 'Active'",
          "Delete the matter where matter name is 'Contract Review' and the client name is 'Jones Legal'",
        ],
      },
      {
        name: "View Client Details",
        examplePrompt: [
          "View details of client, whose client name is 'jessica brown' and email is 'jbrown@samplemail.com'",
          "View client details if its status is 'active', its email is 'team@smithco.com' and matters are not '3'",
        ],
      },
      {
        name: "Search Client",
        examplePrompt: [
          "Search for clients named 'Smith'.",
          "Find any clients whose name contains 'Brown'.",
        ],
      },
      {
        name: "Document Deleted",
        examplePrompt: [
          "Delete the document named 'Retainer-Agreement.pdf'.",
          "Delete the document with version equal to 'v3' and status equal to 'Submitted'",
        ],
      },
      {
        name: "New Calendar Event Added",
        examplePrompt: [
          "Add a new calendar event on 2025-05-13 at 9:00am called 'Team Sync' with a Filing type.",
          "Schedule an Internal event on 2025-05-07 at 2:30pm titled 'Internal Review'.",
        ],
      },
      {
        name: "New Log Added",
        examplePrompt: [
          "Add a time log with matter 'Trademark Filing', description 'Prepare documents', and hours '2.5'.",
          "Create a new time log with matter 'Startup Incorporation', description 'Setup docs', and hours greater than '3'.",
        ],
      },
      {
        name: "Log Delete",
        examplePrompt: [
          "Delete the time log for 'Estate Planning' that recorded 2 hours.",
          "Remove time logs for 'Peak Ventures' with 3 hours and 'Billable' status.",
        ],
      },
      {
        name: "Change User Name",
        examplePrompt: [
          "Change my user name to 'Muhammad Ali'.",
          "Set my user name to something that is not 'Guest User'.",
        ],
      },
    ],
    comingSoonNote: "More task examples coming soon.",
  },
  {
    name: "AutoMail",
    slug: "automail",
    portValidator: "8005",
    href: "http://automail.autoppia.com",
    origin: "Gmail",
    totalTasks: [24, 15, 10],
    image: "/images/web6.png",
    color: "#8B5CF6",
    description:
      "Email client with compose, labels, search, and organization features.",
    avgDifficulty: 7.8,
    completionRate: 72,
    useCases: [
      {
        name: "View Email",
        examplePrompt: [
          "View the email where email_from equals 'alice.smith@company.com' and subject equals 'Project Kickoff Meeting'",
          "View the email where subject contains 'Update'",
        ],
      },
      {
        name: "Star Email",
        examplePrompt: [
          "Star the email where from_email equals 'grace.lee@company.com' and subject equals 'Team Outing Plan'",
          "Star the email with ID 'email7'",
        ],
      },
      {
        name: "Mark Email as Important",
        examplePrompt: [
          "Mark the email where from equals 'david.brown@company.com' and subject equals 'Q2 Report Feedback' and is_important equals 'True'.",
          "Mark the message about 'Client Proposal Review' as high priority",
        ],
      },
      {
        name: "Mark as Unread",
        examplePrompt: [
          "Mark the email from 'emma.davis@yahoo.com' with subject 'Community Forum Update' as unread",
          "Set the email about 'Exclusive Offer: 20% Off' back to unread",
        ],
      },
      {
        name: "Delete Email",
        examplePrompt: [
          "Delete the email from 'alice.smith@company.com' with subject 'Project Kickoff Meeting'",
          "Remove the message about 'Project Kickoff Meeting'",
        ],
      },
      {
        name: "Mark as Spam",
        examplePrompt: [
          "Mark the email from 'alice.smith@company.com' with subject 'Project Kickoff Meeting' as spam",
          "Flag the message about 'Project Kickoff Meeting' as spam",
        ],
      },
      {
        name: "Add Label",
        examplePrompt: [
          "Add the label 'Work' to the email from 'alice.smith@company.com'",
          "Categorize the email from 'nina.chen@design.io' with the label 'Updates'",
        ],
      },
      {
        name: "Create Label",
        examplePrompt: [
          "Create a label named 'Work' with color 'blue'",
          "Add the label 'Travel' with a purple color",
        ],
      },
      {
        name: "Send Email",
        examplePrompt: [
          "Send the email to john.doe@gmail.com with subject 'Project Timeline Update'",
          "Dispatch the email to john.doe@gmail.com",
        ],
      },
      {
        name: "Save as Draft",
        examplePrompt: [
          "Save the email as draft where email equals jane.doe@example.com",
          "Keep the email as draft where subject contains 'Budget Review Meeting'",
        ],
      },
      {
        name: "Theme Changed",
        examplePrompt: ["Switch to dark theme", "Enable system default theme"],
      },
      {
        name: "Search Email",
        examplePrompt: [
          "Search for query containing 'Weekly Newsletter'",
          "Find emails from 'levi.brooks@org.com'",
        ],
      },
    ],
    comingSoonNote: "More task examples coming soon.",
  },
  {
    name: "AutoDelivery",
    slug: "autodelivery",
    portValidator: "8006",
    href: "http://autodelivery.autoppia.com",
    origin: "Uber Eats",
    totalTasks: [27, 17, 12],
    image: "/images/web7.png",
    color: "#EC4899",
    description:
      "Food delivery platform with restaurant search, cart, and order placement.",
    avgDifficulty: 7.4,
    completionRate: 76,
    useCases: [
      {
        name: "Search Restaurant",
        examplePrompt: [
          "Search for restaurants serving Italian cuisine.",
          "Find restaurants with 'Sushi' in their name.",
        ],
      },
      {
        name: "View Restaurant",
        examplePrompt: [
          "View details for 'Pizza Palace'.",
          "Show me the menu of the restaurant with cuisine 'Japanese'.",
        ],
      },
      {
        name: "Delete Review",
        examplePrompt: [
          "Delete my review for 'Pizza Palace' written on 2025-06-02.",
          "Remove the review I wrote with a rating of 4.",
        ],
      },
      {
        name: "Back to All Restaurants",
        examplePrompt: [
          "Go back to the list of all restaurants from 'Pizza Palace'.",
          "Navigate back to all restaurants.",
        ],
      },
      {
        name: "Add to Cart Modal Open",
        examplePrompt: [
          "Open the add-to-cart modal for 'Margherita Pizza' at 'Pizza Palace'.",
          "Show the add-to-cart modal for 'Salmon Nigiri'.",
        ],
      },
      {
        name: "Item Incremented",
        examplePrompt: [
          "Increase the quantity of 'Margherita Pizza' to 2.",
          "Add one more 'Salmon Nigiri' to my cart.",
        ],
      },
      {
        name: "Add to Cart",
        examplePrompt: [
          "Add when item equals 'Margherita Pizza' and size equals 'Large' to my cart.",
          "Add when item equals 'California Roll' and quantity equals '3'.",
        ],
      },
      {
        name: "Open Checkout Page",
        examplePrompt: [
          "Go to the checkout page when item equals 'Margherita Pizza' in the cart.",
          "Go to the checkout page when item equals 'Chicken Tikka Masala' and price equals '13.99' and quantity equals '3'.",
        ],
      },
      {
        name: "Dropoff Preference",
        examplePrompt: [
          "Set dropoff preference where delivery_preference equals 'Leave at door'.",
          "Set dropoff preference where delivery_preference not equals 'Call on arrival'.",
        ],
      },
      {
        name: "Address Added",
        examplePrompt: [
          "Add a new delivery address: 456 Oak St.",
          "Save 321 Maple Rd as my delivery address.",
        ],
      },
      {
        name: "Empty Cart",
        examplePrompt: ["Empty my cart.", "Clear my shopping cart."],
      },
      {
        name: "Place Order",
        examplePrompt: [
          "Place an order where restaurant equals 'Pizza Palace' and mode equals 'delivery' and item equals 'Chocolate Lava Cake'.",
          "Place an order where username equals 'Diana Patel' and phone not equal '+1-555-456-7890'.",
        ],
      },
    ],
    comingSoonNote: "More task examples coming soon.",
  },
  {
    name: "AutoLodge",
    slug: "autolodge",
    portValidator: "8007",
    href: "http://autolodge.autoppia.com",
    origin: "Airbnb",
    totalTasks: [25, 16, 10],
    image: "/images/web8.png",
    color: "#06B6D4",
    description:
      "Hotel and lodging booking platform with search, wishlist, and reservations.",
    avgDifficulty: 7.6,
    completionRate: 70,
    useCases: [
      {
        name: "Search Hotel",
        examplePrompt: [
          "Search for hotels where search term is Murree from July 25 to July 28 for 2 adults and 1 child",
          "Find a hotel where search term is Mall Road for 3 adults and 1 infant",
        ],
      },
      {
        name: "View Hotel",
        examplePrompt: [
          "I like the one in Murree with 5-star rating and free breakfast. Can you show me more about it?",
          "Show me the villa hosted by someone with great reviews - the one that says 'hosted since 2016'.",
        ],
      },
      {
        name: "Add to Wishlist",
        examplePrompt: [
          "Add that beautiful hotel in Skardu with the river view to my wishlist.",
          "I want to save the one in Islamabad with the rooftop pool and gym.",
        ],
      },
      {
        name: "Share Hotel",
        examplePrompt: [
          "Share the hotel listing with zoe.baker@civicgroup.org where the title does NOT contain lcu, location does NOT contain pep, rating equals 4.5",
          "Send to zoe.baker@civicgroup.org any hotel (host: Brian) for five guests, price up to $198, rating exactly 4.5",
        ],
      },
      {
        name: "Increase Number of Guests",
        examplePrompt: [
          "Increase number of guests where guests_to is 3.",
          "Increase guests count to 4.",
        ],
      },
      {
        name: "Reserve Hotel",
        examplePrompt: [
          "Reserve hotel from 5th to 9th August for 2 guests.",
          "Reserve the mountain view cottage we just looked at for 3 guests, next weekend.",
        ],
      },
      {
        name: "Edit Check-In/Out Dates",
        examplePrompt: [
          "Edit checkin checkout dates where check-in date greater than August 12, 2025 and check-out date less than or equal September 1, 2025.",
          "Edit checkin checkout dates where check-in date equal to October 2, 2025 and check-out date greater than October 5, 2025.",
        ],
      },
      {
        name: "Confirm and Pay",
        examplePrompt: [
          "Everything looks great - the beach house in Malibu from Aug 15-19 for 2 guests. Use my Visa ending in 4242 to confirm and pay.",
          "Book the downtown loft for 2 guests from July 25-28. Pay in PKR using my saved card.",
        ],
      },
      {
        name: "Message Host",
        examplePrompt: [
          "Message host Natalie where message contains 'ly check-in possible?', title contains 'cozy' and location equals 'New York'",
          "Message host where message equals 'I will be arriving around 10pm.'",
        ],
      },
      {
        name: "Back to All Hotels",
        examplePrompt: [
          "Take me back to the hotel dashboard.",
          "Show me the dashboard with all listings.",
        ],
      },
    ],
    comingSoonNote: "More task examples coming soon.",
  },
  {
    name: "AutoConnect",
    slug: "autoconnect",
    portValidator: "8008",
    href: "http://autoconnect.autoppia.com",
    origin: "LinkedIn",
    totalTasks: [23, 14, 9],
    image: "/images/web9.png",
    color: "#0EA5E9",
    description:
      "Professional networking platform with profiles, posts, jobs, and connections.",
    avgDifficulty: 6.9,
    completionRate: 79,
    useCases: [
      {
        name: "View User Profile",
        examplePrompt: [
          "View the profile of user 'janedoe'.",
          "Open Jane Doe's profile from a post header.",
        ],
      },
      {
        name: "Connect with User",
        examplePrompt: [
          "Connect with Jane Doe.",
          "Send a connection request to John Smith.",
        ],
      },
      {
        name: "Post Status",
        examplePrompt: [
          "Post a status saying 'hi'",
          "Share an update about my new project",
        ],
      },
      {
        name: "Like Post",
        examplePrompt: [
          "Like the post where the poster wrote 'I finally got my AWS certification!'",
          "Like the post that contains 'Excited to attend PyCon this year!'",
        ],
      },
      {
        name: "Comment on Post",
        examplePrompt: [
          "Comment 'Great work!' on the post with poster content 'Just released a new app version!'",
          "Comment 'Thanks for sharing!' on the post that says '5 tips for improving frontend performance.'",
        ],
      },
      {
        name: "Apply for Job",
        examplePrompt: [
          "Apply for the Frontend Developer job at Tech Innovations (Remote).",
          "Apply for the Backend Engineer position at DataStream Inc. in Boston, MA.",
        ],
      },
      {
        name: "Search Users",
        examplePrompt: [
          "Search for users with the query 'al'.",
          "Find professionals named 'Smith'",
        ],
      },
      {
        name: "Follow Page",
        examplePrompt: [
          "Follow the Adobe company page.",
          "Follow Microsoft's company page",
        ],
      },
      {
        name: "View Job",
        examplePrompt: [
          "View the job posting for 'Senior Frontend Developer' at Tech Innovations.",
          "Check the job details for a Frontend Developer position located in San Francisco.",
        ],
      },
      {
        name: "Search Jobs",
        examplePrompt: [
          "Search for jobs with the query 'fro'.",
          "Find jobs where the query contains 'engineer'.",
        ],
      },
    ],
    comingSoonNote: "More task examples coming soon.",
  },
  {
    name: "AutoWork",
    slug: "autowork",
    portValidator: "8009",
    href: "http://autowork.autoppia.com",
    origin: "Upwork",
    totalTasks: [21, 13, 8],
    image: "/images/web10.png",
    color: "#14B8A6",
    description:
      "Freelancer and consultant hiring platform with job postings and bookings.",
    avgDifficulty: 7.3,
    completionRate: 73,
    useCases: [
      {
        name: "Book a Consultation",
        examplePrompt: [
          "Book a consultation whose name is 'Alexa R'",
          "Book a consultation whose rate is $40.00/hr",
        ],
      },
      {
        name: "Hire Button Clicked",
        examplePrompt: [
          "Hire a consultant whose name is 'Brandon M'",
          "Hire a consultant whose country is 'Morocco'",
        ],
      },
      {
        name: "Select Hiring Team",
        examplePrompt: [
          "Select the hiring team 'Apple' where expert name is 'Ashley C.'",
          "Select the hiring team 'Google' where expert slug is 'alex-r'",
        ],
      },
      {
        name: "Hire Consultant",
        examplePrompt: [
          "The user click 'Hire' button to confirm hiring of a chosen consultation",
          "Confirm hiring of a consultation whose payment type is 'fixed'",
        ],
      },
      {
        name: "Cancel Hire",
        examplePrompt: [
          "The user click 'Cancel' button to cancel the hiring of chosen consultation",
          "Cancel hiring of a consultation whose country is 'Spain'",
        ],
      },
      {
        name: "Post a Job",
        examplePrompt: [
          "User clicks 'Post a job' button to initiate the posting process for a job",
          "Initiates the posting process for a job when the page is 'home'",
        ],
      },
      {
        name: "Write Job Title",
        examplePrompt: [
          "User initiates a process of job posting by writing a strong title of the job",
          "Writes a title of job like web developers job",
        ],
      },
      {
        name: "Search Skill",
        examplePrompt: ["Search a skill 'Go'", "Search a skill 'Python'"],
      },
      {
        name: "Add Skill",
        examplePrompt: [
          "Adds a skill where skill is 'C++'",
          "Adds a skill where skill contains 'C'",
        ],
      },
      {
        name: "Submit Job",
        examplePrompt: [
          "The user submits a job by clicking 'Submit Job Post' button",
          "Submit a job whose budget type is 'fixed'",
        ],
      },
      {
        name: "Close Post Job Window",
        examplePrompt: [
          "The user clicks 'x' button to close the job posting window",
          "Close the window of job whose title is 'Flutter Developers Job'",
        ],
      },
    ],
    comingSoonNote: "More task examples coming soon.",
  },
  {
    name: "AutoCalendar",
    slug: "autocalendar",
    portValidator: "8010",
    href: "http://autocalendar.autoppia.com",
    origin: "Google Calendar",
    totalTasks: [29, 18, 11],
    image: "/images/web11.png",
    color: "#A855F7",
    description:
      "Calendar application with events, reminders, attendees, and multiple views.",
    avgDifficulty: 8.3,
    completionRate: 65,
    useCases: [
      {
        name: "Select Month View",
        examplePrompt: [
          "Switch to month view please.",
          "Show me the entire month on the calendar.",
        ],
      },
      {
        name: "Select Week View",
        examplePrompt: [
          "Switch to week view please.",
          "Show me this week's schedule.",
        ],
      },
      {
        name: "Select Five Days View",
        examplePrompt: [
          "Switch to 5-day view please.",
          "Can you display the workweek view?",
        ],
      },
      {
        name: "Select Day View",
        examplePrompt: [
          "Switch to day view please.",
          "Show me day schedule in detail.",
        ],
      },
      {
        name: "Select Today",
        examplePrompt: ["Go to today's date.", "Jump to today please."],
      },
      {
        name: "Add New Calendar",
        examplePrompt: [
          "Click the add calendar button.",
          "Tap the add calendar icon.",
        ],
      },
      {
        name: "Create Calendar",
        examplePrompt: [
          "Create a 'Projects' calendar for my job-related events.",
          "Set up a 'Fitness' calendar for my workout schedule.",
        ],
      },
      {
        name: "Choose Calendar",
        examplePrompt: [
          "Hide the Personal calendar.",
          "Unselect the 'Study' calendar.",
        ],
      },
      {
        name: "Add Event",
        examplePrompt: [
          "Add an event whose title equals 'Team Meeting' and calendar equals 'Work' and date equals '2025-09-20' and start_time equals '10:00' and end_time equals '11:00'.",
          "Add an event whose location equals 'Library' and recurrence equals 'Monthly' and attendees equals 'test@example.com' and reminders equals '30'.",
        ],
      },
      {
        name: "Cell Clicked",
        examplePrompt: [
          "Click on cell when date equals '2025-09-11' and view equals 'Month'.",
          "Click on cell when view equals 'Week' and date equals '2025-09-30' and hour equals '3'.",
        ],
      },
      {
        name: "Cancel Add Event",
        examplePrompt: [
          "Cancel an event whose title equals 'Team Meeting' and calendar equals 'Work' and date equals '2025-09-20'.",
          "Cancel an event whose location equals 'Library' and recurrence equals 'Monthly'.",
        ],
      },
      {
        name: "Delete Added Event",
        examplePrompt: [
          "Delete an added event whose title equals 'Team Meeting' and calendar equals 'Work'.",
          "Delete an added event whose title not_contains 'Meeting' and calendar contains 'rk'.",
        ],
      },
      {
        name: "Event Wizard Open",
        examplePrompt: [
          "Open the form to add a new event.",
          "I want to edit the 'Team Meeting' event.",
        ],
      },
      {
        name: "Search Submit",
        examplePrompt: ["Search for 'work'", "Find events with 'meeting'"],
      },
      {
        name: "Event Add Reminder",
        examplePrompt: [
          "Add a 30-minute reminder to the event.",
          "I need a reminder 1 hour before.",
        ],
      },
      {
        name: "Event Remove Reminder",
        examplePrompt: [
          "Remove the 30-minute reminder. If it's not there, add it first, then remove it.",
          "I don't need the 1-hour reminder anymore. Please remove it.",
        ],
      },
      {
        name: "Event Add Attendee",
        examplePrompt: [
          "Add 'test@example.com' as an attendee.",
          "Invite 'user1@work.com' to this event.",
        ],
      },
      {
        name: "Event Remove Attendee",
        examplePrompt: [
          "Remove 'test@example.com' from the attendees.",
          "Uninvite 'user1@work.com' from this event.",
        ],
      },
    ],
    comingSoonNote: "More task examples coming soon.",
  },
  {
    name: "AutoList",
    slug: "autolist",
    portValidator: "8011",
    href: "http://autolist.autoppia.com",
    origin: "Trello/Asana",
    totalTasks: [24, 15, 9],
    image: "/images/web12.png",
    color: "#F97316",
    description:
      "Task and team management platform with priorities, dates, and collaboration.",
    avgDifficulty: 7.1,
    completionRate: 75,
    useCases: [
      {
        name: "Add Task Clicked",
        examplePrompt: [
          "Click on the Add Task button to start.",
          "Please click the Add Task button.",
        ],
      },
      {
        name: "Select Date for Task",
        examplePrompt: [
          "Set the date for this task to tomorrow.",
          "Pick next Friday as the due date.",
        ],
      },
      {
        name: "Select Task Priority",
        examplePrompt: [
          "Set the priority to high.",
          "Make this a low priority task.",
        ],
      },
      {
        name: "Task Added",
        examplePrompt: [
          "Add a task whose name equals 'Design new homepage mockup'.",
          "Add a task whose name equals 'Update API documentation' and priority equals 'Low'.",
        ],
      },
      {
        name: "Cancel Task Creation",
        examplePrompt: ["Cancel creating this task.", "Exit without saving."],
      },
      {
        name: "Edit Task Modal Opened",
        examplePrompt: [
          "Edit task modal open whose name equals 'Design new homepage mockup'.",
          "Edit task modal open whose name equals 'Update API documentation' and priority equals 'Low'.",
        ],
      },
      {
        name: "Complete Task",
        examplePrompt: [
          "Complete task whose name equals 'Implement user authentication'.",
          "Complete task whose name equals 'Draft Q3 marketing report' and priority equals 'Low'.",
        ],
      },
      {
        name: "Delete Task",
        examplePrompt: [
          "Delete task whose name equals 'Fix login page CSS bug' from my list.",
          "Delete task whose name not equals 'Finish report' from my list.",
        ],
      },
      {
        name: "Add Team Clicked",
        examplePrompt: [
          "Click on the Add Team button to start.",
          "Please click the Add Team button.",
        ],
      },
      {
        name: "Team Members Added",
        examplePrompt: [
          "Add jane@example.com to the team.",
          "Invite alice@example.com and michael@example.com.",
        ],
      },
      {
        name: "Team Role Assigned",
        examplePrompt: [
          "Assign the developer role to jane@example.com.",
          "Make alice@example.com a tester.",
        ],
      },
      {
        name: "Team Created",
        examplePrompt: [
          "Create a team whose name equals 'Core Platform'.",
          "Create a team whose name equals 'Human Resources' and description equals 'Manages recruitment, employee relations, and company culture.'.",
        ],
      },
    ],
    comingSoonNote: "More task examples coming soon.",
  },
];

export const websitesDataMap = websitesData.reduce(
  (acc, website) => {
    acc[website.name] = website;
    return acc;
  },
  {} as Record<string, WebsiteDataType>
);

export const websitesDataBySlug = websitesData.reduce(
  (acc, website) => {
    acc[website.slug] = website;
    return acc;
  },
  {} as Record<string, WebsiteDataType>
);
