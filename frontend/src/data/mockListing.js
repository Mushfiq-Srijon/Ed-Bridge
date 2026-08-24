const mockListings = [
  {
    id: 1,
    title: "Physics Textbook - 3rd Edition",
    description:
      "A well-maintained physics textbook suitable for undergraduate students. Some pages contain light highlighting.",
    category: "Textbooks",
    condition: "Good",
    originalPrice: 1200,
    askingPrice: 800,
    area: "Dhaka",
    educationLevel: "University",
    seller: {
      name: "Rahim Ahmed",
      rating: 4.7,
      reviews: 12,
      verified: true,
    },
    subjectTags: ["Physics", "PHY101"],
    image:
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=800&q=80",
    status: "Active",
  },

  {
    id: 2,
    title: "Database System Concepts",
    description:
      "Database textbook in very good condition. Useful for database courses and exam preparation.",
    category: "Textbooks",
    condition: "Like New",
    originalPrice: 1500,
    askingPrice: 1000,
    area: "Dhaka",
    educationLevel: "University",
    seller: {
      name: "Nusrat Jahan",
      rating: 4.9,
      reviews: 18,
      verified: true,
    },
    subjectTags: ["Database", "CSE", "CSE2200"],
    image:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80",
    status: "Active",
  },

  {
    id: 3,
    title: "Scientific Calculator",
    description:
      "Casio scientific calculator. Fully functional and suitable for university mathematics and engineering courses.",
    category: "Instruments",
    condition: "Good",
    originalPrice: 1800,
    askingPrice: 1100,
    area: "Uttara",
    educationLevel: "University",
    seller: {
      name: "Tanvir Hasan",
      rating: 4.5,
      reviews: 7,
      verified: true,
    },
    subjectTags: ["Mathematics", "Engineering"],
    image:
      "https://images.unsplash.com/photo-1617957743097-0d3e2e9c9c85?auto=format&fit=crop&w=800&q=80",
    status: "Active",
  },

  {
    id: 4,
    title: "Arduino Uno Development Board",
    description:
      "Arduino Uno board for academic projects and laboratory work. Used for one semester.",
    category: "Lab Equipment",
    condition: "Good",
    originalPrice: 1400,
    askingPrice: 900,
    area: "Mirpur",
    educationLevel: "University",
    seller: {
      name: "Sakib Khan",
      rating: 4.6,
      reviews: 9,
      verified: false,
    },
    subjectTags: ["Electronics", "Embedded Systems"],
    image:
      "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=800&q=80",
    status: "Active",
  },

  {
    id: 5,
    title: "Engineering Mathematics Notes",
    description:
      "Handwritten and organized mathematics notes covering calculus, differential equations and linear algebra.",
    category: "Study Materials",
    condition: "Like New",
    originalPrice: 500,
    askingPrice: 300,
    area: "Dhanmondi",
    educationLevel: "University",
    seller: {
      name: "Maliha Rahman",
      rating: 4.8,
      reviews: 15,
      verified: true,
    },
    subjectTags: ["Mathematics", "MATH101"],
    image:
      "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80",
    status: "Active",
  },

  {
    id: 6,
    title: "C++ Programming Book",
    description:
      "Beginner-friendly C++ programming book. Minor writing on a few pages.",
    category: "Textbooks",
    condition: "Fair",
    originalPrice: 1000,
    askingPrice: 450,
    area: "Mohammadpur",
    educationLevel: "University",
    seller: {
      name: "Arif Hossain",
      rating: 4.3,
      reviews: 5,
      verified: false,
    },
    subjectTags: ["C++", "Programming", "CSE"],
    image:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80",
    status: "Active",
  },

  {
    id: 7,
    title: "Chemistry Laboratory Equipment Set",
    description:
      "Basic laboratory equipment set suitable for university chemistry laboratory courses.",
    category: "Lab Equipment",
    condition: "Good",
    originalPrice: 2500,
    askingPrice: 1600,
    area: "Chittagong",
    educationLevel: "University",
    seller: {
      name: "Farhan Karim",
      rating: 4.4,
      reviews: 8,
      verified: true,
    },
    subjectTags: ["Chemistry", "Laboratory"],
    image:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80",
    status: "Active",
  },

  {
    id: 8,
    title: "Data Structures & Algorithms Book",
    description:
      "Useful DSA reference book covering sorting, searching, graphs and trees.",
    category: "Textbooks",
    condition: "Like New",
    originalPrice: 1300,
    askingPrice: 950,
    area: "Bashundhara",
    educationLevel: "University",
    seller: {
      name: "Zarif Islam",
      rating: 4.9,
      reviews: 21,
      verified: true,
    },
    subjectTags: ["DSA", "CSE", "Algorithms"],
    image:
      "https://images.unsplash.com/photo-1531072901881-d644216d4bf9?auto=format&fit=crop&w=800&q=80",
    status: "Active",
  },
];

export default mockListings;