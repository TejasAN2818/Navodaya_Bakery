
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CakeSlice,
  ChevronDown,
  Clock3,
  Heart,
  MapPin,
  Menu,
  MessageCircle,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Star,
  Truck,
  X,
} from "lucide-react";

import products, { categories } from "./components/ProductList.jsx";

const OWNER_WHATSAPP = "919591362918";

// Main bakery images
const mainImageFiles = import.meta.glob(
  "./images/bakery_image/*.{png,jpg,jpeg,webp,avif}",
  {
    eager: true,
    query: "?url",
    import: "default",
  }
);

// Product images
const productImageFiles = import.meta.glob(
  "./images/bakery_image/product_image/*.{png,jpg,jpeg,webp,avif}",
  {
    eager: true,
    query: "?url",
    import: "default",
  }
);

// Custom cake images
const customCakeImageFiles = import.meta.glob(
  "./images/bakery_image/custom cake/*.{png,jpg,jpeg,webp,avif}",
  {
    eager: true,
    query: "?url",
    import: "default",
  }
);

// Combine all image folders
const imageFiles = {
  ...mainImageFiles,
  ...productImageFiles,
  ...customCakeImageFiles,
};

// Find an image by its filename
const getImage = (filename) => {
  const match = Object.entries(imageFiles).find(([path]) =>
    path.toLowerCase().endsWith(`/${filename.toLowerCase()}`)
  );

  return match?.[1] || "";
};

const slides = [
  {
    image: "bakery_image_1.png",
    title: "Fresh Bakery Bites",
    button: "Explore Menu",
  },
  {
    image: "bakery_image_2.png",
    title: "Baked With Love",
    button: "Shop Favourites",
  },
  {
    image: "bakery_image_3.png",
    title: "Sweet Moments",
    button: "Discover Treats",
  },
];

function waUrl(message) {
  return `https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

function Photo({ filename, alt, className = "", eager = false }) {
  const src = getImage(filename);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [filename]);

  if (!src || failed) {
    return (
      <div
        className={`flex h-full min-h-20 w-full flex-col items-center justify-center gap-2 bg-[#ffe9d4] p-2 text-center text-xs text-[#9b4b20] ${className}`}
        role="img"
        aria-label={`${alt} photo placeholder`}
      >
        <CakeSlice aria-hidden="true" />
        <span>{alt}</span>
        <small>{filename}</small>
      </div>
    );
  }

  return (
    <img
      className={className}
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      onError={() => setFailed(true)}
    />
  );
}

