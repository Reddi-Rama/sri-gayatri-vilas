"use client";

import { useState, useEffect, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  LayoutDashboard, ShoppingBag, Utensils, Tags, ChartNoAxesCombined,
  Settings, Search, Bell, ChevronDown,
  IndianRupee, TrendingUp, Plus, ArrowUpRight,
  Menu, X, MoreHorizontal, Pencil, Trash2
} from "lucide-react";
import styles from "./admin.module.css";
import { restaurantMenu } from "./menu-data";
import { supabase } from "../../lib/supabase";

type Section = "Dashboard" | "Orders" | "Menu" | "Offers" | "Reports" | "Settings";

const navigation = [
  { name: "Dashboard" as Section, icon: LayoutDashboard },
  { name: "Orders" as Section, icon: ShoppingBag },
  { name: "Menu" as Section, icon: Utensils },
  { name: "Offers" as Section, icon: Tags },
  { name: "Reports" as Section, icon: ChartNoAxesCombined },
];

type AdminDish = {
  id: number;
  name: string;
  category: string;
  description: string | null;
  price: number;
  image?: string | null;
  tag?: string | null;
  available: boolean;
  is_available?: boolean;
  menu_periods?: string[];
};
type OrderItem = {
  item_name: string;
  quantity: number;
};

type AdminOrder = {
  id: string;
  dbId: number;
  customer: string;
  phone: string;
  address: string;
  items: string;
  amount: number;
  time: string;
  status: string;
};

type SidebarProps = {
  section: Section;
  setSection: Dispatch<SetStateAction<Section>>;
  mobileOpen: boolean;
  setMobileOpen: Dispatch<SetStateAction<boolean>>;
};

const initialOrders: AdminOrder[] = [];

const initialDishes = restaurantMenu.map(dish => ({ ...dish, available: true }));

