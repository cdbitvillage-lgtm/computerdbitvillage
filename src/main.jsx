import React, { useState, useEffect, createContext, useContext } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
  useParams,
} from "react-router-dom";
import * as Icons from "lucide-react";
import {
  getUser,
  login,
  logout,
  handleAuthCallback,
  acceptInvite,
  updateUser,
  requestPasswordRecovery,
} from "@netlify/identity";
import { api, normalize } from "./api";
import {
  courses as catalog,
  categories,
  services,
  samples,
  modules,
  templates,
} from "./data";
import "./styles.css";
const Context = createContext();
function Icon({ name, size = 20, ...props }) {
  const C = Icons[name] || Icons.Monitor;
  return <C size={size} strokeWidth={1.7} {...props} />;
}
function useApp() {
  return useContext(Context);
}
const nav = [
  ["/", "হোম", "Home"],
  ["/app/about", "আমাদের সম্পর্কে", "About Us"],
  ["/app/courses", "প্রশিক্ষণ কোর্স", "Training Courses"],
  ["/app/shop", "কম্পিউটার শপ", "Computer Shop"],
  ["/app/services", "সার্ভিসিং", "Servicing"],
  ["/app/gallery", "গ্যালারি", "Gallery"],
  ["/app/contact", "যোগাযোগ", "Contact"],
];
function App() {
  const [en, setEn] = useState(false),
    [menu, setMenu] = useState(false),
    [cart, setCart] = useState([]);
  const loc = useLocation();
  const t = (bn, english) => (en ? english : bn);
  useEffect(() => {
    window.scrollTo(0, 0);
    setMenu(false);
  }, [loc.pathname]);
  useEffect(() => {
    document.documentElement.lang = en ? "en" : "bn";
  }, [en]);
  useEffect(() => {
    api("/site")
      .then((s) => {
        document.title = s.siteName + " | Training, Technology & Trust";
        document
          .querySelector('meta[name="description"]')
          ?.setAttribute("content", s.siteDescription);
        document
          .querySelector('meta[property="og:site_name"]')
          ?.setAttribute("content", s.siteName);
        document
          .querySelector('meta[property="og:description"]')
          ?.setAttribute("content", s.siteDescription);
      })
      .catch(() => {});
  }, []);
  return (
    <Context.Provider value={{ en, t, cart, setCart }}>
      <div className="topbar">
        <div className="container top-inner">
          <span>
            <Icon name="MapPin" size={14} />{" "}
            {t("ফ্রিপোর্ট, সিইপিজেড, চট্টগ্রাম", "Freeport, CEPZ, Chattogram")}
          </span>
          <div>
            <a href="tel:01309039718">
              <Icon name="Phone" size={13} /> 01309-039718
            </a>
            <span className="topdivider" />
            <Link to="/app/student">
              {t("স্টুডেন্ট পোর্টাল", "Student Portal")}
            </Link>
            <Link to="/app/results">{t("ফলাফল", "Results")}</Link>
            <Link to="/app/verify">
              {t("সার্টিফিকেট যাচাই", "Verify Certificate")}
            </Link>
          </div>
        </div>
      </div>
      <header>
        <div className="container header-inner">
          <Link className="brand" to="/">
            <img className="brand-mark" src="/img/logo.png" alt="Computer DB-IT Village logo" width="48" height="48" />
            <span>
              COMPUTER <b>DB-IT VILLAGE</b>
              <small>TRAINING · TECHNOLOGY · TRUST</small>
            </span>
          </Link>
          <nav className={menu ? "open" : ""}>
            {nav.map(([url, bn, english]) => (
              <Link
                key={url}
                className={
                  (
                    url === "/"
                      ? loc.pathname === "/"
                      : loc.pathname.startsWith(url)
                  )
                    ? "active"
                    : ""
                }
                to={url}
              >
                {t(bn, english)}
              </Link>
            ))}
            <div className="nav-extra">
              <Link to="/app/admission">
                {t("অনলাইন ভর্তি", "Online admission")}
              </Link>
              <Link to="/app/student">
                {t("স্টুডেন্ট পোর্টাল", "Student portal")}
              </Link>
              <Link to="/app/results">{t("পরীক্ষার ফলাফল", "Results")}</Link>
              <Link to="/app/verify">
                {t("সার্টিফিকেট যাচাই", "Certificate verification")}
              </Link>
            </div>
          </nav>
          <div className="header-actions">
            <button className="language" onClick={() => setEn(!en)}>
              {en ? "বাংলা" : "EN"} <Icon name="Globe" size={14} />
            </button>
            <Link
              className="cart-icon"
              to="/app/cart"
              aria-label="Shopping cart"
            >
              <Icon name="ShoppingBag" />
              {cart.length > 0 && <sup>{cart.length}</sup>}
            </Link>
            <Link className="btn small" to="/app/admission">
              {t("অনলাইন ভর্তি", "Apply Now")}{" "}
              <Icon name="ArrowUpRight" size={16} />
            </Link>
            <button
              className="menu-btn"
              onClick={() => setMenu(!menu)}
              aria-label="Toggle navigation"
            >
              <Icon name={menu ? "X" : "Menu"} />
            </button>
          </div>
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/app/about" element={<About />} />
          <Route path="/app/courses" element={<Courses />} />
          <Route path="/app/courses/:id" element={<Course />} />
          <Route path="/app/admission" element={<Admission />} />
          <Route path="/app/shop" element={<Shop />} />
          <Route path="/app/shop/:id" element={<Product />} />
          <Route path="/app/cart" element={<Cart />} />
          <Route path="/app/services" element={<ServicePage />} />
          <Route path="/app/results" element={<Results />} />
          <Route path="/app/verify" element={<Verify />} />
          <Route path="/app/gallery" element={<Gallery />} />
          <Route path="/app/notices" element={<Notices />} />
          <Route path="/app/contact" element={<Contact />} />
          <Route path="/app/admin/*" element={<Admin />} />
          <Route path="/app/student" element={<Student />} />
          <Route
            path="*"
            element={
              <Page title="পৃষ্ঠা পাওয়া যায়নি / Page not found">
                <Link className="btn" to="/">
                  Go home
                </Link>
              </Page>
            }
          />
        </Routes>
      </main>
      <Footer />
      <a
        href="https://wa.me/8801309039718"
        target="_blank"
        rel="noreferrer"
        className="whatsapp"
        aria-label="WhatsApp enquiry"
      >
        <Icon name="MessageCircle" size={25} />
      </a>
    </Context.Provider>
  );
}
function useRecords(resource) {
  const [rows, setRows] = useState([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    let live = true;
    setLoading(true);
    api(`/public/${resource}`)
      .then((d) => {
        if (live) setRows(normalize(d));
      })
      .catch((e) => {
        if (live) setError(e.message);
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [resource]);
  return { rows, error, loading };
}
function Heading({ eyebrow, title, description, link, to }) {
  return (
    <div className="section-heading">
      <div>
        <span className="eyebrow">
          <i />
          {eyebrow}
        </span>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {link && (
        <Link className="text-link" to={to}>
          {link} <Icon name="ArrowUpRight" size={17} />
        </Link>
      )}
    </div>
  );
}
function Home() {
  const { t } = useApp();
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="hero-label">
              <i />
              {t("প্রযুক্তির সাথে আগামীর পথে", "YOUR NEXT CHAPTER STARTS HERE")}
            </span>
            <h1>
              {t("আজকের দক্ষতা,", "Skills for today.")}
              <br />
              {t("আগামীর", "A future with")}{" "}
              <span>{t("সফলতা।", "possibility.")}</span>
            </h1>
            <p>
              {t(
                "প্রযুক্তির সঠিক প্রশিক্ষণে গড়ুন নিজের ভবিষ্যৎ। কম্পিউটার প্রশিক্ষণ, মানসম্মত পণ্য ও নির্ভরযোগ্য সার্ভিসিং — সবকিছু এক ঠিকানায়।",
                "Build your future through practical technology training. Computer courses, quality products and dependable servicing — all in one place.",
              )}
            </p>
            <div className="hero-buttons">
              <Link className="btn orange" to="/app/courses">
                {t("আমাদের কোর্সসমূহ", "Explore our courses")}{" "}
                <Icon name="ArrowUpRight" size={19} />
              </Link>
              <Link className="btn outline-light" to="/app/admission">
                {t("অনলাইনে ভর্তি হোন", "Apply online")}{" "}
                <Icon name="ArrowRight" size={18} />
              </Link>
            </div>
            <div className="hero-trust">
              <span>
                <Icon name="BadgeCheck" size={18} />
                {t("হাতে-কলমে প্রশিক্ষণ", "Practical training")}
              </span>
              <span>
                <Icon name="Users" size={18} />
                {t("অভিজ্ঞ প্রশিক্ষক", "Dedicated instructors")}
              </span>
              <span>
                <Icon name="MonitorCheck" size={18} />
                {t("প্র্যাকটিক্যাল ল্যাব", "Practical lab")}
              </span>
            </div>
          </div>
          <div className="hero-visual">
            <img
              src="/.netlify/images?url=/img/classroom-lab.jpg&w=1200&fm=webp"
              alt={t("কম্পিউটার ডিবি-আইটি ভিলেজের ক্লাসরুমে কম্পিউটার অনুশীলন", "Computer practice in the Computer DB-IT Village classroom")}
            />
            <div className="image-shade" />
            <div className="visual-top">
              <span className="live-dot" />
              {t("শেখার শুরু এখানেই", "A PLACE TO LEARN & GROW")}
            </div>
            <div className="visual-caption">
              <span>LEARN. PRACTICE. GROW.</span>
              <h3>
                {t("শুধু শেখা নয়,", "Beyond learning.")}
                <br />
                {t("দক্ষ হয়ে ওঠা।", "Become capable.")}
              </h3>
            </div>
            <div className="floating-card">
              <span className="floating-icon">
                <Icon name="GraduationCap" size={27} />
              </span>
              <div>
                <b>
                  {t("আপনার ক্যারিয়ারের প্রথম ধাপ", "Your first step forward")}
                </b>
                <small>
                  {t(
                    "সঠিক দিকনির্দেশনায়, একসাথে এগিয়ে যাই",
                    "Learn with purpose. Grow with guidance.",
                  )}
                </small>
              </div>
              <Icon name="ArrowUpRight" size={22} />
            </div>
            <span className="photo-note">
              {t("আমাদের কম্পিউটার ক্লাসরুম", "Our computer classroom")}
            </span>
          </div>
        </div>
        <div className="hero-bottom container">
          <span>COMPUTER DB-IT VILLAGE</span>
          <div className="hero-line" />
          <span>
            {t("দক্ষতা · প্রযুক্তি · আস্থা", "SKILLS · TECHNOLOGY · TRUST")}
          </span>
        </div>
      </section>
      <div className="container">
        <div className="service-strip">
          {[
            [
              "GraduationCap",
              "প্রফেশনাল আইটি প্রশিক্ষণ",
              "Professional IT Training",
              "ক্যারিয়ার গড়ার সঠিক প্রস্তুতি",
              "Practical skills for your next step",
              "/app/courses",
            ],
            [
              "Monitor",
              "কম্পিউটার ও অ্যাক্সেসরিজ",
              "Computers & Accessories",
              "আপনার প্রয়োজনে সঠিক প্রযুক্তি",
              "The right technology for your needs",
              "/app/shop",
            ],
            [
              "Wrench",
              "বিশ্বস্ত সার্ভিসিং সেন্টার",
              "Trusted Servicing Center",
              "দক্ষ হাতে আপনার ডিভাইসের যত্ন",
              "Expert care for your devices",
              "/app/services",
            ],
          ].map(([icon, bn, en, sub, se, url], i) => (
            <Link to={url} className="strip-card" key={url}>
              <span className={"strip-icon tone-" + i}>
                <Icon name={icon} size={29} />
              </span>
              <div>
                <h3>{t(bn, en)}</h3>
                <p>{t(sub, se)}</p>
              </div>
              <Icon className="strip-arrow" name="ArrowUpRight" size={21} />
            </Link>
          ))}
        </div>
      </div>
      <section className="section courses-section">
        <div className="container">
          <Heading
            eyebrow={t("শিখুন নিজের পছন্দের স্কিল", "FIND YOUR NEXT SKILL")}
            title={t("জনপ্রিয় প্রশিক্ষণ কোর্স", "Popular training courses")}
            description={t(
              "নতুন শুরু হোক সঠিক প্রশিক্ষণে। বেছে নিন আপনার জন্য উপযুক্ত কোর্স।",
              "Start with the right training. Find the course that fits your goals.",
            )}
            link={t("সকল কোর্স দেখুন", "View all courses")}
            to="/app/courses"
          />
          <CourseCards limit={4} />
        </div>
      </section>
      <section className="section about-home">
        <div className="container about-grid">
          <div className="about-art">
            <img
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&q=80"
              alt="Illustrative collaborative technology workspace"
              loading="lazy"
            />
            <div className="about-badge">
              <Icon name="MapPin" size={28} />
              <b>
                {t("আপনার শহরে, আপনার পাশে", "Local learning. Lasting skills.")}
              </b>
              <span>Freeport, Chattogram</span>
            </div>
          </div>
          <div>
            <span className="eyebrow">
              <i />
              {t("আমাদের সম্পর্কে", "ROOTED IN YOUR COMMUNITY")}
            </span>
            <h2>
              {t("প্রযুক্তির দক্ষতায়", "Technology skills.")}
              <br />
              {t("আত্মবিশ্বাসের নতুন শুরু।", "A confident new beginning.")}
            </h2>
            <p>
              {t(
                "Computer DB-IT Village চট্টগ্রামের ফ্রিপোর্টে কম্পিউটার প্রশিক্ষণ, বিক্রয় ও সার্ভিসিংয়ের একটি সমন্বিত প্রতিষ্ঠান। বাস্তবমুখী শিক্ষা ও দায়িত্বশীল সেবায় আমরা আপনার পাশে আছি।",
                "Computer DB-IT Village brings computer training, sales and servicing together in Freeport, Chattogram. We focus on practical learning and responsible service.",
              )}
            </p>
            <div className="check-grid">
              {[
                "হাতে-কলমে শেখার সুযোগ|Hands-on learning",
                "শিক্ষার্থী-বান্ধব পরিবেশ|Supportive environment",
                "প্র্যাকটিক্যাল প্রজেক্ট|Practical projects",
                "কোর্স শেষে মূল্যায়ন|Course assessments",
              ].map((x) => (
                <span key={x}>
                  <Icon name="CircleCheck" size={18} />
                  {t(...x.split("|"))}
                </span>
              ))}
            </div>
            <Link to="/app/about" className="text-link">
              {t("আরও জানুন", "Meet your institute")}{" "}
              <Icon name="ArrowUpRight" size={17} />
            </Link>
          </div>
        </div>
      </section>
      <section className="section soft">
        <div className="container">
          <Heading
            eyebrow={t("আপনার শেখার পরিকল্পনা", "PLAN YOUR LEARNING")}
            title={t("আসন্ন ব্যাচসমূহ", "Upcoming batches")}
            link={t("ভর্তি আবেদন", "Apply for admission")}
            to="/app/admission"
          />
          <Batches />
        </div>
      </section>
      <section className="section">
        <div className="container">
          <Heading
            eyebrow={t("প্রযুক্তি থাকুক হাতের নাগালে", "TECHNOLOGY FOR EVERYDAY")}
            title={t("আমাদের কম্পিউটার শপ", "Your neighborhood computer shop")}
            link={t("শপে ঘুরে দেখুন", "Explore the shop")}
            to="/app/shop"
          />
          <ProductGrid limit={3} />
        </div>
      </section>
      <section className="container">
        <div className="admission-banner">
          <div>
            <span className="eyebrow">YOUR FUTURE STARTS WITH ONE STEP</span>
            <h2>
              {t(
                "দক্ষতা অর্জনের যাত্রা শুরু হোক আজই।",
                "Start your learning journey today.",
              )}
            </h2>
            <p>
              {t(
                "আপনার পছন্দের কোর্সে আবেদন করুন, অথবা কথা বলুন আমাদের সাথে।",
                "Apply for your preferred course or talk to our team.",
              )}
            </p>
          </div>
          <Link className="btn orange" to="/app/admission">
            {t("অনলাইনে ভর্তি হোন", "Apply online")} <Icon name="ArrowUpRight" />
          </Link>
        </div>
      </section>
      <section className="section">
        <div className="container two-cols">
          <div>
            <Heading
              eyebrow={t("বিশ্বস্ত প্রযুক্তিসেবা", "CARE FOR YOUR TECHNOLOGY")}
              title={t(
                "ডিভাইসের সমস্যায় পাশে আছি",
                "Device trouble? We can help.",
              )}
              description={t(
                "ল্যাপটপ, ডেস্কটপ, প্রিন্টার, নেটওয়ার্ক ও সিসিটিভি — আপনার সমস্যাটি আমাদের জানান।",
                "Laptops, desktops, printers, networks and CCTV — tell us what needs attention.",
              )}
            />
            <div className="service-pills">
              {services.slice(0, 6).map((x) => (
                <span key={x}>
                  <Icon name="Check" size={15} />
                  {x}
                </span>
              ))}
            </div>
            <Link className="btn" to="/app/services">
              {t("সার্ভিস রিকোয়েস্ট করুন", "Request a service")}
              <Icon name="ArrowUpRight" size={18} />
            </Link>
          </div>
          <div className="notice-box">
            <Heading
              eyebrow="STAY UPDATED"
              title={t("নোটিশ বোর্ড", "Notice board")}
              link={t("সব দেখুন", "View all")}
              to="/app/notices"
            />
            <NoticeList compact />
          </div>
        </div>
      </section>
      <section className="container student-stories-home">
        <div className="stories-intro">
          <span className="eyebrow">PEOPLE BEHIND THE PROGRESS</span>
          <h2>
            {t("শিক্ষার্থীদের সাফল্যের গল্প", "Our students. Their next chapter.")}
          </h2>
          <p>
            {t(
              "প্রতিটি নতুন দক্ষতায় শুরু হয় নতুন সম্ভাবনা।",
              "Every new skill opens a new possibility.",
            )}
          </p>
        </div>
        <div className="stories-note">
          <Icon name="Quote" size={30} />
          <h3>
            {t(
              "বাস্তব অভিজ্ঞতা, সত্যিকারের গল্প।",
              "Real experiences. Authentic stories.",
            )}
          </h3>
          <p>
            {t(
              "শিক্ষার্থীদের অনুমতিসহ যাচাইকৃত অভিজ্ঞতা প্রকাশ করা হবে।",
              "Verified student experiences appear here with their permission.",
            )}
          </p>
          <Link className="text-link" to="/app/contact">
            {t("আপনার অভিজ্ঞতা জানান", "Share your experience")}
            <Icon name="ArrowUpRight" size={17} />
          </Link>
        </div>
      </section>
      <section className="section soft">
        <div className="container">
          <Heading
            eyebrow="OUR LEARNING COMMUNITY"
            title={t("শেখার পরিবেশ ও কার্যক্রম", "Our learning community")}
            description={t(
              "ক্লাসরুম, ল্যাব ও প্রশিক্ষণের আসল ছবি গ্যালারিতে প্রকাশ করা হবে।",
              "Institute classroom, lab and training photographs appear here when published.",
            )}
            link={t("গ্যালারি দেখুন", "View gallery")}
            to="/app/gallery"
          />
          <HomeGallery />
        </div>
      </section>
    </>
  );
}
function CourseCards({ limit }) {
  const { t, en } = useApp();
  const { rows } = useRecords("courses");
  const list = rows.length ? rows : catalog;
  return (
    <div className="course-grid">
      {list.slice(0, limit || 99).map((c, i) => (
        <Link className="course-card" to={"/app/courses/" + c.id} key={c.id}>
          <div className="course-image">
            <img
              src={c.image || catalog[i % 6].image}
              alt={c.title}
              loading="lazy"
            />
            <span className="course-tag">
              {c.tag || t("প্রশিক্ষণ কোর্স", "Training course")}
            </span>
          </div>
          <div className="course-body">
            <span className="course-en">{c.title}</span>
            <h3>{en ? c.title : c.bn || c.title}</h3>
            <p>{c.description}</p>
            <div className="course-meta">
              <span>
                <Icon name="Clock3" size={14} />
                {c.duration ||
                  t("সময়সূচি জানতে যোগাযোগ করুন", "Contact for duration")}
              </span>
            </div>
            <div className="course-foot">
              <span>
                {c.fee
                  ? `৳ ${c.fee}`
                  : t("ফি জানতে যোগাযোগ করুন", "Enquire for fees")}
              </span>
              <span className="round-arrow">
                <Icon name="ArrowUpRight" size={18} />
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
function Page({ title, sub, children }) {
  return (
    <>
      <div className="page-banner">
        <div className="container">
          <span className="eyebrow">COMPUTER DB-IT VILLAGE</span>
          <h1>{title}</h1>
          {sub && <p>{sub}</p>}
        </div>
      </div>
      <section className="section">
        <div className="container">{children}</div>
      </section>
    </>
  );
}
function Courses() {
  const { t } = useApp();
  return (
    <Page
      title={t("প্রশিক্ষণ কোর্সসমূহ", "Training courses")}
      sub={t(
        "আপনার লক্ষ্য অনুযায়ী বেছে নিন সঠিক দক্ষতা।",
        "Choose a practical skill for your goals.",
      )}
    >
      <CourseCards />
    </Page>
  );
}
function Course() {
  const { id } = useParams();
  const { t } = useApp();
  const { rows, loading } = useRecords("courses");
  const c = rows.find((c) => c.id === id) || catalog.find((c) => c.id === id);
  if (!c) return <Page title={loading ? "Loading…" : "Course not found"} />;
  return (
    <Page title={t(c.bn || c.title, c.title)} sub={c.description}>
      <div className="detail-grid">
        <div>
          <img className="detail-image" src={c.image} alt={c.title} />
          <h2>{t("বিস্তারিত সিলেবাস", "Course syllabus")}</h2>
          <ul className="syllabus">
            {(c.syllabus || []).map((s, i) => (
              <li key={i}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                {s}
              </li>
            ))}
          </ul>
          <h3>{t("ভর্তির যোগ্যতা", "Admission requirements")}</h3>
          <p>
            {c.requirements ||
              t(
                "আপনার শিক্ষাগত যোগ্যতা ও কোর্সের উপযুক্ততা নিয়ে আমাদের সাথে আলোচনা করুন।",
                "Contact the institute to discuss course suitability and educational requirements.",
              )}
          </p>
          <h3>{t("সার্টিফিকেট", "Certificate")}</h3>
          <p>
            {c.certificate ||
              t(
                "কোর্স সম্পন্ন ও মূল্যায়নের পর প্রতিষ্ঠান প্রদত্ত সার্টিফিকেটের শর্ত জানতে যোগাযোগ করুন।",
                "Contact the institute for completion, assessment and institute certificate requirements.",
              )}
          </p>
        </div>
        <aside className="panel sticky">
          <h3>{t("কোর্সের তথ্য", "Course information")}</h3>
          {[
            ["সময়কাল / Duration", c.duration],
            ["কোর্স ফি / Fee", c.fee ? `৳ ${c.fee}` : null],
            ["ক্লাস / Schedule", c.schedule],
          ].map(([k, v]) => (
            <div className="info-row" key={k}>
              <span>{k}</span>
              <b>{v || t("যোগাযোগ করুন", "Enquire")}</b>
            </div>
          ))}
          <Link to={"/app/admission?course=" + c.id} className="btn full">
            {t("ভর্তি আবেদন করুন", "Apply now")}
            <Icon name="ArrowUpRight" />
          </Link>
          <a className="btn secondary full" href="tel:01309039718">
            01309-039718
          </a>
          <Batches courseId={id} />
        </aside>
      </div>
    </Page>
  );
}
function Batches({ courseId }) {
  const { t } = useApp();
  const { rows, loading, error } = useRecords("batches");
  const list = courseId ? rows.filter((r) => r.courseId === courseId) : rows;
  return (
    <>
      {loading ? (
        <div className="skeleton" />
      ) : list.length ? (
        <div className="batch-list">
          {list.map((b) => (
            <div className="batch" key={b.id}>
              <span className="batch-icon">
                <Icon name="CalendarDays" />
              </span>
              <div>
                <h3>{b.title}</h3>
                <p>
                  {b.startDate} · {b.schedule} · {b.seats ?? "—"}{" "}
                  {t("আসন", "seats")}
                </p>
              </div>
              <Link
                className="text-link"
                to={"/app/admission?course=" + b.courseId + "&batch=" + b.id}
              >
                {t("আবেদন", "Apply")}
                <Icon name="ArrowUpRight" size={16} />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty compact">
          <Icon name="CalendarDays" />
          <div>
            <b>
              {t(
                "পরবর্তী ব্যাচের তথ্য জানতে যোগাযোগ করুন",
                "Ask about the next batch",
              )}
            </b>
            <p>
              {error
                ? t(
                    "অনলাইনে ব্যাচের তথ্য এখন পাওয়া যাচ্ছে না।",
                    "Batch information is temporarily unavailable.",
                  )
                : t(
                    "নতুন ব্যাচ প্রকাশিত হলে এখানে দেখা যাবে।",
                    "New batches appear here once published.",
                  )}
            </p>
            <a href="tel:01309039718">01309-039718</a>
          </div>
        </div>
      )}
    </>
  );
}
function Alert({ error, message }) {
  return error ? (
    <div className="alert error" role="alert">
      {error}
    </div>
  ) : message ? (
    <div className="alert success" role="status">
      {message}
    </div>
  ) : null;
}
function Field({
  label,
  name,
  type = "text",
  required = true,
  children,
  ...props
}) {
  return (
    <label className={props.wide ? "field wide" : "field"}>
      <span>
        {label}
        {required && <em> *</em>}
      </span>
      {children || (
        <input
          name={name}
          type={type}
          required={required}
          {...Object.fromEntries(
            Object.entries(props).filter(([k]) => k !== "wide"),
          )}
        />
      )}
    </label>
  );
}
function Admission() {
  const { t } = useApp();
  const { rows: courses } = useRecords("courses"),
    { rows: batches } = useRecords("batches");
  const params = new URLSearchParams(location.search);
  const [course, setCourse] = useState(params.get("course") || "");
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [done, setDone] = useState("");
  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const form = new FormData(e.currentTarget),
        file = form.get("photo"),
        upload = new FormData();
      upload.set("file", file);
      const { key } = await api("/uploads", { method: "POST", body: upload });
      const body = Object.fromEntries(form);
      body.photo = key;
      const result = await api("/admissions", {
        method: "POST",
        body: JSON.stringify(body),
      });
      setDone(result.id);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Page
      title={t("অনলাইন ভর্তি আবেদন", "Online admission")}
      sub={t(
        "সঠিক তথ্য দিয়ে আবেদন পূরণ করুন। আবেদন অনুমোদনের জন্য প্রতিষ্ঠান আপনার সাথে যোগাযোগ করবে।",
        "Complete your application. The institute contacts you after reviewing your details.",
      )}
    >
      <div className="form-layout">
        <div className="panel">
          {done ? (
            <div className="confirmation">
              <Icon name="CircleCheck" size={50} />
              <h2>{t("আবেদন জমা হয়েছে", "Application received")}</h2>
              <p>
                {t(
                  "আপনার আবেদন নম্বর সংরক্ষণ করুন।",
                  "Please save your application ID.",
                )}
              </p>
              <strong>{done}</strong>
              <p>
                {t(
                  "এটি ভর্তি নিশ্চিতকরণ নয়। অনুমোদনের পর শিক্ষার্থী আইডি দেওয়া হবে।",
                  "This is an application receipt. A student ID is assigned after approval.",
                )}
              </p>
            </div>
          ) : (
            <form onSubmit={submit}>
              <h2>{t("শিক্ষার্থীর তথ্য", "Student information")}</h2>
              <div className="form-grid">
                <Field label="শিক্ষার্থীর নাম / Student name" name="name" />
                <Field label="পিতার নাম / Father's name" name="father" />
                <Field label="মাতার নাম / Mother's name" name="mother" />
                <Field
                  label="মোবাইল / Mobile"
                  name="phone"
                  type="tel"
                  pattern="(\+?88)?01[3-9][0-9]{8}"
                />
                <Field
                  label="বিকল্প মোবাইল / Alternative mobile"
                  name="alternativePhone"
                  type="tel"
                  required={false}
                />
                <Field
                  label="জন্ম তারিখ / Date of birth"
                  name="dob"
                  type="date"
                  max={new Date().toISOString().slice(0, 10)}
                />
                <Field label="লিঙ্গ / Gender">
                  <select name="gender" required>
                    <option value="">Select</option>
                    {["Male", "Female", "Other"].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </Field>
                <Field
                  label="শিক্ষাগত যোগ্যতা / Education"
                  name="qualification"
                />
                <Field label="ঠিকানা / Address" name="address" wide>
                  <textarea name="address" minLength="5" required />
                </Field>
                <Field label="কোর্স / Course">
                  <select
                    name="courseId"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    required
                  >
                    <option value="">Select course</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="ব্যাচ / Batch">
                  <select
                    name="batchId"
                    defaultValue={params.get("batch") || ""}
                    required
                  >
                    <option value="">Select available batch</option>
                    {batches
                      .filter((b) => b.courseId === course)
                      .map((b) => (
                        <option value={b.id} key={b.id}>
                          {b.title} · {b.seats} seats
                        </option>
                      ))}
                  </select>
                </Field>
                <Field
                  label="শিক্ষার্থীর ছবি / Student photo"
                  name="photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  wide
                />
              </div>
              {!courses.length && (
                <p className="muted">
                  {t(
                    "ভর্তিযোগ্য কোর্স ও ব্যাচ প্রকাশের জন্য অপেক্ষা করুন অথবা ফোন করুন।",
                    "Applications open when courses and batches are published. Please call for assistance.",
                  )}
                </p>
              )}
              <label className="consent">
                <input type="checkbox" required />
                {t(
                  "আমার দেওয়া তথ্য সঠিক এবং ভর্তি যাচাইয়ের জন্য তথ্য ব্যবহারে সম্মত।",
                  "I confirm these details are correct and consent to their use for admission review.",
                )}
              </label>
              <Alert error={error} />
              <button className="btn" disabled={busy || !courses.length}>
                {busy
                  ? t("জমা হচ্ছে…", "Submitting…")
                  : t("আবেদন জমা দিন", "Submit application")}
                <Icon name="ArrowRight" size={18} />
              </button>
            </form>
          )}
        </div>
        <aside>
          <div className="panel">
            <Icon name="GraduationCap" size={35} />
            <h3>{t("নতুন শুরুর সঙ্গী", "Here for your next step")}</h3>
            <p>
              {t(
                "ছবি JPG, PNG অথবা WebP হতে হবে, সর্বোচ্চ ৪ MB। ভর্তি, সময়সূচি ও ফি সম্পর্কে বিস্তারিত ফোনে জেনে নিন।",
                "Upload a JPG, PNG or WebP photo up to 4 MB. Confirm fees and schedules by phone.",
              )}
            </p>
            <a href="tel:01309039718" className="text-link">
              <Icon name="Phone" size={18} />
              01309-039718
            </a>
          </div>
        </aside>
      </div>
    </Page>
  );
}
function ProductGrid({ limit, query = "", category = "All" }) {
  const { t } = useApp();
  const { rows } = useRecords("products");
  const list = rows.length ? rows : samples;
  const filtered = list.filter(
    (p) =>
      (category === "All" || p.category === category) &&
      `${p.title} ${p.brand}`.toLowerCase().includes(query.toLowerCase()),
  );
  if (!filtered.length)
    return (
      <Empty
        icon="Search"
        title={t("পণ্য পাওয়া যায়নি", "No matching products")}
        text={t(
          "অন্য নাম বা ক্যাটাগরি দিয়ে খুঁজুন।",
          "Try another search or category.",
        )}
      />
    );
  return (
    <div className="product-grid">
      {list
        .filter(
          (p) =>
            (category === "All" || p.category === category) &&
            `${p.title} ${p.brand}`.toLowerCase().includes(query.toLowerCase()),
        )
        .slice(0, limit || 999)
        .map((p) => (
          <Link className="product-card" to={"/app/shop/" + p.id} key={p.id}>
            <div className="product-image">
              <img src={p.image} alt={p.title} loading="lazy" />
              <span className="sample-label">
                {p.sample
                  ? t("নমুনা পণ্য", "Sample product")
                  : p.stock > 0
                    ? t("স্টকে আছে", "In stock")
                    : t("স্টক নেই", "Out of stock")}
              </span>
            </div>
            <div className="product-body">
              <small>
                {p.category} · {p.brand}
              </small>
              <h3>{p.title}</h3>
              <div className="product-foot">
                <b>
                  {p.sample || !p.price
                    ? t("মূল্য জানতে যোগাযোগ করুন", "Enquire for price")
                    : `৳ ${p.price.toLocaleString()}`}
                </b>
                <span className="round-arrow">
                  <Icon name="ArrowUpRight" size={18} />
                </span>
              </div>
            </div>
          </Link>
        ))}
    </div>
  );
}
function Shop() {
  const { t } = useApp();
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState("All");
  return (
    <Page
      title={t("কম্পিউটার শপ", "Computer shop")}
      sub={t(
        "কম্পিউটার থেকে অ্যাক্সেসরিজ — আপনার প্রয়োজনের সঠিক পণ্য। নমুনা পণ্য ক্রয়যোগ্য নয়।",
        "Computers and accessories for your needs. Sample products are for illustration and cannot be ordered.",
      )}
    >
      <div className="toolbar">
        <div className="search-field">
          <Icon name="Search" />
          <input
            aria-label="Search products"
            placeholder={t("পণ্য খুঁজুন…", "Search products…")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          aria-label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <Link to="/app/cart" className="btn">
          <Icon name="ShoppingBag" size={18} />
          {t("শপিং কার্ট", "View cart")}
        </Link>
      </div>
      <ProductGrid query={query} category={category} />
    </Page>
  );
}
function Product() {
  const { id } = useParams();
  const { rows, loading } = useRecords("products");
  const { t, cart, setCart } = useApp();
  const [count, setCount] = useState(1),
    [added, setAdded] = useState(false);
  const p = rows.find((x) => x.id === id) || samples.find((x) => x.id === id);
  if (!p) return <Page title={loading ? "Loading…" : "Product not found"} />;
  const enquiry = `Hello, I would like to enquire about ${p.title}.`;
  return (
    <Page title={p.title}>
      <div className="detail-grid">
        <img className="detail-image" src={p.image} alt={p.title} />
        <div className="panel">
          <span className="eyebrow">{p.category}</span>
          <h2>{p.title}</h2>
          <p>
            {p.description ||
              t(
                "বিস্তারিত স্পেসিফিকেশন এবং বর্তমান মূল্য জানতে যোগাযোগ করুন।",
                "Contact us for detailed specifications and current pricing.",
              )}
          </p>
          <p>{p.brand}</p>
          {p.sample ? (
            <div className="alert">
              {t(
                "এটি নমুনা পণ্য। প্রকৃত পণ্য, মূল্য ও স্টক জানতে যোগাযোগ করুন।",
                "Sample product. Contact the shop for actual products, pricing and availability.",
              )}
            </div>
          ) : (
            <>
              <h2>
                ৳ {p.price?.toLocaleString() || "—"}{" "}
                {p.regularPrice > p.price && (
                  <del className="old-price">৳ {p.regularPrice}</del>
                )}
              </h2>
              <p>
                {p.stock > 0
                  ? `${p.stock} ${t("টি স্টকে আছে", "in stock")}`
                  : t("স্টক নেই", "Out of stock")}
              </p>
              <Field
                label={t("পরিমাণ", "Quantity")}
                type="number"
                name="quantity"
                min="1"
                max={Math.min(20, p.stock)}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
              />
              <button
                className="btn full"
                disabled={!p.price || p.stock < count || count < 1}
                onClick={() => {
                  setCart([
                    ...cart.filter((x) => x.id !== p.id),
                    { ...p, quantity: count },
                  ]);
                  setAdded(true);
                }}
              >
                <Icon name="ShoppingBag" size={18} />
                {t("কার্টে যোগ করুন", "Add to cart")}
              </button>
              {added && (
                <Alert message={t("কার্টে যোগ হয়েছে", "Added to cart")} />
              )}
            </>
          )}
          <a
            className="btn secondary full"
            href={
              "https://wa.me/8801309039718?text=" + encodeURIComponent(enquiry)
            }
            target="_blank"
            rel="noreferrer"
          >
            <Icon name="MessageCircle" size={18} />
            {t("WhatsApp-এ জানতে চান", "Enquire on WhatsApp")}
          </a>
        </div>
      </div>
    </Page>
  );
}
function Cart() {
  const { cart, setCart, t } = useApp();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [done, setDone] = useState("");
  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const body = Object.fromEntries(new FormData(e.currentTarget));
      body.items = cart.map((p) => ({ id: p.id, quantity: p.quantity }));
      const r = await api("/orders", {
        method: "POST",
        body: JSON.stringify(body),
      });
      setDone(r.id);
      setCart([]);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Page title={t("শপিং কার্ট", "Shopping cart")}>
      {done ? (
        <div className="panel confirmation">
          <Icon name="CircleCheck" size={45} />
          <h2>{t("অর্ডার গ্রহণ করা হয়েছে", "Order received")}</h2>
          <strong>{done}</strong>
          <p>
            {t(
              "স্টক ও ডেলিভারি যাচাইয়ের জন্য আমরা যোগাযোগ করব।",
              "We contact you to confirm stock and delivery details.",
            )}
          </p>
        </div>
      ) : !cart.length ? (
        <Empty
          icon="ShoppingBag"
          title={t("কার্টে কোনো পণ্য নেই", "Your cart is empty")}
          text={t(
            "শপ থেকে আপনার প্রয়োজনীয় পণ্য বেছে নিন।",
            "Explore the shop and choose a product.",
          )}
        >
          <Link className="btn" to="/app/shop">
            {t("শপে যান", "Explore shop")}
          </Link>
        </Empty>
      ) : (
        <div className="form-layout">
          <div>
            {cart.map((p) => (
              <div className="cart-row panel" key={p.id}>
                <img src={p.image} alt={p.title} />
                <div>
                  <h3>{p.title}</h3>
                  <b>৳ {p.price}</b>
                </div>
                <input
                  aria-label={"Quantity for " + p.title}
                  type="number"
                  min="1"
                  max={Math.min(20, p.stock)}
                  value={p.quantity}
                  onChange={(e) =>
                    setCart(
                      cart.map((x) =>
                        x.id === p.id
                          ? {
                              ...x,
                              quantity: Math.max(
                                1,
                                Math.min(20, Number(e.target.value)),
                              ),
                            }
                          : x,
                      ),
                    )
                  }
                />
                <button
                  className="icon-button"
                  aria-label="Remove product"
                  onClick={() => setCart(cart.filter((x) => x.id !== p.id))}
                >
                  <Icon name="Trash2" />
                </button>
              </div>
            ))}
          </div>
          <form className="panel" onSubmit={submit}>
            <h2>{t("অর্ডারের তথ্য", "Order details")}</h2>
            <Field label="নাম / Customer name" name="name" />
            <Field
              label="মোবাইল / Phone"
              name="phone"
              type="tel"
              pattern="(\+?88)?01[3-9][0-9]{8}"
            />
            <Field label="ডেলিভারি ঠিকানা / Delivery address">
              <textarea name="address" required minLength="10" />
            </Field>
            <div className="info-row">
              <span>Cash on Delivery</span>
              <b>
                ৳{" "}
                {cart
                  .reduce((a, p) => a + p.quantity * p.price, 0)
                  .toLocaleString()}
              </b>
            </div>
            <p className="muted">
              {t(
                "ডেলিভারি চার্জ ও সময় ফোনে নিশ্চিত করা হবে।",
                "Delivery charges and timing are confirmed by phone.",
              )}
            </p>
            <Alert error={error} />
            <button className="btn full" disabled={busy}>
              {busy ? "Submitting…" : t("অর্ডার জমা দিন", "Place order")}
            </button>
          </form>
        </div>
      )}
    </Page>
  );
}
function ServicePage() {
  const { t } = useApp();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [done, setDone] = useState("");
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await api("/services", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
      });
      setDone(r.id);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Page
      title={t("কম্পিউটার সার্ভিসিং সেন্টার", "Computer servicing center")}
      sub={t(
        "আপনার ডিভাইসের সমস্যা জানান। পরীক্ষা ও খরচের অনুমোদনের পর সার্ভিসিং শুরু হবে।",
        "Tell us what needs fixing. Work begins after diagnosis and your approval of the cost.",
      )}
    >
      <div className="form-layout">
        <form className="panel" onSubmit={submit}>
          {done ? (
            <div className="confirmation">
              <Icon name="CircleCheck" size={45} />
              <h2>{t("রিকোয়েস্ট জমা হয়েছে", "Request received")}</h2>
              <strong>{done}</strong>
              <p>
                {t(
                  "সময় নিশ্চিত করতে আমরা ফোন করব।",
                  "We contact you to confirm an appointment.",
                )}
              </p>
            </div>
          ) : (
            <>
              <h2>{t("সার্ভিস রিকোয়েস্ট", "Request a service")}</h2>
              <div className="form-grid">
                <Field label="নাম / Customer name" name="name" />
                <Field
                  label="মোবাইল / Phone"
                  name="phone"
                  type="tel"
                  pattern="(\+?88)?01[3-9][0-9]{8}"
                />
                <Field label="ডিভাইস / Device type">
                  <select name="deviceType" required>
                    <option value="">Select device</option>
                    {[
                      "Laptop",
                      "Desktop",
                      "Printer",
                      "CCTV",
                      "Network",
                      "Other",
                    ].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </Field>
                <Field label="মডেল / Device model" name="deviceModel" />
                <Field label="সমস্যার বিবরণ / Problem" wide>
                  <textarea
                    name="problem"
                    required
                    minLength="10"
                    maxLength="3000"
                  />
                </Field>
                <Field
                  label="পছন্দের তারিখ / Preferred date"
                  name="date"
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                />
              </div>
              <Alert error={error} />
              <button disabled={busy} className="btn">
                {busy ? "Submitting…" : t("রিকোয়েস্ট জমা দিন", "Submit request")}
                <Icon name="ArrowRight" size={18} />
              </button>
            </>
          )}
        </form>
        <aside className="panel">
          <h3>{t("আমাদের সেবাসমূহ", "Our services")}</h3>
          <ul className="service-list">
            {services.map((s) => (
              <li key={s}>
                <Icon name="CheckCircle2" size={18} />
                {s}
              </li>
            ))}
          </ul>
          <a href="tel:01309039718" className="btn secondary full">
            <Icon name="Phone" size={18} />
            01309-039718
          </a>
        </aside>
      </div>
    </Page>
  );
}
function Empty({ icon = "Inbox", title, text, children }) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <Icon name={icon} size={30} />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
      {children}
    </div>
  );
}
function Results() {
  const { t } = useApp();
  const [result, setResult] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [pdfBusy, setPdfBusy] = useState(false);
  async function search(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setResult(null);
    const f = new FormData(e.currentTarget);
    try {
      setResult(
        await api(
          `/results?studentId=${encodeURIComponent(f.get("studentId").trim())}&examinationId=${encodeURIComponent(f.get("examinationId").trim())}`,
        ),
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function pdf() {
    setPdfBusy(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(document.getElementById("result-card"), {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const doc = new jsPDF("p", "mm", "a4");
      const height = (canvas.height * 190) / canvas.width;
      doc.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        10,
        10,
        190,
        Math.min(height, 277),
      );
      doc.save(`result-${result.studentId}.pdf`);
    } catch (e) {
      setError(
        "PDF generation failed. Please use Print and choose Save as PDF.",
      );
    } finally {
      setPdfBusy(false);
    }
  }
  return (
    <Page
      title={t("পরীক্ষার ফলাফল", "Examination results")}
      sub={t(
        "শিক্ষার্থী আইডি ও পরীক্ষার আইডি দিয়ে প্রকাশিত ফলাফল দেখুন।",
        "Find your published result using your student and examination IDs.",
      )}
    >
      <form className="search-panel panel no-print" onSubmit={search}>
        <Field label="শিক্ষার্থী আইডি / Student ID" name="studentId" />
        <Field label="পরীক্ষার আইডি / Examination ID" name="examinationId" />
        <button className="btn" disabled={busy}>
          <Icon name="Search" size={18} />
          {busy ? "Searching…" : t("ফলাফল দেখুন", "Find result")}
        </button>
      </form>
      <Alert error={error} />
      {result ? (
        <>
          <div className="result-actions no-print">
            <button className="btn secondary" onClick={() => window.print()}>
              <Icon name="Printer" size={18} />
              Print result
            </button>
            <button className="btn" onClick={pdf} disabled={pdfBusy}>
              <Icon name="Download" size={18} />
              {pdfBusy ? "Preparing PDF…" : "Download PDF"}
            </button>
          </div>
          <article className="result-card" id="result-card">
            <div className="result-header">
              <img className="brand-mark" src="/img/logo.png" alt="Computer DB-IT Village logo" width="48" height="48" />
              <div>
                <h2>Computer DB-IT Village</h2>
                <p>Sabiya Mansion, 1st Floor, Freeport, CEPZ, Chattogram</p>
                <h3>EXAMINATION RESULT CARD</h3>
              </div>
            </div>
            <div className="result-student">
              <div>
                <p>
                  <b>Student name:</b> {result.name}
                </p>
                <p>
                  <b>Student ID:</b> {result.studentId}
                </p>
                <p>
                  <b>Course:</b> {result.course}
                </p>
                <p>
                  <b>Batch:</b> {result.batch}
                </p>
                <p>
                  <b>Examination:</b> {result.exam} ({result.examinationId})
                </p>
                <p>
                  <b>Date:</b> {result.date}
                </p>
              </div>
              <div className="photo-placeholder">
                {result.photo ? (
                  <img
                    crossOrigin="anonymous"
                    src={result.photo}
                    alt="Student photograph"
                  />
                ) : (
                  <>
                    <Icon name="UserRound" size={40} />
                    <small>Photo not available</small>
                  </>
                )}
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Total marks</th>
                  <th>Pass marks</th>
                  <th>Obtained</th>
                </tr>
              </thead>
              <tbody>
                {result.marks.map((m, i) => (
                  <tr key={i}>
                    <td>{m.subject}</td>
                    <td>{m.total}</td>
                    <td>{m.pass}</td>
                    <td>{m.obtained}</td>
                  </tr>
                ))}
                <tr>
                  <th>Total</th>
                  <th>{result.total}</th>
                  <th>—</th>
                  <th>{result.obtained}</th>
                </tr>
              </tbody>
            </table>
            <div className="result-summary">
              <span>
                Percentage <b>{result.percentage}%</b>
              </span>
              <span>
                Grade <b>{result.grade}</b>
              </span>
              <span>
                Status <b>{result.status}</b>
              </span>
            </div>
            <div className="signatures">
              <span>Institute seal</span>
              <span>Authorized signature</span>
            </div>
            <p className="result-note">
              Published electronic result. Contact the institute for an attested
              copy.
            </p>
          </article>
        </>
      ) : (
        !busy &&
        !error && (
          <Empty
            icon="FileCheck2"
            title={t("আপনার ফলাফল খুঁজুন", "Your results, in one place")}
            text={t(
              "শুধুমাত্র প্রকাশিত ফলাফল এখানে পাওয়া যাবে।",
              "Only results published by the institute appear here.",
            )}
          />
        )
      )}
    </Page>
  );
}
function Verify() {
  const { t } = useApp();
  const [result, setResult] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setResult(null);
    try {
      setResult(
        await api(
          "/certificates/" +
            encodeURIComponent(
              new FormData(e.currentTarget).get("certificateId").trim(),
            ),
        ),
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Page
      title={t("সার্টিফিকেট যাচাই", "Certificate verification")}
      sub={t(
        "সার্টিফিকেট আইডি দিয়ে সত্যতা যাচাই করুন।",
        "Verify an institute certificate using its certificate ID.",
      )}
    >
      <div className="narrow">
        <form className="panel" onSubmit={submit}>
          <span className="empty-icon">
            <Icon name="ShieldCheck" size={32} />
          </span>
          <h2>{t("বিশ্বাসযোগ্য যাচাই", "Verify with confidence")}</h2>
          <Field
            label="সার্টিফিকেট আইডি / Certificate ID"
            name="certificateId"
            placeholder="CERT-…"
          />
          <button className="btn full" disabled={busy}>
            {busy ? "Checking…" : t("যাচাই করুন", "Verify certificate")}
            <Icon name="Search" size={18} />
          </button>
          <Alert error={error} />
        </form>
        {result && (
          <div className="panel verified">
            <Icon name="BadgeCheck" size={40} />
            <h2>Verified certificate</h2>
            {Object.entries(result).map(([k, v]) => (
              <div className="info-row" key={k}>
                <span>{k}</span>
                <b>{v}</b>
              </div>
            ))}
          </div>
        )}
      </div>
    </Page>
  );
}
function NoticeList({ compact = false }) {
  const { rows, error, loading } = useRecords("notices");
  const { t } = useApp();
  if (loading) return <div className="skeleton" />;
  if (!rows.length)
    return (
      <Empty
        icon="Bell"
        title={t("নতুন নোটিশের অপেক্ষায়", "No published notices yet")}
        text={
          error
            ? t(
                "নোটিশ এখন লোড করা যাচ্ছে না। পরে চেষ্টা করুন।",
                "Notices are temporarily unavailable. Please try again later.",
              )
            : t(
                "ভর্তি ও পরীক্ষার নতুন খবর এখানে প্রকাশিত হবে।",
                "Admission and examination updates appear here.",
              )
        }
      />
    );
  return (
    <div className="notices">
      {rows.slice(0, compact ? 3 : 100).map((n) => (
        <article key={n.id}>
          <span className="notice-date">
            <b>{n.date?.slice(8) || "—"}</b>
            {n.date?.slice(0, 7)}
          </span>
          <div>
            <small>{n.category}</small>
            <h3>{n.title}</h3>
            <p>{n.description}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
function Notices() {
  const { t } = useApp();
  return (
    <Page title={t("নোটিশ বোর্ড", "Notice board")}>
      <NoticeList />
    </Page>
  );
}
function HomeGallery() {
  const { rows } = useRecords("gallery");
  const { t } = useApp();
  return rows.length ? (
    <div className="gallery-grid">
      {rows.slice(0, 3).map((r) => (
        <figure key={r.id}>
          <img src={r.image} alt={r.title} loading="lazy" />
          <figcaption>{r.title}</figcaption>
        </figure>
      ))}
    </div>
  ) : (
    <div className="gallery-preview">
      <div>
        <Icon name="Camera" size={34} />
        <h3>
          {t(
            "আমাদের ক্লাসরুম থেকে গল্প আসছে",
            "Stories from our classrooms, coming soon",
          )}
        </h3>
        <p>
          {t(
            "প্রশিক্ষণ কার্যক্রমের যাচাইকৃত ছবি প্রকাশের অপেক্ষায়।",
            "Verified institute activity photographs have not been published yet.",
          )}
        </p>
      </div>
      <Link className="text-link" to="/app/contact">
        {t("প্রতিষ্ঠান ঘুরে দেখুন", "Visit the institute")}
        <Icon name="ArrowUpRight" size={18} />
      </Link>
    </div>
  );
}
function Gallery() {
  const { t } = useApp();
  const { rows, error, loading } = useRecords("gallery");
  const [category, setCategory] = useState("All"),
    [selected, setSelected] = useState(null);
  return (
    <Page title={t("আমাদের গ্যালারি", "Our gallery")}>
      <div className="filter-tabs">
        {[
          "All",
          "Classroom",
          "Computer Lab",
          "Students",
          "Training Activities",
          "Examination",
          "Certificates",
          "Events",
        ].map((c) => (
          <button
            className={category === c ? "selected" : ""}
            onClick={() => setCategory(c)}
            key={c}
          >
            {c}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="skeleton" />
      ) : rows.length ? (
        <div className="gallery-grid">
          {rows
            .filter((r) => category === "All" || r.category === category)
            .map((r) => (
              <button
                className="gallery-item"
                onClick={() => setSelected(r)}
                key={r.id}
              >
                <img src={r.image} alt={r.title} />
                <b>{r.title}</b>
                <small>{r.category}</small>
              </button>
            ))}
        </div>
      ) : (
        <Empty
          icon="Images"
          title={t("ছবি শীঘ্রই আসছে", "Institute photos coming soon")}
          text={
            error
              ? "Gallery is temporarily unavailable."
              : "Photos of our classrooms, training activities and events appear after publication."
          }
        />
      )}{" "}
      {selected && (
        <div className="modal" onClick={() => setSelected(null)}>
          <div
            className="modal-content"
            role="dialog"
            aria-modal="true"
            aria-label={selected.title}
          >
            <button
              onClick={() => setSelected(null)}
              aria-label="Close image"
              className="icon-button"
            >
              <Icon name="X" />
            </button>
            <img src={selected.image} alt={selected.title} />
            <h3>{selected.title}</h3>
          </div>
        </div>
      )}
    </Page>
  );
}
function About() {
  const { t } = useApp();
  return (
    <Page
      title={t("আমাদের সম্পর্কে", "About Computer DB-IT Village")}
      sub={t(
        "প্রশিক্ষণ, প্রযুক্তি ও সেবা — আপনার পাশে।",
        "Practical training, technology and service, close to home.",
      )}
    >
      <div className="about-grid">
        <div className="about-art">
          <img
            src="/.netlify/images?url=/img/classroom-study.png&w=1200&fm=webp"
            alt={t("কম্পিউটার ডিবি-আইটি ভিলেজের ক্লাসরুমে শিক্ষার্থীদের পড়াশোনা", "Students studying in the Computer DB-IT Village classroom")}
            loading="lazy"
          />
          <small className="muted">{t("আমাদের ক্লাসরুমে শিক্ষার্থীরা", "Students in our classroom")}</small>
        </div>
        <div>
          <span className="eyebrow">LEARN. PRACTICE. GROW.</span>
          <h2>
            {t("আপনার দক্ষতা, আমাদের অঙ্গীকার।", "Your skills. Our commitment.")}
          </h2>
          <p>
            {t(
              "Computer DB-IT Village চট্টগ্রামের ফ্রিপোর্ট, সিইপিজেড এলাকায় কম্পিউটার প্রশিক্ষণ, বিক্রয় ও সার্ভিসিং সেবা প্রদান করে। আমরা শিক্ষার্থী ও স্থানীয় গ্রাহকদের প্রযুক্তির সঠিক ব্যবহারে সহায়তা করতে কাজ করছি।",
              "Computer DB-IT Village provides computer training, sales and servicing in Freeport, CEPZ, Chattogram. We support students and local customers in making practical use of technology.",
            )}
          </p>
          <p>
            {t(
              "অফিস অ্যাপ্লিকেশন, ডিজাইন, হার্ডওয়্যার, ফ্রিল্যান্সিং ও ডিজিটাল মার্কেটিং — নিজের লক্ষ্যের সাথে মানানসই প্রশিক্ষণ বেছে নিতে আমাদের সাথে আলোচনা করুন।",
              "Discuss your goals with us and explore training in office applications, design, hardware, freelancing and digital marketing.",
            )}
          </p>
          <Link className="btn" to="/app/contact">
            {t("আমাদের সাথে কথা বলুন", "Talk to our team")}
            <Icon name="ArrowUpRight" size={18} />
          </Link>
        </div>
      </div>
      <div className="values-grid">
        {[
          [
            "BookOpen",
            "বাস্তবমুখী শিক্ষা",
            "Practical learning",
            "Learn through guided practice and relevant projects.",
          ],
          [
            "HeartHandshake",
            "দায়িত্বশীল সেবা",
            "Responsible service",
            "Clear advice, careful diagnosis and communication.",
          ],
          [
            "ShieldCheck",
            "স্বচ্ছ তথ্য",
            "Transparent information",
            "Course details, fees and service costs confirmed directly.",
          ],
        ].map(([icon, bn, en, desc]) => (
          <div className="panel" key={en}>
            <Icon name={icon} size={32} />
            <h3>{t(bn, en)}</h3>
            <p>{desc}</p>
          </div>
        ))}
      </div>
      <div className="panel success-stories">
        <h2>{t("শিক্ষার্থীদের সাফল্যের গল্প", "Student success stories")}</h2>
        <p>
          {t(
            "অনুমতিসহ যাচাইকৃত শিক্ষার্থীদের অভিজ্ঞতা শীঘ্রই প্রকাশ করা হবে।",
            "Verified student stories are published with consent. No stories have been published yet.",
          )}
        </p>
      </div>
    </Page>
  );
}
function Contact() {
  const { t } = useApp();
  return (
    <Page
      title={t("যোগাযোগ করুন", "Let’s talk")}
      sub={t(
        "প্রশিক্ষণ, পণ্য কিংবা সার্ভিসিং — আপনার প্রশ্নের উত্তর দিতে আমরা আছি।",
        "For training, products or servicing, our team is here to help.",
      )}
    >
      <div className="contact-grid">
        <div className="panel">
          <Icon name="MapPin" size={32} />
          <h3>{t("আমাদের ঠিকানা", "Visit us")}</h3>
          <p>
            Sabiya Mansion, 1st Floor,
            <br />
            Freeport, CEPZ, Chattogram,
            <br />
            Bangladesh.
          </p>
          <a
            className="text-link"
            href="https://www.google.com/maps/search/?api=1&query=Sabiya+Mansion+Freeport+CEPZ+Chattogram"
            target="_blank"
            rel="noreferrer"
          >
            Open Google Maps <Icon name="ArrowUpRight" size={17} />
          </a>
        </div>
        <div className="panel">
          <Icon name="Phone" size={32} />
          <h3>{t("সরাসরি ফোন করুন", "Call our team")}</h3>
          {["01309039718", "01309039719", "01888506818"].map((p) => (
            <p key={p}>
              <a href={"tel:" + p}>{p}</a>
            </p>
          ))}
          <small>
            {t(
              "আসার আগে সময় নিশ্চিত করুন।",
              "Please confirm opening hours before visiting.",
            )}
          </small>
        </div>
        <div className="panel">
          <Icon name="Mail" size={32} />
          <h3>{t("অনলাইনে যোগাযোগ", "Connect online")}</h3>
          <p>
            <a href="mailto:jashim1997it@gmail.com">jashim1997it@gmail.com</a>
          </p>
          <a
            className="text-link"
            href="https://www.facebook.com/computerdbitvillage"
            target="_blank"
            rel="noreferrer"
          >
            <Icon name="Facebook" size={18} />
            Facebook <Icon name="ArrowUpRight" size={17} />
          </a>
          <p>
            <a href="https://wa.me/8801309039718">WhatsApp enquiry</a>
          </p>
        </div>
      </div>
      <div className="visit-band">
        <Icon name="Building2" size={45} />
        <div>
          <h2>{t("সরাসরি দেখে সিদ্ধান্ত নিন।", "Come by. See for yourself.")}</h2>
          <p>
            {t(
              "আমাদের ল্যাব, কোর্স ও সুবিধা সম্পর্কে জানতে প্রতিষ্ঠানে আসুন।",
              "Visit the institute to learn about our lab, courses and facilities.",
            )}
          </p>
        </div>
        <a className="btn" href="tel:01309039718">
          {t("ভিজিটের জন্য ফোন করুন", "Call to arrange a visit")}
        </a>
      </div>
    </Page>
  );
}
function Footer() {
  const { t } = useApp();
  return (
    <footer>
      <div className="container footer-main">
        <div>
          <Link className="brand footer-brand" to="/">
            <img className="brand-mark" src="/img/logo.png" alt="Computer DB-IT Village logo" width="48" height="48" />
            <span>
              COMPUTER <b>DB-IT VILLAGE</b>
              <small>TRAINING · TECHNOLOGY · TRUST</small>
            </span>
          </Link>
          <p>
            {t(
              "প্রযুক্তির সঠিক প্রশিক্ষণ ও বিশ্বস্ত সেবায় আপনার আগামীর সঙ্গী।",
              "Your local partner for practical technology training and dependable service.",
            )}
          </p>
          <a
            className="social"
            href="https://www.facebook.com/computerdbitvillage"
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook"
          >
            <Icon name="Facebook" size={19} />
          </a>
        </div>
        <div>
          <h4>{t("দ্রুত লিংক", "Explore")}</h4>
          <Link to="/app/about">{t("আমাদের সম্পর্কে", "About us")}</Link>
          <Link to="/app/courses">{t("প্রশিক্ষণ কোর্স", "Training courses")}</Link>
          <Link to="/app/admission">
            {t("অনলাইন ভর্তি", "Online admission")}
          </Link>
          <Link to="/app/shop">{t("কম্পিউটার শপ", "Computer shop")}</Link>
          <Link to="/app/services">
            {t("সার্ভিসিং সেন্টার", "Servicing center")}
          </Link>
        </div>
        <div>
          <h4>{t("শিক্ষার্থীদের জন্য", "Student resources")}</h4>
          <Link to="/app/student">{t("স্টুডেন্ট পোর্টাল", "Student portal")}</Link>
          <Link to="/app/results">
            {t("পরীক্ষার ফলাফল", "Examination results")}
          </Link>
          <Link to="/app/verify">
            {t("সার্টিফিকেট যাচাই", "Certificate verification")}
          </Link>
          <Link to="/app/notices">{t("নোটিশ বোর্ড", "Notice board")}</Link>
          <Link to="/app/admin">{t("অ্যাডমিন লগইন", "Admin login")}</Link>
        </div>
        <div>
          <h4>{t("যোগাযোগ", "Get in touch")}</h4>
          <p>
            <Icon name="MapPin" size={16} /> Sabiya Mansion, 1st Floor,
            <br />
            Freeport, CEPZ, Chattogram
          </p>
          <a href="tel:01309039718">
            <Icon name="Phone" size={15} />
            01309-039718, 01309-039719
          </a>
          <a href="tel:01888506818">01888-506818</a>
          <a href="mailto:jashim1997it@gmail.com">
            <Icon name="Mail" size={15} />
            jashim1997it@gmail.com
          </a>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>
          © {new Date().getFullYear()} Computer DB-IT Village. All rights
          reserved.
        </span>
        <span>{t("দক্ষতা · প্রযুক্তি · আস্থা", "Skills · Technology · Trust")}</span>
      </div>
    </footer>
  );
}
function LoginPanel({ onLogin, title = "Secure sign in" }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [invite, setInvite] = useState(null),
    [recovery, setRecovery] = useState(false);
  useEffect(() => {
    handleAuthCallback()
      .then((r) => {
        if (r?.type === "invite") setInvite(r.token);
        else if (r?.type === "recovery") setRecovery(true);
        else if (r?.user) onLogin(r.user);
      })
      .catch((e) => setError(e.message));
  }, []);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    try {
      let u;
      if (invite) u = await acceptInvite(invite, f.get("password"));
      else if (recovery) u = await updateUser({ password: f.get("password") });
      else u = await login(f.get("email"), f.get("password"));
      onLogin(u);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="narrow panel login-panel">
      <span className="empty-icon">
        <Icon name="LockKeyhole" size={31} />
      </span>
      <h2>
        {invite
          ? "Accept your invitation"
          : recovery
            ? "Set a new password"
            : title}
      </h2>
      <p>Use your institute account to continue.</p>
      <form onSubmit={submit}>
        {!invite && !recovery && (
          <Field
            label="Email address"
            name="email"
            type="email"
            autoComplete="username"
          />
        )}
        <Field
          label="Password"
          name="password"
          type="password"
          minLength={invite || recovery ? 10 : 1}
          autoComplete={
            invite || recovery ? "new-password" : "current-password"
          }
        />
        <Alert error={error} message={message} />
        <button className="btn full" disabled={busy}>
          {busy
            ? "Please wait…"
            : invite
              ? "Accept invitation"
              : recovery
                ? "Update password"
                : "Sign in"}
          <Icon name="ArrowRight" size={18} />
        </button>
        {!invite && !recovery && (
          <button
            type="button"
            className="text-link forgot"
            onClick={async () => {
              const input = document.querySelector('input[name="email"]');
              if (!input?.value || !input.checkValidity()) {
                setError("Enter your email address first.");
                return;
              }
              try {
                await requestPasswordRecovery(input.value);
                setError("");
                setMessage(
                  "Check your inbox for password recovery instructions.",
                );
              } catch (e) {
                setError(e.message);
              }
            }}
          >
            Forgot password?
          </button>
        )}
      </form>
    </div>
  );
}
function Student() {
  const [user, setUser] = useState(undefined),
    [profile, setProfile] = useState(null),
    [error, setError] = useState("");
  useEffect(() => {
    getUser().then(setUser);
  }, []);
  useEffect(() => {
    if (user)
      api("/student")
        .then(setProfile)
        .catch((e) => setError(e.message));
  }, [user]);
  return (
    <Page title="স্টুডেন্ট পোর্টাল / Student portal">
      {user === undefined ? (
        <div className="skeleton" />
      ) : !user ? (
        <LoginPanel title="Student sign in" onLogin={setUser} />
      ) : (
        <>
          <div className="toolbar">
            <h2>
              Welcome, {profile?.student?.data.name || user.name || "student"}
            </h2>
            <button
              className="btn secondary"
              onClick={async () => {
                await logout();
                setUser(null);
                setProfile(null);
              }}
            >
              Sign out
            </button>
          </div>
          <Alert error={error} />
          {profile && (
            <>
              <div className="panel">
                <h3>My student profile</h3>
                {[
                  ["Student ID", profile.student.id],
                  ["Course", profile.student.courseId],
                  ["Batch", profile.student.batchId],
                  ["Status", profile.student.status],
                  ["Course start", profile.student.data.startDate],
                  ["Course end", profile.student.data.endDate],
                ].map(([k, v]) => (
                  <div className="info-row" key={k}>
                    <span>{k}</span>
                    <b>{v || "—"}</b>
                  </div>
                ))}
                <Link to="/app/results" className="btn">
                  Find published results
                </Link>
              </div>
              <h2>My attendance</h2>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {profile.attendance.map((a) => (
                    <tr key={a.id}>
                      <td>{a.date}</td>
                      <td>{a.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!profile.attendance.length && (
                <Empty title="No attendance recorded yet" />
              )}
            </>
          )}
        </>
      )}
    </Page>
  );
}
function titleCase(s) {
  return s.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function Admin() {
  const [user, setUser] = useState(undefined),
    [module, setModule] = useState("dashboard");
  useEffect(() => {
    getUser().then(setUser);
  }, []);
  if (user === undefined)
    return (
      <Page title="Admin">
        <div className="skeleton" />
      </Page>
    );
  if (!user)
    return (
      <Page title="প্রশাসন / Administration">
        <LoginPanel title="Administrator sign in" onLogin={setUser} />
      </Page>
    );
  if (
    !user.roles?.includes("admin") &&
    !user.appMetadata?.roles?.includes("admin")
  )
    return (
      <Page title="Access restricted">
        <Alert error="Your account does not have the administrator role. Contact the institute administrator." />
        <button
          className="btn"
          onClick={async () => {
            await logout();
            setUser(null);
          }}
        >
          Sign out
        </button>
      </Page>
    );
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <span className="eyebrow">INSTITUTE WORKSPACE</span>
        <h3>Administration</h3>
        {modules.map((m) => (
          <button
            className={m === module ? "selected" : ""}
            key={m}
            onClick={() => setModule(m)}
          >
            <Icon
              name={
                m === "dashboard"
                  ? "LayoutDashboard"
                  : m === "students"
                    ? "Users"
                    : m === "products"
                      ? "Package"
                      : m === "attendance"
                        ? "CalendarCheck"
                        : "FolderOpen"
              }
              size={18}
            />
            {titleCase(m)}
          </button>
        ))}
        <button
          onClick={async () => {
            await logout();
            setUser(null);
          }}
        >
          <Icon name="LogOut" size={18} />
          Sign out
        </button>
      </aside>
      <section className="admin-content">
        <div className="admin-heading">
          <div>
            <span className="eyebrow">ADMIN CONTROL PANEL</span>
            <h1>{titleCase(module)}</h1>
          </div>
          <span className="admin-user">
            <Icon name="ShieldCheck" size={17} />
            {user.email}
          </span>
        </div>
        {module === "dashboard" ? (
          <Dashboard onSelect={setModule} />
        ) : (
          <RecordManager key={module} resource={module} />
        )}
      </section>
    </div>
  );
}
function Dashboard({ onSelect }) {
  const [data, setData] = useState({}),
    [error, setError] = useState("");
  useEffect(() => {
    Promise.all(
      [
        "students",
        "admissions",
        "courses",
        "batches",
        "results",
        "products",
        "orders",
        "service_requests",
      ].map(async (r) => [r, await api("/admin/" + r)]),
    )
      .then((rows) => setData(Object.fromEntries(rows)))
      .catch((e) => setError(e.message));
  }, []);
  const cards = [
    ["Total Students", data.students?.length, "students", "Users"],
    [
      "Active Students",
      data.students?.filter((x) => x.status === "Active").length,
      "students",
      "UserCheck",
    ],
    [
      "New Admissions",
      data.admissions?.filter(
        (x) => new Date(x.createdAt) > new Date(Date.now() - 30 * 86400000),
      ).length,
      "admissions",
      "UserPlus",
    ],
    ["Total Courses", data.courses?.length, "courses", "BookOpen"],
    [
      "Upcoming Batches",
      data.batches?.filter(
        (x) => x.data.startDate >= new Date().toISOString().slice(0, 10),
      ).length,
      "batches",
      "CalendarDays",
    ],
    [
      "Pending Applications",
      data.admissions?.filter((x) => x.status === "Pending").length,
      "admissions",
      "Inbox",
    ],
    [
      "Published Results",
      data.results?.filter((x) => x.published).length,
      "results",
      "FileCheck",
    ],
    ["Total Products", data.products?.length, "products", "Package"],
    [
      "Pending Orders",
      data.orders?.filter((x) => x.status === "Pending").length,
      "orders",
      "ShoppingBag",
    ],
    [
      "Pending Service Requests",
      data.service_requests?.filter((x) => x.status === "Pending").length,
      "service_requests",
      "Wrench",
    ],
  ];
  return (
    <>
      <Alert error={error} />
      <div className="dashboard-grid">
        {cards.map(([label, value, target, icon]) => (
          <button
            className="metric-card"
            key={label}
            onClick={() => onSelect(target)}
          >
            <span className="empty-icon">
              <Icon name={icon} size={22} />
            </span>
            <b>{value ?? "—"}</b>
            <span>{label}</span>
          </button>
        ))}
      </div>
      <div className="panel admin-help">
        <h3>Publishing checklist</h3>
        <button
          className="btn secondary"
          onClick={async () => {
            try {
              for (const c of catalog) {
                if (data.courses?.some((r) => r.id === c.id)) continue;
                await api("/admin/courses/" + c.id, {
                  method: "PUT",
                  body: JSON.stringify({
                    data: { ...templates.courses.data, ...c },
                    published: false,
                  }),
                });
              }
              onSelect("courses");
            } catch (e) {
              setError(e.message);
            }
          }}
        >
          Add initial courses as drafts
        </button>
        <p>
          Add course details and fees, then publish courses and available
          batches to open online admission. Only published products, notices,
          gallery images, results and verified certificates appear publicly.
        </p>
        <p>
          Assign student IDs by approving pending admissions. Link a student to
          their Identity user ID to enable the private student portal. Grade
          thresholds: A+ ≥80%, A ≥70%, A− ≥60%, B ≥50%, C ≥40%, D below 40%;
          failing any subject gives F.
        </p>
      </div>
    </>
  );
}
const statuses = {
  admissions: ["Pending", "Approved", "Rejected"],
  students: ["Active", "Exam Pending", "Completed", "Discontinued"],
  attendance: ["Present", "Absent"],
  service_requests: [
    "Pending",
    "Received",
    "In Progress",
    "Completed",
    "Cancelled",
  ],
  orders: ["Pending", "Confirmed", "Shipped", "Completed", "Cancelled"],
  certificates: ["Verified", "Revoked"],
};
function RecordManager({ resource }) {
  const [rows, setRows] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState("All"),
    [editing, setEditing] = useState(null),
    [remove, setRemove] = useState(null),
    [courseFilter, setCourseFilter] = useState(""),
    [batchFilter, setBatchFilter] = useState(""),
    [dateFilter, setDateFilter] = useState(""),
    [studentFilter, setStudentFilter] = useState(""),
    [related, setRelated] = useState({}),
    [approval, setApproval] = useState(null),
    [studentId, setStudentId] = useState("");
  async function load() {
    setLoading(true);
    try {
      setRows(await api("/admin/" + resource));
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
    Promise.all(
      ["courses", "batches", "students", "examinations", "subjects"].map(
        async (r) => [r, await api("/admin/" + r)],
      ),
    )
      .then((x) => setRelated(Object.fromEntries(x)))
      .catch(() => {});
  }, [resource]);
  let list = rows.filter(
    (r) =>
      JSON.stringify(r).toLowerCase().includes(search.toLowerCase()) &&
      (filter === "All" ||
        r.status === filter ||
        (filter === "Published" && r.published) ||
        (filter === "Unpublished" && !r.published)),
  );
  if (courseFilter)
    list = list.filter(
      (r) =>
        (r.courseId ||
          related.students?.find((s) => s.id === r.studentId)?.courseId) ===
        courseFilter,
    );
  if (batchFilter)
    list = list.filter(
      (r) =>
        (r.batchId ||
          related.students?.find((s) => s.id === r.studentId)?.batchId) ===
        batchFilter,
    );
  if (dateFilter) list = list.filter((r) => r.date?.startsWith(dateFilter));
  if (studentFilter) list = list.filter((r) => r.studentId === studentFilter);
  async function approve() {
    try {
      await api("/admin/approve/" + approval.id, {
        method: "POST",
        body: JSON.stringify({ studentId }),
      });
      setApproval(null);
      setMessage("Application approved and student profile created.");
      load();
    } catch (e) {
      setError(e.message);
    }
  }
  function exportCSV() {
    const csv = [
      "ID,Student ID,Date,Status",
      ...list.map((r) =>
        [r.id, r.studentId, r.date, r.status]
          .map((x) => '"' + String(x || "").replaceAll('"', '""') + '"')
          .join(","),
      ),
    ].join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "attendance-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <>
      <Alert error={error} message={message} />
      {resource === "attendance" && (
        <AttendanceRoster related={related} records={rows} onSave={load} />
      )}
      <div className="toolbar">
        <div className="search-field">
          <Icon name="Search" size={18} />
          <input
            placeholder="Search records…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search records"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          aria-label="Status filter"
        >
          <option>All</option>
          {(statuses[resource] || ["Published", "Unpublished"]).map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <button className="btn secondary" onClick={load}>
          <Icon name="RefreshCw" size={17} />
          Refresh
        </button>
        {templates[resource] && (
          <button
            className="btn"
            onClick={() =>
              setEditing({ id: "", ...structuredClone(templates[resource]) })
            }
          >
            <Icon name="Plus" size={18} />
            Add {titleCase(resource)}
          </button>
        )}
      </div>
      {["attendance", "students", "examinations", "batches"].includes(
        resource,
      ) && (
        <div className="toolbar">
          <select
            aria-label="Filter course"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
          >
            <option value="">All courses</option>
            {related.courses?.map((c) => (
              <option value={c.id} key={c.id}>
                {c.data.title}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter batch"
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
          >
            <option value="">All batches</option>
            {related.batches
              ?.filter((b) => !courseFilter || b.courseId === courseFilter)
              .map((b) => (
                <option value={b.id} key={b.id}>
                  {b.data.title}
                </option>
              ))}
          </select>
          {resource === "attendance" && (
            <>
              <select
                aria-label="Filter student"
                value={studentFilter}
                onChange={(e) => setStudentFilter(e.target.value)}
              >
                <option value="">All students</option>
                {related.students?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.data.name} ({s.id})
                  </option>
                ))}
              </select>
              <input
                aria-label="Attendance month"
                type="month"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
              <button className="btn secondary" onClick={exportCSV}>
                <Icon name="Download" size={16} />
                Export monthly report
              </button>
            </>
          )}
        </div>
      )}
      {resource === "attendance" && list.length > 0 && (
        <div className="report-summary">
          {list.length} records · Present:{" "}
          {list.filter((r) => r.status === "Present").length} · Absent:{" "}
          {list.filter((r) => r.status === "Absent").length} · Attendance:{" "}
          {Math.round(
            (list.filter((r) => r.status === "Present").length / list.length) *
              100,
          )}
          %
        </div>
      )}
      {loading ? (
        <div className="skeleton" />
      ) : list.length ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Record ID</th>
                <th>Name / Title</th>
                <th>Details</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id}>
                  <td>
                    <code>{r.id}</code>
                  </td>
                  <td>{r.data.name || r.data.title || r.studentId || "—"}</td>
                  <td>
                    {r.data.phone ||
                      r.date ||
                      r.courseId ||
                      r.examinationId ||
                      r.data.category ||
                      "—"}
                  </td>
                  <td>
                    <span
                      className={
                        "status-badge " +
                        (r.status === "Rejected" ||
                        r.status === "Revoked" ||
                        r.status === "Cancelled"
                          ? "bad"
                          : "")
                      }
                    >
                      {r.status ||
                        ("published" in r
                          ? r.published
                            ? "Published"
                            : "Draft"
                          : "Saved")}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="icon-button"
                        aria-label={"Edit " + r.id}
                        onClick={() => setEditing(structuredClone(r))}
                      >
                        <Icon name="Pencil" size={16} />
                      </button>
                      {resource === "admissions" && r.status === "Pending" && (
                        <button
                          className="text-link"
                          onClick={() => {
                            setApproval(r);
                            setStudentId("");
                          }}
                        >
                          Approve
                        </button>
                      )}
                      <button
                        className="icon-button danger"
                        aria-label={"Delete " + r.id}
                        onClick={() => setRemove(r)}
                      >
                        <Icon name="Trash2" size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty
          title="No matching records"
          text="New records appear here after they are created or submitted."
        />
      )}
      {editing && (
        <RecordEditor
          resource={resource}
          initial={editing}
          related={related}
          onClose={() => setEditing(null)}
          onSave={() => {
            setEditing(null);
            setMessage("Record saved.");
            load();
          }}
        />
      )}
      {remove && (
        <div className="modal">
          <div
            className="modal-content small-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Confirm deletion"
          >
            <h2>Delete this record?</h2>
            <p>
              {remove.id} is permanently removed. Linked records may prevent
              deletion.
            </p>
            <div className="toolbar">
              <button className="btn secondary" onClick={() => setRemove(null)}>
                Cancel
              </button>
              <button
                className="btn danger-bg"
                onClick={async () => {
                  try {
                    await api(
                      "/admin/" +
                        resource +
                        "/" +
                        encodeURIComponent(remove.id),
                      { method: "DELETE" },
                    );
                    setRemove(null);
                    load();
                  } catch (e) {
                    setError(e.message);
                    setRemove(null);
                  }
                }}
              >
                Delete record
              </button>
            </div>
          </div>
        </div>
      )}
      {approval && (
        <div className="modal">
          <div
            className="modal-content small-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Approve admission"
          >
            <h2>Approve admission</h2>
            <p>
              Assign a unique student ID to {approval.data.name}. This creates
              their student profile.
            </p>
            <Field
              label="Student ID"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            />
            <div className="toolbar">
              <button
                className="btn secondary"
                onClick={() => setApproval(null)}
              >
                Cancel
              </button>
              <button
                className="btn"
                disabled={studentId.trim().length < 2}
                onClick={approve}
              >
                Approve & create student
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
function RecordEditor({ resource, initial, related, onClose, onSave }) {
  const [record, setRecord] = useState(initial),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [photoUrl, setPhotoUrl] = useState(""),
    [orderItems, setOrderItems] = useState([]);
  useEffect(() => {
    if (resource === "orders")
      api("/admin/order_items")
        .then((r) => setOrderItems(r.filter((i) => i.orderId === initial.id)))
        .catch((e) => setError(e.message));
  }, []);
  const isNew = !initial.id;
  const topKeys = Object.keys(record).filter(
    (k) => !["data", "createdAt"].includes(k),
  );
  function set(key, value, nested = false) {
    setRecord((r) =>
      nested
        ? { ...r, data: { ...r.data, [key]: value } }
        : { ...r, [key]: value },
    );
  }
  useEffect(() => {
    if (!record.data.photo) return;
    let objectUrl;
    (async () => {
      try {
        await getUser();
        const res = await fetch(
          "/api/admin/photo?key=" + encodeURIComponent(record.data.photo),
        );
        if (!res.ok) return;
        objectUrl = URL.createObjectURL(await res.blob());
        setPhotoUrl(objectUrl);
      } catch {}
    })();
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (!record.id.trim()) throw new Error("Record ID is required");
      const body = { ...record };
      delete body.id;
      delete body.createdAt;
      await api(
        "/admin/" + resource + "/" + encodeURIComponent(record.id.trim()),
        { method: "PUT", body: JSON.stringify(body) },
      );
      onSave();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  function input(key, value, nested) {
    const label = titleCase(key.replace(/([A-Z])/g, " $1"));
    if (key === "id")
      return (
        <Field
          key={key}
          label="Record ID (unique)"
          value={value}
          disabled={!isNew}
          onChange={(e) => set(key, e.target.value)}
        />
      );
    if (typeof value === "boolean")
      return (
        <label className="checkbox-field" key={key}>
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => set(key, e.target.checked, nested)}
          />
          {label}
        </label>
      );
    const ref = {
      courseId: "courses",
      batchId: "batches",
      studentId: "students",
      examinationId: "examinations",
    }[key];
    if (ref)
      return (
        <Field key={key} label={label}>
          <select
            value={value || ""}
            required
            onChange={(e) => {
              set(key, e.target.value);
              if (key === "examinationId" && resource === "results") {
                const subjects =
                  related.subjects?.filter(
                    (s) => s.examinationId === e.target.value,
                  ) || [];
                if (subjects.length)
                  set(
                    "marks",
                    subjects.map((s) => ({
                      subject: s.data.title,
                      total: Number(s.data.total || 100),
                      pass: Number(s.data.pass || 40),
                      obtained: 0,
                    })),
                    true,
                  );
              }
            }}
          >
            <option value="">Select {titleCase(ref)}</option>
            {related[ref]?.map((r) => (
              <option value={r.id} key={r.id}>
                {r.data.title || r.data.name} · {r.id}
              </option>
            ))}
          </select>
        </Field>
      );
    if (key === "status" && statuses[resource])
      return (
        <Field key={key} label={label}>
          <select value={value} onChange={(e) => set(key, e.target.value)}>
            {statuses[resource].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
      );
    if (key === "category" && resource === "products")
      return (
        <Field key={key} label={label}>
          <select
            value={value}
            onChange={(e) => set(key, e.target.value, true)}
          >
            {categories.slice(1).map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
      );
    if (key === "marks" && Array.isArray(value))
      return (
        <MarksEditor
          key={key}
          value={value}
          onChange={(v) => set(key, v, true)}
        />
      );
    if (key === "syllabus" && Array.isArray(value))
      return (
        <Field
          key={key}
          label="Syllabus (one topic per line)"
          wide
          required={false}
        >
          <textarea
            value={value.join("\n")}
            onChange={(e) => set(key, e.target.value.split("\n"), true)}
          />
        </Field>
      );
    if (key === "category" && ["gallery", "notices"].includes(resource))
      return (
        <Field key={key} label={label}>
          <select
            value={value}
            onChange={(e) => set(key, e.target.value, true)}
          >
            {(resource === "gallery"
              ? [
                  "Classroom",
                  "Computer Lab",
                  "Students",
                  "Training Activities",
                  "Examination",
                  "Certificates",
                  "Events",
                ]
              : [
                  "Admission Notices",
                  "Exam Notices",
                  "Result Notices",
                  "Batch Notices",
                  "Holiday Notices",
                  "General Announcements",
                ]
            ).map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
      );
    if (typeof value === "object" && value !== null)
      return (
        <JsonField
          key={key}
          label={label}
          value={value}
          onChange={(v) => set(key, v, nested)}
        />
      );
    if (
      [
        "description",
        "problem",
        "address",
        "requirements",
        "certificate",
      ].includes(key)
    )
      return (
        <Field key={key} label={label} required={false} wide>
          <textarea
            value={value || ""}
            onChange={(e) => set(key, e.target.value, nested)}
          />
        </Field>
      );
    return (
      <Field
        key={key}
        label={label}
        required={false}
        type={
          typeof value === "number" ||
          ["price", "stock", "discountPrice"].includes(key)
            ? "number"
            : key.toLowerCase().includes("date") || key === "date"
              ? "date"
              : "text"
        }
        value={value ?? ""}
        onChange={(e) =>
          set(
            key,
            typeof value === "number" ||
              ["price", "stock", "discountPrice"].includes(key)
              ? e.target.value === ""
                ? null
                : Number(e.target.value)
              : e.target.value,
            nested,
          )
        }
      />
    );
  }
  return (
    <div className="modal">
      <div
        className="modal-content editor"
        role="dialog"
        aria-modal="true"
        aria-label={"Edit " + resource}
      >
        <div className="editor-heading">
          <h2>
            {isNew ? "Add" : "Edit"} {titleCase(resource)}
          </h2>
          <button
            className="icon-button"
            aria-label="Close editor"
            onClick={onClose}
          >
            <Icon name="X" />
          </button>
        </div>
        <form onSubmit={save}>
          {resource === "orders" && (
            <div className="panel">
              <h3>Order items</h3>
              {orderItems.map((i) => (
                <p key={i.id}>
                  {i.data.name || i.productId} × {i.quantity} — ৳{" "}
                  {i.price * i.quantity}
                </p>
              ))}
            </div>
          )}
          <div className="form-grid">
            {topKeys.map((k) => input(k, record[k], false))}
            {Object.entries(record.data).map(([k, v]) => input(k, v, true))}
          </div>
          {photoUrl && (
            <img
              className="student-photo"
              src={photoUrl}
              alt="Student photograph"
            />
          )}
          {["gallery", "courses", "products"].includes(resource) && (
            <Field
              label="Upload image"
              required={false}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                setBusy(true);
                setError("");
                try {
                  const form = new FormData();
                  form.set("file", file);
                  const uploaded = await api("/admin/uploads", {
                    method: "POST",
                    body: form,
                  });
                  set("image", uploaded.url, true);
                } catch (err) {
                  setError(err.message);
                } finally {
                  setBusy(false);
                }
              }}
            />
          )}
          <p className="muted">
            IDs link records across modules. Published records appear publicly.
            Student contact information remains private.
          </p>
          <Alert error={error} />
          <div className="toolbar">
            <button type="button" className="btn secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn" disabled={busy}>
              {busy ? "Saving…" : "Save record"}
              <Icon name="Check" size={17} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
function MarksEditor({ value, onChange }) {
  return (
    <div className="field wide marks-editor">
      <h3>Subject-wise marks</h3>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Total</th>
              <th>Pass</th>
              <th>Obtained</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {value.map((m, i) => (
              <tr key={i}>
                {["subject", "total", "pass", "obtained"].map((k) => (
                  <td key={k}>
                    <input
                      aria-label={k + " " + (i + 1)}
                      type={k === "subject" ? "text" : "number"}
                      min={k === "total" ? 1 : 0}
                      required
                      value={m[k]}
                      onChange={(e) =>
                        onChange(
                          value.map((r, j) =>
                            j === i
                              ? {
                                  ...r,
                                  [k]:
                                    k === "subject"
                                      ? e.target.value
                                      : Number(e.target.value),
                                }
                              : r,
                          ),
                        )
                      }
                    />
                  </td>
                ))}
                <td>
                  <button
                    type="button"
                    className="icon-button danger"
                    aria-label="Remove subject"
                    onClick={() => onChange(value.filter((_, j) => j !== i))}
                  >
                    <Icon name="Trash2" size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        className="text-link"
        onClick={() =>
          onChange([
            ...value,
            { subject: "", total: 100, pass: 40, obtained: 0 },
          ])
        }
      >
        <Icon name="Plus" size={16} />
        Add subject
      </button>
      <p className="muted">
        Totals, percentage, grade and pass/fail are calculated by the server
        when saved.
      </p>
    </div>
  );
}
function AttendanceRoster({ related, records, onSave }) {
  const [course, setCourse] = useState(""),
    [batch, setBatch] = useState(""),
    [date, setDate] = useState(new Date().toISOString().slice(0, 10)),
    [marks, setMarks] = useState({}),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  useEffect(() => {
    setMarks(
      Object.fromEntries(
        records
          .filter((r) => r.date === date)
          .map((r) => [r.studentId, r.status]),
      ),
    );
  }, [date, records]);
  const roster = (related.students || []).filter(
    (s) =>
      s.courseId === course && s.batchId === batch && s.status === "Active",
  );
  return (
    <details className="panel attendance-roster">
      <summary>Mark batch attendance</summary>
      <div className="toolbar">
        <select
          aria-label="Attendance course"
          value={course}
          onChange={(e) => {
            setCourse(e.target.value);
            setBatch("");
          }}
        >
          <option value="">Select course</option>
          {related.courses?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.data.title}
            </option>
          ))}
        </select>
        <select
          aria-label="Attendance batch"
          value={batch}
          onChange={(e) => setBatch(e.target.value)}
        >
          <option value="">Select batch</option>
          {related.batches
            ?.filter((b) => b.courseId === course)
            .map((b) => (
              <option key={b.id} value={b.id}>
                {b.data.title}
              </option>
            ))}
        </select>
        <input
          type="date"
          aria-label="Attendance date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      {roster.length > 0 ? (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Attendance</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((s) => (
                  <tr key={s.id}>
                    <td>
                      {s.data.name}
                      <br />
                      <small>{s.id}</small>
                    </td>
                    <td>
                      <select
                        aria-label={"Attendance for " + s.data.name}
                        value={marks[s.id] || ""}
                        onChange={(e) =>
                          setMarks({ ...marks, [s.id]: e.target.value })
                        }
                      >
                        <option value="">Unmarked</option>
                        <option>Present</option>
                        <option>Absent</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            className="btn"
            disabled={busy || !date || roster.some((s) => !marks[s.id])}
            onClick={async () => {
              setBusy(true);
              setError("");
              setMessage("");
              try {
                await api("/admin/attendance-bulk", {
                  method: "POST",
                  body: JSON.stringify({
                    courseId: course,
                    batchId: batch,
                    date,
                    records: roster.map((s) => ({
                      studentId: s.id,
                      status: marks[s.id],
                    })),
                  }),
                });
                setMessage("Attendance saved.");
                onSave();
              } catch (e) {
                setError(e.message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Saving…" : "Save batch attendance"}
          </button>
        </>
      ) : (
        <p className="muted">
          Select a course and batch to load active students.
        </p>
      )}
      <Alert error={error} message={message} />
    </details>
  );
}
function JsonField({ label, value, onChange }) {
  const [text, setText] = useState(JSON.stringify(value, null, 2)),
    [invalid, setInvalid] = useState(false);
  return (
    <Field label={label + " (JSON)"} wide required={false}>
      <textarea
        className="json-input"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          try {
            onChange(JSON.parse(e.target.value));
            setInvalid(false);
            e.target.setCustomValidity("");
          } catch {
            setInvalid(true);
            e.target.setCustomValidity("Correct the JSON before saving");
          }
        }}
      />
      {invalid && (
        <span className="validation">
          Invalid JSON — correct this field before saving.
        </span>
      )}
    </Field>
  );
}
createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
