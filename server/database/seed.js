const db = require('./db');
const Book = require('../models/Book');
const SearchLog = require('../models/SearchLog');

async function seedDatabase() {
  console.log("Initializing Blackwater & Co. SQLite Ledger Database...");
  
  // Ensure tables are initialized via db wrapper
  await db.query("SELECT 1 FROM books LIMIT 1;");
  
  // Clear existing records if re-seeding
  await db.execute("DELETE FROM books;");
  await db.execute("DELETE FROM search_logs;");
  
  const seedBooks = [
    {
      title: "The Godfather",
      author: "Mario Puzo",
      genre: "Crime & Syndicate",
      coverImageUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=800",
      description: "The definitive chronicle of the Corleone family and the brutal, intricate politics of the New York underworld. Puzo's masterpiece explores loyalty, family honor, and the terrible price of power across generations.",
      excerpt: "Behind every great fortune there is a crime. Vito Corleone sat in his shadowy study on the afternoon of his daughter's wedding, listening with infinite patience to the petitions of his friends...",
      stockStatus: "In Stock",
      price: 14.50
    },
    {
      title: "A Song of Ice and Fire: A Game of Thrones",
      author: "George R.R. Martin",
      genre: "High Fantasy",
      coverImageUrl: "https://images.unsplash.com/photo-1514894780887-121968d00567?auto=format&fit=crop&q=80&w=800",
      description: "In a land where summers last for decades and winters can freeze an age, trouble is brewing. As Warden of the North, Lord Eddard Stark is called to serve as the King's Hand amidst a web of courtly treachery.",
      excerpt: "The morning had dawned crisp and clear as iron when Bran Stark rode out with twenty men of Winterfell to see the King's justice done. It was the first time he had been deemed old enough to ride with his lord father...",
      stockStatus: "In Stock",
      price: 18.00
    },
    {
      title: "Fire & Blood",
      author: "George R.R. Martin",
      genre: "High Fantasy & Chronicles",
      coverImageUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800",
      description: "The complete history of House Targaryen, set three hundred years before the events of A Game of Thrones. Compiled by Archmaester Gyldayn, this leather-bound chronicle recounts the fiery conquest of Westeros.",
      excerpt: "Century upon century, the dragonlords of Valyria had looked eastward and southward for their conquests, until Aegon the Conqueror turned his gaze toward the western mist and the seven fractured kingdoms...",
      stockStatus: "In Stock",
      price: 22.00
    },
    {
      title: "Blood Meridian or the Evening Redness in the West",
      author: "Cormac McCarthy",
      genre: "Western & Frontier",
      coverImageUrl: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&q=80&w=800",
      description: "An epic, violent tale of the Texas-Mexico borderlands in the mid-nineteenth century. Following 'the kid' and the terrifying Judge Holden across a barren, sun-bleached landscape of grim frontier justice.",
      excerpt: "See the child. He is pale and thin, he wears a thin and ragged linen shirt. He stokes the scullery fire. Outside lie dark turned fields with rags of snow and darker woods beyond that harbor yet a few last wolves...",
      stockStatus: "In Stock",
      price: 16.50
    },
    {
      title: "The Count of Monte Cristo",
      author: "Alexandre Dumas",
      genre: "Classic Adventure",
      coverImageUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=800",
      description: "Wrongfully imprisoned in the grim fortress of Château d'If on the eve of his wedding, Edmond Dantès discovers a vast secret treasure and vows a meticulous, devastating vengeance upon his betrayers.",
      excerpt: "On the 24th of February, 1815, the look-out at Notre-Dame de la Garde signalled the three-master, the Pharaon, from Smyrna, Trieste, and Naples. As usual, a pilot put off immediately...",
      stockStatus: "In Stock",
      price: 15.00
    },
    {
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      genre: "Classic Drama",
      coverImageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800",
      description: "A shimmering portrait of the Jazz Age and the tragedy of the American Dream. Through the eyes of Nick Carraway, we witness the enigmatic Jay Gatsby and his obsessive, doomed devotion to Daisy Buchanan.",
      excerpt: "In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since. 'Whenever you feel like criticizing any one,' he told me, 'just remember that all the people in this world haven't had the advantages that you've had.'...",
      stockStatus: "In Stock",
      price: 11.50
    },
    {
      title: "True Grit",
      author: "Charles Portis",
      genre: "Western & Frontier",
      coverImageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800",
      description: "The unforgettable story of Mattie Ross, a fourteen-year-old girl from Dardanelle, Arkansas, who sets out into Indian Territory with the one-eyed, trigger-happy U.S. Marshal Rooster Cogburn to avenge her father.",
      excerpt: "People do not give it credence that a fourteen-year-old girl could leave home and go off in the wintertime to avenge her father's blood but it did not seem so strange then, although I will say it did not happen every day...",
      stockStatus: "In Stock",
      price: 13.00
    },
    {
      title: "Dune",
      author: "Frank Herbert",
      genre: "Frontier Sci-Fi",
      coverImageUrl: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=800",
      description: "Set on the harsh desert planet Arrakis, where water is more precious than gold and the mysterious spice melange controls the universe. Young Paul Atreides must navigate political betrayal and ancient prophecies.",
      excerpt: "A beginning is the time for taking the most delicate care that the balances are correct. This every sister of the Bene Gesserit knows. To begin your study of the life of Muad'Dib, then take care that you first place him in his time...",
      stockStatus: "In Stock",
      price: 19.50
    }
  ];

  for (const book of seedBooks) {
    await Book.create(book);
  }
  console.log(`Successfully cataloged ${seedBooks.length} vintage volumes into the ledger.`);

  // Seed initial discrete variation search logs for demonstration
  const sampleSearches = [
    { query: "Neuromancer by William Gibson", count: 4 },
    { query: "The Hobbit", count: 2 },
    { query: "Lonesome Dove", count: 6 },
    { query: "Sherlock Holmes Complete Ledger", count: 1 }
  ];

  for (const item of sampleSearches) {
    for (let i = 0; i < item.count; i++) {
      await SearchLog.recordMiss(item.query);
    }
  }
  console.log(`Logged ${sampleSearches.length} discrete variation search requisitions.`);
  console.log("Seed complete.");
}

if (require.main === module) {
  seedDatabase().catch(err => {
    console.error("Failed to seed database:", err);
    process.exit(1);
  });
}

module.exports = seedDatabase;