function Sidebar({ section, setSection, mobileOpen, setMobileOpen }: SidebarProps) {
  return (
    <aside className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ""}`}>
      <div className={styles.brand}>
        <img src="/images/logo.png" alt="Sri Gayatri Vilas" className={styles.brandMark} style={{objectFit:"contain",display:"block",flexShrink:0}} />
        <div>
          <strong>SRI GAYATRI VILAS</strong>
          <span>ADMINISTRATION</span>
        </div>
        <button className={styles.closeMobile} onClick={() => setMobileOpen(false)}><X /></button>
      </div>

      <div className={styles.navLabel}>WORKSPACE</div>
      <nav className={styles.nav}>
        {navigation.map(item => {
          const Icon = item.icon;
          return (
            <button key={item.name}
              className={`${styles.navItem} ${section === item.name ? styles.navActive : ""}`}
              onClick={() => { setSection(item.name); setMobileOpen(false); }}>
              <Icon size={19} />
              <span>{item.name}</span>
              {item.name === "Orders" && <small>5</small>}
            </button>
          );
        })}
      </nav>

      <div className={styles.navLabel}>PREFERENCES</div>
      <button className={`${styles.navItem} ${section === "Settings" ? styles.navActive : ""}`}
        onClick={() => { setSection("Settings"); setMobileOpen(false); }}>
        <Settings size={19} /><span>Settings</span>
      </button>

      <div className={styles.sidebarBottom}>
        <div className={styles.restaurantStatus}>
          <span className={styles.liveDot} />
          <div><strong>Restaurant status</strong><small>Open for orders</small></div>
          <ChevronDown size={15} />
        </div>
        <div className={styles.adminProfile}>
          <div className={styles.avatar}>A</div>
          <div><strong>Administrator</strong><small>Restaurant manager</small></div>
          <MoreHorizontal size={19} />
        </div>
      </div>
    </aside>
  );
}
export default function AdminPage() {
  const [section, setSection] = useState<Section>(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("section") === "Orders"
        ? "Orders"
        : "Dashboard";
    }
    return "Dashboard";
  });

  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const soundEnabledRef = useRef(false);
  const [dishes, setDishes] = useState<AdminDish[]>(initialDishes);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState("");
  const [showAddDish, setShowAddDish] = useState(false);
  const [dishName, setDishName] = useState("");
  const [dishCategory, setDishCategory] = useState("");
  const [dishDescription, setDishDescription] = useState("");
  const [dishPrice, setDishPrice] = useState("");
  const [dishImage, setDishImage] = useState("");
  const [dishSaving, setDishSaving] = useState(false);
  const [dishPeriods, setDishPeriods] = useState<string[]>(["Morning"]);
  const [editingDish, setEditingDish] = useState<AdminDish | null>(null);
  const [editDishName, setEditDishName] = useState("");
  const [editDishCategory, setEditDishCategory] = useState("");
  const [editDishPrice, setEditDishPrice] = useState("");
  const [editDishDescription, setEditDishDescription] = useState("");
  const [editDishPeriods, setEditDishPeriods] = useState<string[]>([]);
  const [editDishSaving, setEditDishSaving] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [offerActive, setOfferActive] = useState(true);
  const [restaurantOpen, setRestaurantOpen] = useState(true);
  const [statusSaving, setStatusSaving] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadMenu() {
      setMenuLoading(true);
      const { data, error } = await supabase
        .from("menu_items")
        .select("id,name,category,description,price,image,tag,is_available,menu_periods")
        .order("id");

      if (cancelled) return;

      if (error) {
        setMenuError(error.message);
      } else if (data) {
        setDishes(data.map(dish => ({
          ...dish,
          available: dish.is_available
        })));
      }

      setMenuLoading(false);
    }

    loadMenu();
    return () => { cancelled = true; };
  }, []);
  const playServiceBell = () => {
    try {
      const audio = new Audio("/sounds/service-bell.mp3");
      audio.volume = 1;
      audio.loop = true;

      void audio.play().then(() => {
        window.setTimeout(() => {
          audio.pause();
          audio.currentTime = 0;
        }, 3000);
      }).catch((error) => {
        console.error("Service bell could not play:", error);
      });
    } catch (error) {
      console.error("Service bell could not play:", error);
    }
  };

  useEffect(() => {
    let active = true;

    async function loadRestaurantStatus() {
      const { data, error } = await supabase
        .from("restaurant_settings")
        .select("is_open")
        .eq("id", true)
        .single();

      if (!active) return;
      if (error) {
        console.error("Could not load restaurant status:", error.message);
        return;
      }
      setRestaurantOpen(data.is_open);
    }

    loadRestaurantStatus();

    const channel = supabase
      .channel("admin-restaurant-status")
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "restaurant_settings"
      }, payload => {
        setRestaurantOpen(Boolean(payload.new.is_open));
      })
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  async function toggleRestaurantStatus() {
    if (statusSaving) return;

    const nextStatus = !restaurantOpen;
    setStatusSaving(true);

    const { error } = await supabase
      .from("restaurant_settings")
      .update({
        is_open: nextStatus,
        updated_at: new Date().toISOString()
      })
      .eq("id", true);

    setStatusSaving(false);

    if (error) {
      alert("Could not update restaurant status: " + error.message);
      return;
    }

    setRestaurantOpen(nextStatus);
  }

  async function verifyAdminSession(session: Session | null) {
    if (!session) {
      setAdminEmail("");
      setIsAdmin(false);
      setAuthLoading(false);
      return false;
    }

    const { data, error } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (error || !data) {
      setAdminEmail("");
      setIsAdmin(false);
      setAuthLoading(false);
      setLoginError("This account is not authorized as an administrator.");
      return false;
    }

    setAdminEmail(session.user.email || "");
    setIsAdmin(true);
    setAuthLoading(false);
    setLoginError("");
    return true;
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      void verifyAdminSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setTimeout(() => {
          void verifyAdminSession(session);
        }, 0);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleAdminLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoginError("");
    setAuthLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword
    });

    if (error) {
      setAuthLoading(false);
      setLoginError(error.message);
      return;
    }

    const authorized = await verifyAdminSession(data.session);

    if (!authorized) {
      await supabase.auth.signOut();
      setLoginError("This account is not authorized as an administrator.");
    }
  }

  async function handleAdminLogout() {
    await supabase.auth.signOut();
    setAdminEmail("");
    setIsAdmin(false);
  }

  async function handleForgotPassword() {
    if (!loginEmail.trim()) {
      setLoginError("Enter your admin email address first.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(
      loginEmail.trim(),
      {
        redirectTo: `${window.location.origin}/admin/reset-password`
      }
    );

    setLoginError(
      error
        ? error.message
        : "Password recovery email sent. Check your inbox."
    );
  }



  useEffect(() => {
    let active = true;

    async function loadOrders(showLoading = false) {
      if (showLoading) {
        setOrdersLoading(true);
      }

      setOrdersError("");

      const { data, error } = await supabase
        .from("orders")
        .select("id,order_number,customer_name,phone,address,total_amount,status,created_at,order_items(item_name,quantity)")
        .order("created_at", { ascending: false });

      if (!active) return;

      if (error) {
        setOrdersError(error.message);
      } else {
        setOrders((data || []).map(order => ({
          id: String(order.order_number || order.id),
          dbId: order.id,
          customer: String(order.customer_name ?? ""),
          phone: String(order.phone ?? ""),
          address: String(order.address ?? ""),
          items: (order.order_items || []).map((item: OrderItem) =>
            `${item.quantity} ${item.item_name}`
          ).join(", "),
          amount: Number(order.total_amount),
          time: new Date(order.created_at).toLocaleString("en-IN"),
          status: String(order.status ?? "")
        })));
      }

      setOrdersLoading(false);
    }

    const channel = supabase
      .channel("admin-live-customer-orders")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders"
        },
        () => {
          if (soundEnabledRef.current) {
            playServiceBell();
          }
          void loadOrders(false);
        }
      )
      .subscribe();

    void loadOrders(true);

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, []);

  const toggleDish = async (dish: AdminDish) => {
    const nextAvailable = !dish.available;
    const { error } = await supabase
      .from("menu_items")
      .update({ is_available: nextAvailable })
      .eq("id", dish.id);

    if (error) {
      setMenuError(error.message);
      return;
    }

    setDishes(current => current.map(item =>
      item.id === dish.id ? { ...item, available: nextAvailable, is_available: nextAvailable } : item
    ));
  };

  function beginEditDish(dish: AdminDish) {
    setEditingDish(dish);
    setEditDishName(dish.name || "");
    setEditDishCategory(dish.category || "");
    setEditDishPrice(String(dish.price ?? ""));
    setEditDishDescription(dish.description || "");
    setEditDishPeriods(Array.isArray(dish.menu_periods) ? [...dish.menu_periods] : []);
    setMenuError("");
  }

  async function saveEditedDish(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingDish) return;

    const price = Number(editDishPrice);

    if (
      !editDishName.trim() ||
      !editDishCategory.trim() ||
      !Number.isFinite(price) ||
      price <= 0
    ) {
      setMenuError("Enter a valid dish name, category and price.");
      return;
    }

    setEditDishSaving(true);
    setMenuError("");

    const menuPeriods = ["Morning", "Afternoon", "Night"].filter(
      period => editDishPeriods.includes(period)
    );

    const { error } = await supabase
      .from("menu_items")
      .update({
        name: editDishName.trim(),
        category: editDishCategory.trim(),
        price,
        description: editDishDescription.trim(),
        menu_periods: menuPeriods
      })
      .eq("id", editingDish.id);

    setEditDishSaving(false);

    if (error) {
      setMenuError(error.message);
      return;
    }

    setDishes(current => current.map(item =>
      item.id === editingDish.id
        ? {
            ...item,
            name: editDishName.trim(),
            category: editDishCategory.trim(),
            price,
            description: editDishDescription.trim(),
            menu_periods: menuPeriods
          }
        : item
    ));

    setEditingDish(null);
    setMenuError("");
  }
  async function deleteDish(dish: AdminDish) {
    const confirmed = window.confirm(
      `Delete "${dish.name}" permanently from the menu?`
    );

    if (!confirmed) return;

    setMenuError("");

    const { error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", dish.id);

    if (error) {
      setMenuError(error.message);
      return;
    }

    setDishes(current => current.filter(item => item.id !== dish.id));
  }
  async function handleAddDish(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDishSaving(true);
    setMenuError("");

    const nextId = Math.max(0, ...dishes.map((dish: AdminDish) => Number(dish.id) || 0)) + 1;

    const { data, error } = await supabase
      .from("menu_items")
      .insert({
        id: nextId,
        name: dishName.trim(),
        category: dishCategory.trim(),
        description: dishDescription.trim(),
        price: Number(dishPrice),
        image: dishImage.trim() || null,
        is_available: true,
        menu_periods: dishPeriods
      })
      .select("id,name,category,description,price,image,tag,is_available")
      .single();

    setDishSaving(false);

    if (error) {
      setMenuError(error.message);
      return;
    }

    setDishes(current => [...current, { ...data, available: data.is_available }]);
    setDishName("");
    setDishCategory("");
    setDishDescription("");
    setDishPrice("");
    setDishImage("");
    setDishPeriods(["Morning"]);
    setShowAddDish(false);
  }

  const money = (value: number) => String.fromCharCode(8377) + value.toLocaleString("en-IN");

  const filteredOrders = orders.filter(order =>
    (order.id + order.customer + order.phone + order.address + order.items).toLowerCase().includes(search.toLowerCase())
  );

    if (authLoading) return <main style={{background:"#0b0b0a",color:"#eee9df",minHeight:"100vh",display:"grid",placeItems:"center"}}>Checking session...</main>;

  if (!isAdmin) return (
    <main style={{background:"#0b0b0a",color:"#eee9df",minHeight:"100vh",display:"grid",placeItems:"center",padding:24}}>
      <form onSubmit={handleAdminLogin} style={{width:"100%",maxWidth:400,background:"#171613",padding:32,border:"1px solid #c9b38d"}}>
        <h1>Sri Gayatri Vilas</h1>
        <p>Administrator Login</p>
        <input type="email" required placeholder="Admin email" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} style={{display:"block",width:"100%",padding:12,margin:"18px 0"}} />
        <input type="password" required placeholder="Password" value={loginPassword} onChange={e=>setLoginPassword(e.target.value)} style={{display:"block",width:"100%",padding:12,marginBottom:18}} />
        {loginError && <p style={{color:"#ff9b85"}}>{loginError}</p>}
        <button type="submit" style={{width:"100%",padding:14,background:"#c9b38d"}}>SIGN IN</button>
        <button type="button" onClick={handleForgotPassword} style={{width:"100%",padding:12,marginTop:12,background:"transparent",color:"#c9b38d",border:"1px solid #c9b38d",cursor:"pointer"}}>
          FORGOT PASSWORD?
        </button>
      </form>
    </main>
  );
return (
    <main className={styles.app}>
      <Sidebar section={section} setSection={setSection} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      {mobileOpen && <button className={styles.overlay} onClick={() => setMobileOpen(false)} aria-label="Close menu" />}

      <section className={styles.main}>
        <header className={styles.topbar}>
          <button className={styles.mobileMenu} onClick={() => setMobileOpen(true)}><Menu /></button>
          <div className={styles.breadcrumb}>Workspace <span>/</span> <strong>{section}</strong></div>
          <div className={styles.topActions}>
            <span className={styles.today}>Thursday, 19 November 2026</span>
            <button className={styles.iconButton} aria-label="Notifications"><Bell size={19}/><i /></button>
            <div className={styles.topAvatar}>{adminEmail?.[0]?.toUpperCase() || "A"}</div>
            <button
              type="button"
              onClick={handleAdminLogout}
              style={{
                padding: "10px 16px",
                background: "transparent",
                color: "#c9b38d",
                border: "1px solid #c9b38d",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              LOG OUT
            </button>
          </div>
        </header>

        <div className={styles.content}>
          <div className={styles.pageHeading}>
            <div>
              <div className={styles.eyebrow}>SRI GAYATRI VILAS  |  VIZIANAGARAM</div>
              <h1>{section === "Dashboard" ? "Good evening, Admin" : section}</h1>
              <p>{section === "Dashboard" ? "Here's what's happening at your restaurant today." : `Manage your restaurant ${section.toLowerCase()} from here.`}</p>
            </div>
            {section === "Menu" && <button className={styles.primaryButton} onClick={() => setShowAddDish(true)}><Plus size={17}/> Add dish</button>}
            {section === "Offers" && <button className={styles.primaryButton} onClick={() => alert("Offer creation will be connected in the next stage.")}><Plus size={17}/> Create offer</button>}
          </div>

          {section === "Dashboard" && <>
            <div className={styles.statsGrid}>
              <Stat icon={<ShoppingBag/>} label="Total orders" value="49" change="+12.5%" note="vs. previous day"/>
              <Stat icon={<IndianRupee/>} label="Today's revenue" value="Rs. 8,450" change="+8.2%" note="vs. previous day"/>
            </div>

            <div className={styles.panel} style={{ marginBottom: 24 }}>
              <div className={styles.panelHeading}>
                <div>
                  <h2>Restaurant availability</h2>
                  <p>
                    {restaurantOpen
                      ? "Customers can currently place orders."
                      : "The customer website is displaying the closed screen."}
                  </p>
                </div>
                <strong style={{
                  color: restaurantOpen ? "#75D49A" : "#F09A8C"
                }}>
                  {restaurantOpen ? "OPEN" : "CLOSED"}
                </strong>
              </div>
              <button
                type="button"
                onClick={toggleRestaurantStatus}
                disabled={statusSaving}
                style={{
                  border: 0,
                  borderRadius: 8,
                  padding: "13px 20px",
                  background: restaurantOpen ? "#9B5148" : "#477D5B",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: statusSaving ? "wait" : "pointer",
                  opacity: statusSaving ? 0.6 : 1
                }}
              >
                {statusSaving
                  ? "SAVING..."
                  : restaurantOpen
                    ? "CLOSE RESTAURANT"
                    : "OPEN RESTAURANT"}
              </button>
            </div>

            <div className={styles.dashboardGrid}>
              <div className={styles.panel}>
                <div className={styles.panelHeading}>
                  <div><h2>Recent orders</h2><p>New orders received - call customers to confirm</p></div>
                  <button className={styles.textButton} onClick={() => setSection("Orders")}>View all <ArrowUpRight size={15}/></button>
                </div>
                <div className={styles.orderList}>
                  {orders.slice(0,4).map(order => (
                    <div className={styles.orderRow} key={order.id}>
                      <div className={styles.orderIcon}><ShoppingBag size={17}/></div>
                      <div className={styles.orderInfo}><strong>{order.customer}</strong><small>{order.id}  |  {order.items}</small></div>
                      <div className={styles.orderRight}><strong>{money(order.amount)}</strong></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.panel}>
                <div className={styles.panelHeading}><div><h2>Restaurant overview</h2><p>Today&apos;s performance</p></div></div>
                <div className={styles.revenueValue}>{money(8450)}</div>
                <div className={styles.revenueCaption}><TrendingUp size={15}/> 8.2% compared to yesterday</div>
                <div className={styles.chart}>
                  {[35,52,43,68,49,76,58,88,62,73,48,94].map((height,i) => <div key={i} className={styles.chartColumn}><span style={{height: `${height}%`}} /></div>)}
                </div>
                <div className={styles.chartLabels}><span>9 AM</span><span>12 PM</span><span>3 PM</span><span>6 PM</span><span>9 PM</span></div>
              </div>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHeading}><div><h2>Quick actions</h2><p>Frequently used management tools</p></div></div>
              <div className={styles.quickActions}>
                <Quick icon={<ShoppingBag/>} title="Manage orders" desc="Review and update orders" onClick={() => setSection("Orders")}/>
                <Quick icon={<Utensils/>} title="Update menu" desc="Edit dishes and availability" onClick={() => setSection("Menu")}/>
                <Quick icon={<Tags/>} title="Manage offers" desc="Create restaurant promotions" onClick={() => setSection("Offers")}/>
              </div>
            </div>
          </>}

          {section === "Orders" && <div className={styles.panel}>
            <div className={styles.panelHeading}>
              <div><h2>Customer orders</h2><p>Review orders and call customers to confirm</p></div>
              <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                <button
                  type="button"
                  onClick={() => {
                    const next = !soundEnabled;
                    soundEnabledRef.current = next;
                    setSoundEnabled(next);

                    // Play a test bell from the user's click to unlock browser audio
                    if (next) {
                      playServiceBell();
                    }
                  }}
                  style={{
                    padding:"9px 13px",
                    borderRadius:8,
                    border:"1px solid #c9b38d",
                    background:soundEnabled ? "#e8f5e9" : "#fff",
                    color:"#302315",
                    cursor:"pointer",
                    fontWeight:600
                  }}
                >
                  {soundEnabled ? "\uD83D\uDD14 Sound Alerts On" : "\uD83D\uDD15 Enable Sound Alerts"}
                </button>

                <span className={styles.demoTag}>LIVE ORDERS</span>
              </div>
            </div>
            <div className={styles.toolbar}>
              <div className={styles.searchBox}><Search size={17}/><input placeholder="Search orders or customers..." value={search} onChange={e => setSearch(e.target.value)}/></div>
            </div>
            {ordersLoading && <p>Loading customer orders...</p>}{ordersError && <p role="alert">{ordersError}</p>}<div className={styles.tableWrap}><table className={styles.table}>
              <thead><tr><th>ORDER</th><th>CUSTOMER</th><th>ITEMS</th><th>AMOUNT</th><th>TIME</th></tr></thead>
              <tbody>{filteredOrders.map(order => <tr key={order.id}>
                <td className={styles.orderId}>{order.id}</td><td>{order.customer}<br/><small>{order.phone}<br/>{order.address}</small></td><td className={styles.mutedCell}>{order.items}</td><td>{money(order.amount)}</td><td>{order.time}</td>
                
              </tr>)}</tbody>
            </table></div>
            <p className={styles.footnote}>Live orders from Supabase. Call customers to confirm their orders.</p>
          </div>}

          {section === "Menu" && <div className={styles.panel}>
            <div className={styles.panelHeading}><div><h2>Menu items</h2><p>Live dishes from Supabase</p></div><span className={styles.demoTag}>LIVE DATABASE</span></div>
            {showAddDish && <form onSubmit={handleAddDish} style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:12,padding:18,marginBottom:20,border:"1px solid #c9b38d",borderRadius:10}}>
              <h3 style={{gridColumn:"1/-1"}}>Add a new dish</h3>
              <input required placeholder="Dish name" value={dishName} onChange={e=>setDishName(e.target.value)} style={{padding:12}} />
              <input required placeholder="Category" value={dishCategory} onChange={e=>setDishCategory(e.target.value)} style={{padding:12}} />
              <input required type="number" min="1" step="0.01" placeholder="Price (Rs. )" value={dishPrice} onChange={e=>setDishPrice(e.target.value)} style={{padding:12}} />
              <input placeholder="Image path (optional)" value={dishImage} onChange={e=>setDishImage(e.target.value)} style={{padding:12}} />
              <input placeholder="Description (optional)" value={dishDescription} onChange={e=>setDishDescription(e.target.value)} style={{padding:12}} />
              <div style={{gridColumn:"1/-1",display:"flex",gap:18,flexWrap:"wrap",alignItems:"center"}}>
                <strong>Show in menus:</strong>
                {["Morning", "Afternoon", "Night"].map(period => (
                  <label key={period} style={{display:"flex",alignItems:"center",gap:6}}>
                    <input
                      type="checkbox"
                      checked={dishPeriods.includes(period)}
                      onChange={e => setDishPeriods(current =>
                        e.target.checked
                          ? [...current, period]
                          : current.filter(item => item !== period)
                      )}
                    />
                    {period}
                  </label>
                ))}
              </div>
              <div style={{gridColumn:"1/-1",display:"flex",gap:10}}>
                <button className={styles.primaryButton} type="submit" disabled={dishSaving}>{dishSaving ? "Saving..." : "Save dish"}</button>
                <button type="button" onClick={()=>setShowAddDish(false)}>Cancel</button>
              </div>
            </form>}
            {editingDish && <form
              onSubmit={saveEditedDish}
              style={{
                display:"grid",
                gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",
                gap:12,
                padding:18,
                marginBottom:20,
                border:"1px solid #c9b38d",
                borderRadius:10
              }}
            >
              <h3 style={{gridColumn:"1/-1"}}>Edit dish: {editingDish.name}</h3>

              <input
                required
                placeholder="Dish name"
                value={editDishName}
                onChange={e=>setEditDishName(e.target.value)}
                style={{padding:12}}
              />

              <input
                required
                placeholder="Category"
                value={editDishCategory}
                onChange={e=>setEditDishCategory(e.target.value)}
                style={{padding:12}}
              />

              <input
                required
                type="number"
                min="1"
                step="0.01"
                placeholder="Price (Rs.)"
                value={editDishPrice}
                onChange={e=>setEditDishPrice(e.target.value)}
                style={{padding:12}}
              />

              <textarea
                placeholder="Description"
                value={editDishDescription}
                onChange={e=>setEditDishDescription(e.target.value)}
                style={{padding:12,minHeight:75}}
              />

              <div style={{
                gridColumn:"1/-1",
                display:"flex",
                gap:18,
                flexWrap:"wrap",
                alignItems:"center"
              }}>
                <strong>Show in menus:</strong>

                {["Morning", "Afternoon", "Night"].map(period => (
                  <label
                    key={period}
                    style={{display:"flex",alignItems:"center",gap:6}}
                  >
                    <input
                      type="checkbox"
                      checked={editDishPeriods.includes(period)}
                      onChange={e=>setEditDishPeriods(current =>
                        e.target.checked
                          ? [...current, period]
                          : current.filter(item => item !== period)
                      )}
                    />
                    {period}
                  </label>
                ))}
              </div>

              <div style={{
                gridColumn:"1/-1",
                display:"flex",
                gap:10
              }}>
                <button
                  className={styles.primaryButton}
                  type="submit"
                  disabled={editDishSaving}
                >
                  {editDishSaving ? "Saving..." : "Save changes"}
                </button>

                <button
                  type="button"
                  disabled={editDishSaving}
                  onClick={()=>setEditingDish(null)}
                >
                  Cancel
                </button>
              </div>
            </form>}
            <div className={styles.menuList}>{menuLoading ? <p>Loading menu from database...</p> : menuError ? <p>Database error: {menuError}</p> : dishes.map(dish => <div className={styles.menuRow} key={dish.name}>
              <div className={styles.dishIcon}><Utensils size={19}/></div><div className={styles.dishInfo}><strong>{dish.name}</strong><small>{dish.category} | {(dish.menu_periods || []).join(", ") || "No time assigned"}</small></div>
              <strong>{money(dish.price)}</strong>
              <label className={styles.switch}><input type="checkbox" checked={dish.available} onChange={() => toggleDish(dish)} /><span/></label>
              <span className={dish.available ? styles.available : styles.unavailable}>{dish.available ? "Available" : "Unavailable"}</span>
              <button type="button" title="Edit dish" onClick={() => beginEditDish(dish)} style={{padding:8,background:"transparent",color:"#c9b38d",border:"1px solid #c9b38d",borderRadius:6,cursor:"pointer"}}><Pencil size={16}/></button>
              <button type="button" title="Delete dish" onClick={() => deleteDish(dish)} style={{padding:8,background:"transparent",color:"#e58b7d",border:"1px solid #e58b7d",borderRadius:6,cursor:"pointer"}}><Trash2 size={16}/></button>
            </div>)}</div>
            <p className={styles.footnote}>Menu data is loaded live from Supabase. Availability changes are saved directly to Supabase.</p>
          </div>}

          {section === "Offers" && <div className={styles.offerGrid}>
            <div className={styles.offerCard}><div className={styles.offerTop}><Tags/><span className={styles.demoTag}>EXAMPLE</span></div><h2>Today&apos;s special</h2><p>Special offers for your restaurant customers.</p><div className={styles.offerDiscount}>10% OFF</div><div className={styles.offerBottom}><span>{offerActive ? "Currently active" : "Inactive"}</span><label className={styles.switch}><input type="checkbox" checked={offerActive} onChange={() => setOfferActive(!offerActive)}/><span/></label></div></div>
            <div className={styles.panel}><h2>Offer management</h2><p className={styles.panelDescription}>Create promotions, define discount rules, set start and end dates, and activate or deactivate offers.</p><button className={styles.primaryButton} onClick={() => alert("Offer creation form will be implemented with database integration.")}><Plus size={17}/> Create new offer</button><p className={styles.footnote}>This is a sample offer. No discount is applied at customer checkout yet.</p></div>
          </div>}

          {section === "Reports" && <div className={styles.panel}>
            <div className={styles.panelHeading}><div><h2>Business reports</h2><p>Illustrative performance summary</p></div></div>
            <div className={styles.statsGrid}><Stat icon={<IndianRupee/>} label="Gross sales" value="Rs. 8,450" change="Today" note="Sample figure"/><Stat icon={<ShoppingBag/>} label="Orders" value="49" change="Today" note="Sample figure"/><Stat icon={<TrendingUp/>} label="Average order" value="Rs. 172" change="Today" note="Sample figure"/></div>
            <p className={styles.footnote}>Real sales reports will be available after connecting the order database.</p>
          </div>}

          {section === "Settings" && <div className={styles.panel}>
            <div className={styles.panelHeading}><div><h2>Restaurant settings</h2><p>Basic restaurant information</p></div></div>
            <div className={styles.settingsList}>
              <Setting label="Restaurant name" value="Sri Gayatri Vilas"/>
              <Setting label="Location" value="Vizianagaram, Andhra Pradesh"/>
              <Setting label="Order method" value="Guest checkout"/>
              <Setting label="Payment method" value="Cash on Delivery"/>
              <Setting label="Customer data retention" value="72 hours (planned policy)"/>
              <Setting label="Admin authentication" value="To be configured securely"/>
            </div>
            <p className={styles.footnote}>These settings are display-only until connected to the backend.</p>
          </div>}

          <footer className={styles.footer}>SRI GAYATRI VILAS <span> | </span> ADMINISTRATION <span> | </span> 2026</footer>
        </div>
      </section>
    </main>
  );
}

function Stat({icon,label,value,change,note}:{icon:React.ReactNode;label:string;value:string;change:string;note:string}) {
  return <div className={styles.statCard}><div className={styles.statTop}><span>{label}</span><div className={styles.statIcon}>{icon}</div></div><strong className={styles.statValue}>{value}</strong><div className={styles.statFoot}><span>{change}</span><small>{note}</small></div></div>;
}
function Quick({icon,title,desc,onClick}:{icon:React.ReactNode;title:string;desc:string;onClick:()=>void}) {
  return <button className={styles.quickCard} onClick={onClick}><span className={styles.quickIcon}>{icon}</span><span><strong>{title}</strong><small>{desc}</small></span><ArrowUpRight size={17}/></button>;
}
function Setting({label,value}:{label:string;value:string}) {
  return <div className={styles.settingRow}><span>{label}</span><strong>{value}</strong></div>;
}










