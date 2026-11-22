// ✏️  Edit this file to change your wishlist.
//
// Each wish can have:
//   name        (required)  What you want
//   description (optional)  Size, colour, details…
//   price       (optional)  Approximate price, e.g. "€25"
//   link        (optional)  Where to buy it
//   image       (optional)  Image URL, or a file in the images/ folder, e.g. "images/scarf.jpg"
//   priority    (optional)  "high", "medium" or "low"  (default: "medium")
//   category    (optional)  Any label you like, e.g. "Books", "Clothes"

const WISHLIST = {
  title: "My Christmas Wishlist",
  owner: "Julia",
  message: "Thank you for thinking of me! 🎄 Here are a few things that would make me happy this year.",

  wishes: [
    {
      name: "Cozy wool scarf",
      description: "Something soft in dark green or burgundy.",
      price: "€30",
      priority: "high",
      category: "Clothes",
    },
    {
      name: "A good novel",
      description: "Surprise me — I love mysteries and historical fiction.",
      price: "€15",
      priority: "medium",
      category: "Books",
    },
    {
      name: "Scented candle",
      description: "Cinnamon, pine or vanilla.",
      price: "€20",
      priority: "low",
      category: "Home",
    },
    {
      name: "Wireless headphones",
      description: "Over-ear, with noise cancelling.",
      price: "€150",
      link: "https://example.com",
      priority: "high",
      category: "Tech",
    },
    {
      name: "Board game for game nights",
      description: "Something that works well with 4–6 players.",
      price: "€40",
      priority: "medium",
      category: "Games",
    },
  ],
};
