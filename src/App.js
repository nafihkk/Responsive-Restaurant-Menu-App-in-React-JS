import { useEffect, useMemo, useState ,useRef} from "react";
import "./App.css";
import { getProductList } from "./api/products";
import Select  from "react-select";

const priceFormatter = new Intl.NumberFormat("en-SA", {
  style: "currency",
  currency: "SAR",
  minimumFractionDigits: 2,
});

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=400&q=60";

const getCategoryEmoji = (name = "") => {
  name = name.toLowerCase();
  if (name.includes("soup")) return "🥣";
  if (name.includes("salad")) return "🥗";
  if (name.includes("grill")) return "🔥";
  if (name.includes("dessert")) return "🍮";
  if (name.includes("drink") || name.includes("juice")) return "🍹";
  if (name.includes("seafood")) return "🦞";
  return "🍽️";
};
const buildThumb = (img = {}) => {
  if (!img || typeof img !== "object") return PLACEHOLDER_IMAGE;

  if (img.thumbnailURL?.startsWith("http")) return img.thumbnailURL;

  if (img.thumbnailURL)
    return `${process.env.REACT_APP_API_BASE_URL}${img.thumbnailURL}`;

  if (img.imageURL?.startsWith("http")) return img.imageURL;

  if (img.imageURL)
    return `${process.env.REACT_APP_API_BASE_URL}${img.imageURL}`;

  return PLACEHOLDER_IMAGE;
};

const buildFull = (img = {}) => {
  if (!img || typeof img !== "object") return PLACEHOLDER_IMAGE;

  if (img.imageURL?.startsWith("http")) return img.imageURL;

  if (img.imageURL)
    return `${process.env.REACT_APP_API_BASE_URL}${img.imageURL}`;

  return PLACEHOLDER_IMAGE;
};

const resolvePrice = (product) => {
  const sectionPrice = product.sectionWiseProductDetailList?.find(
    (d) => d.isActive && d.price > 0
  )?.price;

  return sectionPrice || product.basePrice || product.cost || 0;
};

const buildImageUrl = (images = []) => {
  if (!images.length) return PLACEHOLDER_IMAGE;

  const main =
    images.find((i) => i.thumbnailURL) ||
    images.find((i) => i.imageURL) ||
    null;

  if (!main) return PLACEHOLDER_IMAGE;

  const path = main.thumbnailURL || main.imageURL;

  if (path.startsWith("http")) return path;
  return `${process.env.REACT_APP_API_BASE_URL}${path}`;
};