function SectionHeading({ kicker, children, subtitle }) {
  return (
    <div className="min-w-0">
      {kicker && (
        <p className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-[#ff7417]">
          {kicker}
        </p>
      )}

      <h2 className="font-serif text-2xl font-bold tracking-tight text-[#061e32] sm:text-3xl">
        {children}
      </h2>

      {subtitle && (
        <p className="mt-2 text-xs text-slate-500">{subtitle}</p>
      )}
    </div>
  );
}

export default function App() {
  const [slide, setSlide] = useState(0);
  const [activeCategory, setActiveCategory] = useState("All");
  const [showCategories, setShowCategories] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSlide((current) => (current + 1) % slides.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!selectedProduct) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedProduct(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedProduct]);

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const categoryMatches =
          activeCategory === "All" ||
          product.category === activeCategory;

        const searchMatches = `${product.name} ${product.category}`
          .toLowerCase()
          .includes(search.toLowerCase());

        return categoryMatches && searchMatches;
      }),
    [activeCategory, search]
  );

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2300);
  };

  const orderProduct = (product, qty = 1) => {
    const message = [
      "Hello Navodaya Bakery & Sweets! I'd like to place an order.",
      "",
      `Product: ${product.name}`,
      `Price: ₹${product.price} each`,
      `Quantity: ${qty}`,
      `Subtotal: ₹${product.price * qty}`,
      "",
      "Please confirm availability and delivery/pickup details.",
    ].join("\n");

    window.open(waUrl(message), "_blank", "noopener,noreferrer");
  };

  const orderCart = () => {
    if (!cart.length) {
      window.open(
        waUrl(
          "Hello Navodaya Bakery & Sweets! Please share today's available menu."
        ),
        "_blank",
        "noopener,noreferrer"
      );
      return;
    }

    const lines = cart
      .map(
        ({ product, qty }) =>
          `• ${product.name} × ${qty} — ₹${product.price * qty}`
      )
      .join("\n");

    const total = cart.reduce(
      (sum, item) => sum + item.product.price * item.qty,
      0
    );

    window.open(
      waUrl(
        `Hello Navodaya Bakery & Sweets! I'd like to order:\n\n${lines}\n\nEstimated total: ₹${total}\n\nPlease confirm availability.`
      ),
      "_blank",
      "noopener,noreferrer"
    );
  };

  const addToCart = (product) => {
    setCart((current) => {
      const found = current.find(
        (item) => item.product.id === product.id
      );

      return found
        ? current.map((item) =>
            item.product.id === product.id
              ? { ...item, qty: item.qty + 1 }
              : item
          )
        : [...current, { product, qty: 1 }];
    });

    notify(`${product.name} added to your basket`);
  };

  const scrollToMenu = () => {
    document.querySelector("#products")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const navItems = [
    ["Home", "#home"],
    ["Menu", "#products"],
    ["Bengaluru Specials", "#specials"],
    ["Custom Cakes", "#custom-cakes"],
    ["Contact", "#contact"],
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fffaf3] font-sans text-[#071e31]">
      {/* HEADER */}

      <header className="fixed inset-x-0 top-0 z-50 w-full bg-[#031d30] text-white shadow-lg">
        <div className="mx-auto flex min-h-[70px] w-full items-center justify-between gap-3 px-4 sm:px-[5%]">
          <a
            href="#home"
            className="flex shrink-0 items-center gap-2"
            aria-label="Navodaya Bakery and Sweets home"
          >
            <span className="text-[#ff6b12] [&_svg]:h-7 [&_svg]:w-7">
              <CakeSlice />
            </span>

            <span className="flex flex-col">
              <strong className="text-base font-extrabold leading-tight sm:text-lg">
                Navodaya
                <span className="ml-1 text-[#ff6b12]">Bakery</span>
                <span className="ml-1 text-white">&amp; Sweets</span>
              </strong>

              <small className="mt-1 text-[10px] text-slate-200">
                Freshly Baked • Made with Love
              </small>
            </span>
          </a>

          <nav className="hidden items-center gap-5 md:flex">
            {navItems.map(([label, href]) => (
              <a
                key={label}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-sm transition-colors hover:text-[#ff7417]"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {searchOpen && (
              <input
                className="absolute right-12 top-full z-50 w-44 rounded-full border border-white/30 bg-[#082d44] px-3 py-2 text-sm text-white outline-none placeholder:text-slate-300 sm:static"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  scrollToMenu();
                }}
                placeholder="Search menu..."
                aria-label="Search products"
              />
            )}

            <button
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-transparent text-white transition hover:bg-white/10 [&_svg]:h-5 [&_svg]:w-5"
              aria-label="Search"
              onClick={() => setSearchOpen((value) => !value)}
            >
              <Search />
            </button>

            <button
              className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-transparent text-white transition hover:bg-white/10 [&_svg]:h-5 [&_svg]:w-5"
              aria-label="Order basket"
              onClick={orderCart}
            >
              <ShoppingBag />
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#ff6b12] px-0.5 text-[10px] font-bold">
                {cart.reduce((sum, item) => sum + item.qty, 0)}
              </span>
            </button>

            <a
              className="hidden items-center justify-center gap-2 rounded-full bg-[#ff650f] px-3 py-2.5 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#ef5300] [&_svg]:h-4 [&_svg]:w-4 sm:inline-flex sm:px-4"
              href={waUrl(
                "Hello Navodaya Bakery & Sweets! I'd like to place an order."
              )}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle />
              <span>Order on WhatsApp</span>
            </a>

            <button
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-transparent text-white transition hover:bg-white/10 [&_svg]:h-5 [&_svg]:w-5 md:hidden"
              aria-label="Open navigation"
              onClick={() => setMobileMenuOpen((value) => !value)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="flex flex-col gap-1 bg-[#031d30] px-5 pb-4 md:hidden">
            {navItems.map(([label, href]) => (
              <a
                key={label}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm transition hover:bg-white/10 hover:text-[#ff7417]"
              >
                {label}
              </a>
            ))}
          </nav>
        )}
      </header>

      
        <main className="pt-[70px]">
        {/* HERO CAROUSEL */}
        <section
          className="relative bg-[#031d30] text-white"
          id="home"
          aria-label="Bakery highlights"
        >
          <div className="relative aspect-video w-full overflow-hidden">
            <div
              className="flex h-full w-full transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${slide * 100}%)` }}
            >
              {slides.map((item, index) => (
                <article
                  className="relative flex h-full min-w-full items-center overflow-hidden"
                  key={item.image}
                  aria-hidden={slide !== index}
                >
                  <Photo
                    filename={item.image}
                    alt={item.title}
                    eager={index === 0}
                    className="absolute inset-0 h-full w-full object-cover object-center"
                  />

                  <div className="absolute inset-0 bg-gradient-to-r from-[#001b2c]/40 via-[#001b2c]/10 to-transparent" />

                  <div className="relative z-10 w-full px-[5%] sm:px-[6.3%]">
                    <h1 className="max-w-[48%] font-serif text-[clamp(1rem,3.4vw,3rem)] font-bold leading-tight tracking-tight text-white drop-shadow-md sm:max-w-[38%]">
                      {item.title}
                    </h1>

                    <button
                      className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-[#ff650f] px-3 py-2 text-[10px] font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#ef5300] [&_svg]:h-4 [&_svg]:w-4 sm:mt-5 sm:px-5 sm:py-3 sm:text-sm"
                      onClick={scrollToMenu}
                    >
                      {item.button}
                      <ArrowRight />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-[5%] left-[5%] right-[5%] flex items-center justify-between">
            <div className="pointer-events-auto flex items-center gap-2" aria-label="Choose banner">
              {slides.map((item, index) => (
                <button
                  key={item.image}
                  className={`h-2 rounded-full transition-all ${
                    index === slide ? "w-7 bg-[#ff6b12]" : "w-2 bg-white/60"
                  }`}
                  onClick={() => setSlide(index)}
                  aria-label={`Show banner ${index + 1}`}
                />
              ))}
            </div>

            <div className="pointer-events-auto flex items-center gap-2">
              <button
                className="grid h-8 w-8 place-items-center rounded-full border border-white/50 bg-black/30"
                aria-label="Previous banner"
                onClick={() => setSlide((slide - 1 + slides.length) % slides.length)}
              >
                <ArrowLeft />
              </button>

              <button
                className="grid h-8 w-8 place-items-center rounded-full border border-white/50 bg-black/30"
                aria-label="Next banner"
                onClick={() => setSlide((slide + 1) % slides.length)}
              >
                <ArrowRight />
              </button>
            </div>
          </div>
        </section>

        {/* CATEGORY SECTION */}
        <section className="px-[4%] py-8 sm:px-[5.3%] sm:py-12">
          <div className="flex items-center justify-between gap-4">
            <SectionHeading kicker="FIND YOUR FAVOURITE">
              Shop by Category
            </SectionHeading>

            <button
              className="inline-flex items-center gap-1 text-xs font-bold text-[#ff5d08]"
              onClick={() => setShowCategories((value) => !value)}
            >
              {showCategories ? "Hide" : "Show"} Categories
              <ChevronDown className={showCategories ? "rotate-180" : ""} />
            </button>
          </div>

          {showCategories && (
            <div className="mt-6 grid grid-cols-4 gap-3 sm:grid-cols-4 lg:grid-cols-8">
              <button
                className={`flex min-w-0 flex-col items-center gap-2 text-center text-xs font-semibold ${
                  activeCategory === "All" ? "text-[#ff6813]" : ""
                }`}
                onClick={() => {
                  setActiveCategory("All");
                  scrollToMenu();
                }}
              >
                <span className="grid aspect-square w-full max-w-28 place-items-center overflow-hidden rounded-full bg-[#ffead8] text-3xl text-[#ff6813] transition hover:ring-2 hover:ring-[#ff6813] [&_img]:h-full [&_img]:w-full [&_img]:object-cover">
                  ✦
                </span>
                <strong>All Items</strong>
              </button>

              {categories.map((category) => (
                <button
                  key={category.name}
                  className={`flex min-w-0 flex-col items-center gap-2 text-center text-xs font-semibold ${
                    activeCategory === category.name ? "text-[#ff6813]" : ""
                  }`}
                  onClick={() => {
                    setActiveCategory(category.name);
                    scrollToMenu();
                  }}
                >
                  <span className="grid aspect-square w-full max-w-28 place-items-center overflow-hidden rounded-full bg-[#ffead8] transition hover:ring-2 hover:ring-[#ff6813] [&_img]:h-full [&_img]:w-full [&_img]:object-cover">
                    <Photo filename={category.image} alt={category.name} />
                  </span>
                  <strong>{category.name}</strong>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* PRODUCT SECTION */}
        <section className="px-[4%] py-8 sm:px-[5.3%] sm:py-12" id="products">
          <div className="flex items-center justify-between gap-3">
            <SectionHeading kicker="LOCAL FLAVOURS, FRESH EVERY DAY">
              Bengaluru <span className="text-[#ff6813]">Favourites</span>
            </SectionHeading>

            <label className="flex items-center gap-2 rounded-full border border-[#e4d6ca] bg-white px-3 py-2 text-slate-500 [&_svg]:h-4 [&_svg]:w-4">
              <Search />
              <input
                className="w-24 bg-transparent text-xs outline-none sm:w-40"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Find a treat..."
                aria-label="Search products"
              />
            </label>
          </div>

          <div className="flex gap-2 overflow-x-auto py-4" aria-label="Filter products">
            {["All", ...categories.map((item) => item.name)].map((category) => (
              <button
                key={category}
                className={
                  activeCategory === category
                    ? "shrink-0 rounded-full border !border-[#061f33] !bg-[#061f33] !text-white px-3 py-2 text-xs font-semibold transition"
                    : "shrink-0 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-[#061f33] hover:text-white"
                }
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
            {filteredProducts.map((product) => (
              <article
                className="relative min-w-0 overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                key={product.id}
              >
                <button
                  className="block w-full text-left"
                  onClick={() => {
                    setSelectedProduct(product);
                    setQuantity(1);
                  }}
                  aria-label={`View details for ${product.name}`}
                >
                  <span className="relative block aspect-[4/3] overflow-hidden bg-[#f7e7d5] [&>img]:h-full [&>img]:w-full [&>img]:object-cover [&>img]:transition-transform [&>img]:duration-500 hover:[&>img]:scale-105">
                    <Photo filename={product.image} alt={product.name} />
                    <span className="absolute bottom-2 left-2 rounded bg-[#031d30]/85 px-2 py-1 text-[10px] font-semibold text-white">
                      {product.tag}
                    </span>
                  </span>

                  <span className="flex flex-col gap-1 p-3">
                    <strong className="min-h-9 text-xs font-bold sm:text-sm">
                      {product.name}
                    </strong>
                    <span className="text-sm font-extrabold">₹{product.price}</span>
                    <span className="flex items-center gap-1 text-xs text-orange-500 [&_svg]:h-3 [&_svg]:w-3">
                      <Star fill="currentColor" />
                      4.8
                      <small>Tap for details</small>
                    </span>
                  </span>
                </button>

                <div className="flex gap-2 px-3 pb-3">
                  <button
                    className="flex-1 rounded-lg border border-[#e7d8cb] px-2 py-2 text-xs font-bold"
                    onClick={() => {
                      setSelectedProduct(product);
                      setQuantity(1);
                    }}
                  >
                    Details
                  </button>

                  <button
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-[#ff6813] px-2 py-2 text-xs font-bold text-white [&_svg]:h-4 [&_svg]:w-4"
                    onClick={() => addToCart(product)}
                  >
                    <Plus />
                    Add
                  </button>
                </div>

                <button
                  className={`absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-[#071d2b]/60 text-white [&_svg]:h-4 [&_svg]:w-4 ${
                    favorites.includes(product.id) ? "!bg-white !text-[#ff6813]" : ""
                  }`}
                  onClick={() =>
                    setFavorites((old) =>
                      old.includes(product.id)
                        ? old.filter((id) => id !== product.id)
                        : [...old, product.id]
                    )
                  }
                  aria-label={
                    favorites.includes(product.id)
                      ? "Remove from favourites"
                      : "Save favourite"
                  }
                >
                  <Heart fill={favorites.includes(product.id) ? "currentColor" : "none"} />
                </button>
              </article>
            ))}

            {!filteredProducts.length && (
              <div className="col-span-full py-10 text-center text-slate-500">
                No products found. Choose another category or search term.
              </div>
            )}
          </div>
        </section>

        {/* BENEFITS */}
        <section className="grid grid-cols-2 gap-4 bg-[#fff2e3] px-[5%] py-6 md:grid-cols-4">
          <div className="flex items-center gap-2">
            <CakeSlice className="text-[#ff6813]" />
            <strong className="text-xs">Freshly Baked</strong>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="text-[#ff6813]" />
            <strong className="text-xs">Made with Love</strong>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="text-[#ff6813]" />
            <strong className="text-xs">Bengaluru Delivery</strong>
          </div>
          <div className="flex items-center gap-2">
            <Clock3 className="text-[#ff6813]" />
            <strong className="text-xs">Easy Ordering</strong>
          </div>
        </section>

        {/* CUSTOM CAKES */}
        <section
          className="grid grid-cols-1 items-center gap-6 px-[4%] py-8 sm:px-[5.3%] sm:py-12 md:grid-cols-2"
          id="custom-cakes"
        >
          <div>
            <p className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-[#ff7417]">
              FOR YOUR SPECIAL MOMENTS
            </p>

            <h2 className="font-serif text-3xl font-bold sm:text-4xl">
              Big celebrations.
              <br />
              <span className="text-[#ff6813]">Beautiful cakes.</span>
            </h2>

            <p className="mt-3 text-sm text-slate-600">
              Need a birthday or anniversary cake? Message the bakery
              with your flavour, size and design idea.
            </p>

            <a
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-[#ff650f] px-4 py-3 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#ef5300] [&_svg]:h-4 [&_svg]:w-4"
              href={waUrl(
                "Hello Navodaya Bakery & Sweets! I'd like to enquire about a custom celebration cake."
              )}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle />
              Enquire about custom cakes
            </a>
          </div>

          <Photo
            filename="custom_cake.jpg"
            alt="Custom celebration cake"
            className="aspect-video w-full rounded-2xl object-cover"
          />
        </section>

        {/* CONTACT */}
        <section
          className="grid grid-cols-1 items-center gap-6 bg-[#fff3e6] px-[4%] py-8 sm:px-[5.3%] sm:py-12 md:grid-cols-2"
          id="contact"
        >
          <div>
            <p className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-[#ff7417]">
              COME SAY HELLO
            </p>

            <h2 className="font-serif text-3xl font-bold sm:text-4xl">
              Your next favourite bite
              <br />
              is waiting.
            </h2>

            <p className="mt-3 text-sm text-slate-600">
              Visit us or message to check today's menu, availability
              and pickup options.
            </p>
          </div>

          <div className="grid gap-4 rounded-xl bg-white p-5">
            <div className="flex items-start gap-3">
              <MapPin className="shrink-0 text-[#ff6813]" />
              <div>
                <strong className="block">Visit Us</strong>
                <small className="text-slate-500">
                  JP Nagar, Bengaluru, Karnataka
                </small>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock3 className="shrink-0 text-[#ff6813]" />
              <div>
                <strong className="block">Opening Hours</strong>
                <small className="text-slate-500">10 AM to 11 PM</small>
              </div>
            </div>

            <a
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ff650f] px-4 py-3 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#ef5300] [&_svg]:h-4 [&_svg]:w-4"
              href={waUrl(
                "Hello Navodaya Bakery & Sweets! Please share today's menu and shop address."
              )}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle />
              Contact the Bakery
            </a>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="flex flex-wrap items-center justify-between gap-4 bg-[#031d30] px-[5%] py-8 text-white">
        <a href="#home" className="flex shrink-0 items-center gap-2">
          <span className="text-[#ff6b12] [&_svg]:h-7 [&_svg]:w-7">
            <CakeSlice />
          </span>

          <span className="flex flex-col">
            <strong className="text-lg font-extrabold leading-none">
              Navodaya
              <span className="text-[#ff6b12]"> Bakery</span>
              <span> &amp; Sweets</span>
            </strong>
            <small className="mt-1 text-[10px] text-slate-200">
              Bengaluru Bakery &amp; Bites
            </small>
          </span>
        </a>

        <p className="text-sm text-slate-300">
          Fresh bakes, local favourites and celebration cakes — made
          with love in Bengaluru.
        </p>

        <span className="text-xs text-slate-300">
          © {new Date().getFullYear()} Navodaya Bakery &amp; Sweets
        </span>
      </footer>

      {/* FLOATING WHATSAPP BUTTON */}
      <a
        className="fixed bottom-5 right-5 z-30 grid h-12 w-12 place-items-center rounded-full bg-[#ff6813] text-white shadow-lg [&_svg]:h-6 [&_svg]:w-6"
        href={waUrl(
          "Hello Navodaya Bakery & Sweets! I'd like to place an order."
        )}
        target="_blank"
        rel="noreferrer"
        aria-label="Order on WhatsApp"
      >
        <MessageCircle />
      </a>

      {/* PRODUCT DETAILS MODAL */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#001321]/75 p-3"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedProduct(null);
            }
          }}
        >
          <section
            className="relative grid max-h-[94vh] w-full max-w-4xl grid-cols-1 overflow-y-auto rounded-2xl bg-[#fffaf3] md:grid-cols-2"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sc-modal-title"
          >
            <button
              className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white shadow-md"
              onClick={() => setSelectedProduct(null)}
              aria-label="Close product details"
            >
              <X />
            </button>

            <div className="min-h-48 bg-[#f8e3d0] [&>img]:h-full [&>img]:w-full [&>img]:object-cover">
              <Photo
                filename={selectedProduct.image}
                alt={selectedProduct.name}
              />
            </div>

            <div className="flex flex-col items-start p-5 sm:p-8">
              <p className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-[#ff7417]">
                {selectedProduct.tag}
              </p>

              <h2 id="sc-modal-title" className="font-serif text-3xl font-bold">
                {selectedProduct.name}
              </h2>

              <p className="my-4 text-sm leading-relaxed text-slate-600">
                {selectedProduct.details}
              </p>

              <p className="text-2xl font-extrabold">
                ₹{selectedProduct.price}
                <small className="text-sm font-normal"> / item</small>
              </p>

              <p className="my-3 text-xs text-slate-500">
                Please confirm today's availability with the bakery
                before payment.
              </p>

              <div className="flex w-full items-center justify-between border-t py-4">
                <span>Quantity</span>
                <div className="flex items-center gap-4">
                  <button
                    className="rounded border p-1"
                    onClick={() =>
                      setQuantity((value) => Math.max(1, value - 1))
                    }
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>

                  <strong>{quantity}</strong>

                  <button
                    className="rounded border p-1"
                    onClick={() =>
                      setQuantity((value) => Math.min(99, value + 1))
                    }
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex w-full items-center justify-between border-t py-4">
                <span>Total</span>
                <strong>₹{selectedProduct.price * quantity}</strong>
              </div>

              <button
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#ff650f] px-4 py-3 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#ef5300] [&_svg]:h-4 [&_svg]:w-4"
                onClick={() => orderProduct(selectedProduct, quantity)}
              >
                <MessageCircle />
                Order on WhatsApp
                <ArrowRight />
              </button>

              <button
                className="mx-auto mt-3 text-xs underline"
                onClick={() => {
                  addToCart(selectedProduct);
                  setSelectedProduct(null);
                }}
              >
                Add to basket instead
              </button>
            </div>
          </section>
        </div>
      )}

      {/* TOAST MESSAGE */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 z-[120] flex -translate-x-1/2 items-center gap-3 rounded-xl bg-[#031d30] px-4 py-3 text-xs text-white shadow-xl"
          role="status"
        >
          {toast}
          <button
            onClick={() => setToast("")}
            aria-label="Dismiss notification"
          >
            <X />
          </button>
        </div>
      )}
    </div>
  );
}