function App() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeProduct, setActiveProduct] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await getProductList();
        setProducts(response?.filter((i) => i.isMenuItem) || []);
      } catch (err) {
        setError("Unable to load menu.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => set.add(p.category?.name || "Chef Specials"));
    return [...set];
  }, [products]);

  const categoryOptions = useMemo(() => {
  return [
    { label: "All categories", value: "all" },
    ...categories.map((c) => ({
      label: c,
      value: c,
    })),
  ];
}, [categories]);

  const filteredProducts = useMemo(() => {
    const t = searchTerm.toLowerCase().trim();

    return products.filter((p) => {
      const cat = p.category?.name || "Chef Specials";

      if (selectedCategory !== "all" && selectedCategory !== cat) return false;

      if (!t) return true;

      return (
        p.name?.toLowerCase().includes(t) ||
        p.arabicDescription?.toLowerCase().includes(t) ||
        p.otherDescription?.toLowerCase().includes(t)
      );
    });
  }, [products, selectedCategory, searchTerm]);

  const groupedProducts = useMemo(() => {
    const map = {};
    filteredProducts.forEach((p) => {
      const c = p.category?.name || "Chef Specials";
      if (!map[c]) map[c] = [];
      map[c].push(p);
    });
    return map;
  }, [filteredProducts]);

  const categoryOrder =
    selectedCategory === "all" ? categories : [selectedCategory];

      // CAROUSEL HANDLERS
  // ----------------------------------------
  const [slideIndex, setSlideIndex] = useState(0);
  const carouselRef = useRef(null);
  const touchStartX = useRef(0);

  const nextSlide = () => {
    if (!activeProduct) return;
    setSlideIndex((i) =>
      i + 1 >= activeProduct.productImages.length ? 0 : i + 1
    );
  };

  const prevSlide = () => {
    if (!activeProduct) return;
    setSlideIndex((i) =>
      i - 1 < 0 ? activeProduct.productImages.length - 1 : i - 1
    );
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const diff = e.changedTouches[0].clientX - touchStartX.current;

    if (diff > 50) prevSlide();
    if (diff < -50) nextSlide();
  };

  // Reset slide when opening product
  const openProduct = (p) => {
    setActiveProduct(p);
    setSlideIndex(0);
  };

  return (
    <div className="menu-app">
      {/* ---------- HEADER ---------- */}
      <header className="hero">
        <p className="hero-subtitle">قائمة طعام مطعمك</p>
        <h1>Freej Swaeleh Menu</h1>
        <p className="hero-description">
          Taste the classics. Tap a category to explore every dish in seconds.
        </p>
      </header>

      {/* ---------- FILTERS ---------- */}
      <div className="filters">
        <div className="search-container">
          <input
            type="search"
            className="search-input"
            placeholder="Search dishes or Arabic names..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-select">
          <label>Filter</label>
       <Select
       className="react-select"
  options={categoryOptions}
  value={categoryOptions.find((opt) => opt.value === selectedCategory)}
  onChange={(selected) => setSelectedCategory(selected.value)}
  
/>
        </div>
      </div>

      {/* ---------- CATEGORY TABS ---------- */}
      <nav className="category-tabs">
        <button
          className={`category-chip ${
            selectedCategory === "all" ? "active" : ""
          }`}
          onClick={() => setSelectedCategory("all")}
        >
          All
        </button>

        {categories.map((c) => (
          <button
            key={c}
            className={`category-chip ${
              selectedCategory === c ? "active" : ""
            }`}
            onClick={() => setSelectedCategory(c)}
          >
            {getCategoryEmoji(c)} {c}
          </button>
        ))}
      </nav>

      {/* ---------- MAIN CONTENT ---------- */}
      <main className="menu-content">
        {loading && <div className="state-card">Loading menu...</div>}
        {error && <div className="state-card error">{error}</div>}

        {!loading &&
          categoryOrder.map((cat) => {
            const items = groupedProducts[cat] || [];
            if (!items.length) return null;

            return (
              <section key={cat} className="menu-section">
                <div className="section-header">
                  <span>{getCategoryEmoji(cat)}</span>
                  <h2>{cat}</h2>
                </div>

                <div className="menu-card-stack">
                  {items.map((p) => {
                    const price = resolvePrice(p);

                    return (
                      <article
                        className="menu-card"
                        key={p.guid}
                        onClick={() => setActiveProduct(p)}
                      >
                        <img
                          src={buildImageUrl(p.productImages)}
                          className="menu-card__image"
                          alt={p.name}
                        />

                        <div className="menu-card__body">
                          <div className="menu-card__title-row">
                            <div>
                              <h3>{p.name}</h3>
                              {p.arabicDescription && (
                                <p className="arabic-name">
                                  {p.arabicDescription}
                                </p>
                              )}
                            </div>

                            <span className="price">
                              {priceFormatter.format(price)}
                            </span>
                          </div>

                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
      </main>

{/* ---------- PRODUCT POPUP ---------- */}
{activeProduct && (() => {
  const images = activeProduct?.productImages || [];
  const safeIndex = Math.max(0, Math.min(slideIndex, images.length - 1));

  return (
    <div className="modal-overlay" onClick={() => setActiveProduct(null)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* --- CAROUSEL (Safe) --- */}
        {images.length > 0 && (
          <div
            className="carousel"
            ref={carouselRef}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={buildFull(images[safeIndex])}
              className="carousel-img"
              alt=""
            />

            <button className="nav-btn left" onClick={prevSlide}>‹</button>
            <button className="nav-btn right" onClick={nextSlide}>›</button>

            <div className="dots">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={i === safeIndex ? "dot active" : "dot"}
                />
              ))}
            </div>
          </div>
        )}

        {/* --- NAME --- */}
        <h2>{activeProduct.name}</h2>

        {activeProduct.arabicDescription && (
          <p className="arabic-name">{activeProduct.arabicDescription}</p>
        )}
    
      

        {/* --- HTML DESCRIPTION --- */}
        {images[safeIndex]?.imgDescription && (
          <div
            className="img-html"
            dangerouslySetInnerHTML={{
              __html: images[safeIndex].imgDescription,
            }}
          />
        )}

        {/* --- THUMBNAILS --- */}
        {images.length > 0 && (
          <div className="thumb-row">
            {images.map((img, i) => (
              <img
                key={i}
                src={buildThumb(img)}
                className={
                  i === safeIndex ? "thumb-img active-thumb" : "thumb-img"
                }
                onClick={() => setSlideIndex(i)}
              />
            ))}
          </div>
        )}

        <button className="close-btn" onClick={() => setActiveProduct(null)}>
          Close
        </button>
      </div>
    </div>
  );
})()}

    </div>
  );
}

export default App;
