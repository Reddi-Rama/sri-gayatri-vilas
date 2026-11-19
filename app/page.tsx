"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, Check,
Menu, Minus, Plus, ShoppingBag, Sparkles, X
} from "lucide-react";

const localFoodImages: Record<number, string> = {
  // IDLY'S
  101: "/images/idly.png",
  102: "/images/Ghee Podi Idly (2).jpg",
  103: "/images/Sambar Idly (2).png",
  104: "/images/aaviri kudum.jpg",
  105: "/images/Ghee Podi Avira Kudum.webp",
  106: "/images/Button Idly.jpg",
  107: "/images/Button Sambar Idly (10).jpg",
  108: "/images/Button Ghee Podi Idly.jpg",

  // VADA'S
  109: "/images/Vada's — 3 images.jpg",
  110: "/images/Sambar Vada.webp",
  111: "/images/Perugu Vada.webp",

  // PURI
  112: "/images/Golden Puri Platter with Potato Masala and Sambar.png",

  // UTTAPAM'S
  113: "/images/Plain Uttapam.jpg",
  114: "/images/Onion Uttapam.webp",
  115: "/images/Ghee Podi Uttapam.jpg",

  // UPMA
  116: "/images/Upma.jpg",
  117: "/images/Ghee Upma.png",
  118: "/images/Ghee Podi Upma.png",

  // REGULAR DOSA'S
  119: "/images/Plain Dosa.webp",
  120: "/images/Onion Dosa.webp",
  121: "/images/Upma Dosa.jpg",
  122: "/images/Masala Dosa.jpg",
  123: "/images/Chitti Pesara Dosa.jpg",
  124: "/images/Pesara Plain Dosa.jpg",
  125: "/images/Pesara Onion Dosa.jpg",
  126: "/images/Pesara Masala Dosa.png",
  127: "/images/Pesara Upma Dosa.png",

  // RAVA DOSA'S
  128: "/images/Rava Dosa.png",
  129: "/images/Rava Onion Dosa.png",
  130: "/images/Rava Upma Dosa.png",
  131: "/images/Rava Masala Dosa.jpg",
  132: "/images/Rava Ghee Podi Dosa.png",
  133: "/images/Rava Butter Masala Dosa.png",
  134: "/images/Rava Butter Paneer Masala Dosa.png",

  // GHEE DOSA'S
  135: "/images/Ghee chitti minapa dosa.png",
  136: "/images/Onion Dosa.webp",
  137: "/images/Upma Dosa.jpg",
  138: "/images/Rava Ghee Podi Dosa.png",
  139: "/images/Masala Dosa.jpg",
  140: "/images/Chitti Pesara Dosa.jpg",
  141: "/images/Pesara Plain Dosa.jpg",
  142: "/images/Pesara Onion Dosa.jpg",
  143: "/images/Pesara Masala Dosa.png",
  144: "/images/Pesara Upma Dosa.png",

  // NELLORE KARAM DOSA'S
  145: "/images/Masala Dosa.jpg",
  146: "/images/Rava Ghee Podi Dosa.png",
  147: "/images/Upma Dosa.jpg",
  148: "/images/Onion Dosa.webp",
  149: "/images/Masala Dosa.jpg",

  // BUTTER DOSA'S
  150: "/images/Plain Dosa.webp",
  151: "/images/Masala Dosa.jpg",
  152: "/images/Onion Dosa.webp",
  153: "/images/Upma Dosa.jpg",
  154: "/images/Masala Dosa.jpg",
  155: "/images/Masala Dosa.jpg",
  156: "/images/Upma Dosa.jpg",
  157: "/images/Panner nellore karam dosa.png",
  158: "/images/Rava Ghee Podi Dosa.png",

  // PANEER DOSA'S
  159: "/images/Rava Butter Paneer Masala Dosa.png",
  160: "/images/panner onion dosa.png",
  161: "/images/Panner nellore karam dosa.png",
  162: "/images/panner butter dosa.png",
  163: "/images/kaju panner dosa.png",
  164: "/images/kaju butter panner dosa.jpg",

  // SPECIAL DOSA'S
  165: "/images/gayatri vilas special dosa.jpg",
  166: "/images/mla dsosa.jpg",
  167: "/images/70 mm dosa.jpg",
  168: "/images/Rameshwaram special dosa.jpg",
  169: "/images/sponge dosa.jpg",
  170: "/images/Ghee podi sponge dosa.jpg",

  // INDIAN BREADS
  171: "/images/chapathi.jpg",
  172: "/images/Ghee chapathi.jpg",
  173: "/images/pulka.jpg",
  174: "/images/Butter pulka.jpg",
  175: "/images/Ghee Pulka.webp",
  176: "/images/parota.jpg",
};

const foodImage = (tags: string, id: number) =>
  localFoodImages[id] || "/images/Plain Dosa.webp";
const dishes = [
  // IDLY'S
  { id: 1, name: "Idly (2)", category: "Idly's", description: "Soft South Indian idly.", price: 30, tag: "POPULAR", image: foodImage("idli,sambar", 101) },
  { id: 2, name: "Ghee Podi Idly (2)", category: "Idly's", description: "Idly with ghee and podi.", price: 50, image: foodImage("podi,idli", 102) },
  { id: 3, name: "Sambar Idly (2)", category: "Idly's", description: "Idly served with sambar.", price: 40, image: foodImage("sambar,idli", 103) },
  { id: 4, name: "Avira Kudem (1)", category: "Idly's", description: "Traditional Avira Kudem.", price: 40, image: foodImage("southindian,steamed,ricecake", 104) },
  { id: 5, name: "Ghee Podi Avira Kudem (1)", category: "Idly's", description: "Avira Kudem with ghee podi.", price: 50, image: foodImage("southindian,podi,ghee", 105) },
  { id: 6, name: "Button Idly (10)", category: "Idly's", description: "Mini bite-sized idlies.", price: 40, image: foodImage("mini,idli,southindian", 106) },
  { id: 7, name: "Button Sambar Idly (10)", category: "Idly's", description: "Mini idlies with sambar.", price: 50, image: foodImage("mini,idli,sambar", 107) },
  { id: 8, name: "Button Ghee Podi Idly (10)", category: "Idly's", description: "Mini idlies with ghee podi.", price: 60, image: foodImage("mini,idli,podi", 108) },

  // VADA'S
  { id: 9, name: "Vada (2)", category: "Vada's", description: "Crispy South Indian vada.", price: 40, image: foodImage("meduvada,vada", 109) },
  { id: 10, name: "Sambar Vada (2)", category: "Vada's", description: "Vada served in sambar.", price: 50, image: foodImage("sambar,meduvada", 110) },
  { id: 11, name: "Perugu Vada (2)", category: "Vada's", description: "Vada served with seasoned curd.", price: 60, image: foodImage("dahi,vada,indian", 111) },

  // PURI
  { id: 12, name: "Puri (2)", category: "Puri", description: "Golden puri with potato masala.", price: 50, image: foodImage("poori,potato,indian", 112) },

  // UTTAPAM'S
  { id: 13, name: "Plain Uttapam (1)", category: "Uttapam's", description: "Soft plain uttapam.", price: 40, image: foodImage("plain,uttapam", 113) },
  { id: 14, name: "Onion Uttapam (1)", category: "Uttapam's", description: "Uttapam topped with onion.", price: 50, image: foodImage("onion,uttapam", 114) },
  { id: 15, name: "Ghee Podi Uttapam (1)", category: "Uttapam's", description: "Uttapam with ghee podi.", price: 60, image: foodImage("ghee,podi,uttapam", 115) },

  // UPMA
  { id: 16, name: "Upma", category: "Upma", description: "Traditional South Indian upma.", price: 30, image: foodImage("rava,upma", 116) },
  { id: 17, name: "Ghee Upma", category: "Upma", description: "Upma finished with ghee.", price: 40, image: foodImage("ghee,upma", 117) },
  { id: 18, name: "Ghee Podi Upma", category: "Upma", description: "Upma with ghee podi.", price: 50, image: foodImage("podi,upma", 118) },

  // REGULAR DOSA'S
  { id: 19, name: "Plain Dosa", category: "Regular Dosa's", description: "Classic crispy plain dosa.", price: 50, image: foodImage("plain,dosa", 119) },
  { id: 20, name: "Onion Dosa", category: "Regular Dosa's", description: "Dosa topped with onion.", price: 60, image: foodImage("onion,dosa", 120) },
  { id: 21, name: "Upma Dosa", category: "Regular Dosa's", description: "Dosa with upma filling.", price: 60, image: foodImage("upma,dosa", 121) },
  { id: 22, name: "Masala Dosa", category: "Regular Dosa's", description: "Dosa with potato masala.", price: 60, image: foodImage("masala,dosa", 122) },
  { id: 23, name: "Chitti Pesara Dosa (3)", category: "Regular Dosa's", description: "Small green gram dosas.", price: 70, image: foodImage("pesarattu,moong,dosa", 123) },
  { id: 24, name: "Pesara Plain Dosa", category: "Regular Dosa's", description: "Plain green gram dosa.", price: 50, image: foodImage("pesarattu,green,gram", 124) },
  { id: 25, name: "Pesara Onion Dosa", category: "Regular Dosa's", description: "Green gram dosa with onion.", price: 60, image: foodImage("pesarattu,onion", 125) },
  { id: 26, name: "Pesara Masala Dosa", category: "Regular Dosa's", description: "Green gram dosa with masala.", price: 60, image: foodImage("pesarattu,masala", 126) },
  { id: 27, name: "Pesara Upma Dosa", category: "Regular Dosa's", description: "Green gram dosa with upma.", price: 60, image: foodImage("pesarattu,upma", 127) },

  // RAVA DOSA'S
  { id: 28, name: "Rava Dosa", category: "Rava Dosa's", description: "Crispy semolina dosa.", price: 50, image: foodImage("rava,dosa", 128) },
  { id: 29, name: "Rava Onion Dosa", category: "Rava Dosa's", description: "Crispy rava dosa with onion.", price: 60, image: foodImage("rava,onion,dosa", 129) },
  { id: 30, name: "Rava Upma Dosa", category: "Rava Dosa's", description: "Rava dosa with upma filling.", price: 60, image: foodImage("rava,upma,dosa", 130) },
  { id: 31, name: "Rava Masala Dosa", category: "Rava Dosa's", description: "Rava dosa with potato masala.", price: 60, image: foodImage("rava,masala,dosa", 131) },
  { id: 32, name: "Rava Ghee Podi Dosa", category: "Rava Dosa's", description: "Rava dosa with ghee podi.", price: 60, image: foodImage("rava,ghee,podi,dosa", 132) },
  { id: 33, name: "Rava Butter Masala Dosa", category: "Rava Dosa's", description: "Butter rava dosa with masala.", price: 70, image: foodImage("rava,butter,masala,dosa", 133) },
  { id: 34, name: "Rava Butter Paneer Masala Dosa", category: "Rava Dosa's", description: "Rava dosa with butter and paneer masala.", price: 80, image: foodImage("rava,paneer,butter,dosa", 134) },

  // GHEE DOSA'S
  { id: 35, name: "Ghee Chitti Minapa Dosa (3)", category: "Ghee Dosa's", description: "Mini minapa dosas with ghee.", price: 70, image: foodImage("mini,ghee,dosa", 135) },
  { id: 36, name: "Ghee Onion Dosa", category: "Ghee Dosa's", description: "Onion dosa prepared with ghee.", price: 70, image: foodImage("ghee,onion,dosa", 136) },
  { id: 37, name: "Ghee Upma Dosa", category: "Ghee Dosa's", description: "Ghee dosa with upma filling.", price: 80, image: foodImage("ghee,upma,dosa", 137) },
  { id: 38, name: "Ghee Podi Dosa", category: "Ghee Dosa's", description: "Dosa with aromatic ghee podi.", price: 70, image: foodImage("ghee,podi,dosa", 138) },
  { id: 39, name: "Ghee Masala Dosa", category: "Ghee Dosa's", description: "Masala dosa prepared with ghee.", price: 80, image: foodImage("ghee,masala,dosa", 139) },
  { id: 40, name: "Ghee Chitti Pesara Dosa", category: "Ghee Dosa's", description: "Mini pesara dosa with ghee.", price: 70, image: foodImage("ghee,pesarattu", 140) },
  { id: 41, name: "Ghee Pesara Plain Dosa", category: "Ghee Dosa's", description: "Plain pesara dosa with ghee.", price: 60, image: foodImage("ghee,plain,pesarattu", 141) },
  { id: 42, name: "Ghee Pesara Onion Dosa", category: "Ghee Dosa's", description: "Ghee pesara dosa with onion.", price: 70, image: foodImage("ghee,onion,pesarattu", 142) },
  { id: 43, name: "Ghee Pesara Masala Dosa", category: "Ghee Dosa's", description: "Ghee pesara dosa with masala.", price: 80, image: foodImage("ghee,masala,pesarattu", 143) },
  { id: 44, name: "Ghee Pesara Upma Dosa", category: "Ghee Dosa's", description: "Ghee pesara dosa with upma.", price: 80, image: foodImage("ghee,upma,pesarattu", 144) },

  // NELLORE KARAM DOSA'S
  { id: 45, name: "Nellore Karam Ghee Dosa", category: "Nellore Karam Dosa's", description: "Nellore karam dosa with ghee.", price: 70, image: foodImage("nellore,karam,dosa", 145) },
  { id: 46, name: "Nellore Karam Ghee Podi Dosa", category: "Nellore Karam Dosa's", description: "Karam dosa with ghee podi.", price: 80, image: foodImage("karam,podi,dosa", 146) },
  { id: 47, name: "Nellore Karam Ghee Upma Dosa", category: "Nellore Karam Dosa's", description: "Karam dosa with upma and ghee.", price: 90, image: foodImage("nellore,upma,dosa", 147) },
  { id: 48, name: "Nellore Karam Onion Dosa", category: "Nellore Karam Dosa's", description: "Spicy karam dosa with onion.", price: 80, image: foodImage("karam,onion,dosa", 148) },
  { id: 49, name: "Nellore Karam Ghee Masala Dosa", category: "Nellore Karam Dosa's", description: "Karam dosa with ghee and masala.", price: 90, image: foodImage("karam,ghee,masala,dosa", 149) },

  // BUTTER DOSA'S
  { id: 50, name: "Butter Dosa", category: "Butter Dosa's", description: "Golden dosa with butter.", price: 60, image: foodImage("butter,plain,dosa", 150) },
  { id: 51, name: "Butter Masala Dosa", category: "Butter Dosa's", description: "Butter dosa with potato masala.", price: 70, image: foodImage("butter,masala,dosa", 151) },
  { id: 52, name: "Butter Onion Dosa", category: "Butter Dosa's", description: "Butter dosa topped with onion.", price: 70, image: foodImage("butter,onion,dosa", 152) },
  { id: 53, name: "Butter Upma Dosa", category: "Butter Dosa's", description: "Butter dosa with upma filling.", price: 70, image: foodImage("butter,upma,dosa", 153) },
  { id: 54, name: "Butter Nellore Karam Dosa", category: "Butter Dosa's", description: "Butter dosa with Nellore karam.", price: 70, image: foodImage("butter,karam,dosa", 154) },
  { id: 55, name: "Butter Nellore Karam Masala Dosa", category: "Butter Dosa's", description: "Butter karam dosa with masala.", price: 80, image: foodImage("butter,karam,masala,dosa", 155) },
  { id: 56, name: "Butter Nellore Karam Upma Dosa", category: "Butter Dosa's", description: "Butter karam dosa with upma.", price: 80, image: foodImage("butter,karam,upma,dosa", 156) },
  { id: 57, name: "Butter Nellore Karam Paneer Dosa", category: "Butter Dosa's", description: "Butter karam dosa with paneer.", price: 90, image: foodImage("butter,karam,paneer,dosa", 157) },
  { id: 58, name: "Better Ghee Podi Dosa", category: "Butter Dosa's", description: "Butter dosa with ghee podi.", price: 60, image: foodImage("butter,ghee,podi,dosa", 158) },

  // PANEER DOSA'S
  { id: 59, name: "Paneer Dosa", category: "Paneer Dosa's", description: "Dosa with paneer filling.", price: 80, image: foodImage("paneer,dosa", 159) },
  { id: 60, name: "Paneer Onion Dosa", category: "Paneer Dosa's", description: "Paneer dosa with onion.", price: 90, image: foodImage("paneer,onion,dosa", 160) },
  { id: 61, name: "Paneer Nellore Karam Dosa", category: "Paneer Dosa's", description: "Paneer dosa with Nellore karam.", price: 100, image: foodImage("paneer,karam,dosa", 161) },
  { id: 62, name: "Paneer Butter Dosa", category: "Paneer Dosa's", description: "Paneer dosa prepared with butter.", price: 90, image: foodImage("paneer,butter,dosa", 162) },
  { id: 63, name: "Kaju Paneer Dosa", category: "Paneer Dosa's", description: "Paneer dosa with cashews.", price: 100, image: foodImage("kaju,paneer,dosa", 163) },
  { id: 64, name: "Kaju Butter Paneer Dosa", category: "Paneer Dosa's", description: "Paneer dosa with cashew and butter.", price: 120, image: foodImage("cashew,butter,paneer,dosa", 164) },

  // SPECIAL DOSA'S
  { id: 65, name: "Gayatri Vilas Special Dosa", category: "Special Dosa's", description: "Our signature special dosa.", price: 80, tag: "HOUSE SPECIAL", image: foodImage("special,southindian,dosa", 165) },
  { id: 66, name: "MLA Dosa", category: "Special Dosa's", description: "A hearty stuffed MLA dosa.", price: 80, image: foodImage("mla,stuffed,dosa", 166) },
  { id: 67, name: "70MM Dosa", category: "Special Dosa's", description: "Large special dosa.", price: 80, image: foodImage("large,masala,dosa", 167) },
  { id: 68, name: "Rameswaram Special Dosa (1)", category: "Special Dosa's", description: "Rameswaram-style special dosa.", price: 60, image: foodImage("rameswaram,ghee,podi,dosa", 168) },
  { id: 69, name: "Spong Dosa (2)", category: "Special Dosa's", description: "Soft and spongy dosa.", price: 50, image: foodImage("sponge,dosa", 169) },
  { id: 70, name: "Ghee Podi Spong Dosa (2)", category: "Special Dosa's", description: "Spongy dosa with ghee podi.", price: 70, image: foodImage("sponge,ghee,podi,dosa", 170) },

  // INDIAN BREADS
  { id: 71, name: "Chapati (1)", category: "Indian Breads", description: "Freshly prepared chapati.", price: 50, image: foodImage("chapati,indianbread", 171) },
  { id: 72, name: "Ghee Chapati (1)", category: "Indian Breads", description: "Chapati finished with ghee.", price: 70, image: foodImage("ghee,chapati", 172) },
  { id: 73, name: "Pulka (3)", category: "Indian Breads", description: "Soft traditional pulka.", price: 60, image: foodImage("phulka,roti", 173) },
  { id: 74, name: "Butter Pulka (3)", category: "Indian Breads", description: "Pulka finished with butter.", price: 70, image: foodImage("butter,phulka", 174) },
  { id: 75, name: "Ghee Pulka (3)", category: "Indian Breads", description: "Pulka finished with ghee.", price: 70, image: foodImage("ghee,phulka", 175) },
  { id: 76, name: "Parota (2)", category: "Indian Breads", description: "Layered Indian parota.", price: 60, image: foodImage("parotta,paratha", 176) }
];

const featuredDishes = dishes.filter((dish) =>
  [1, 9, 12, 13, 16, 19, 22, 65, 71].includes(dish.id)
);
const categories = [
  "All",
  "Idly's",
  "Vada's",
  "Puri",
  "Uttapam's",
  "Upma",
  "Regular Dosa's",
  "Rava Dosa's",
  "Ghee Dosa's",
  "Nellore Karam Dosa's",
  "Butter Dosa's",
  "Paneer Dosa's",
  "Special Dosa's",
  "Indian Breads"
];

export default function Home() {
  useEffect(() => {
    const selectors = [
      ".hero-copy",
      ".hero-art",
      ".story-top",
      ".story-content",
      ".story-footer-photo",
      ".story-footer-value",
      ".food-marquee-heading",
      ".food-marquee-card",
      ".menu-section > .section-topline",
      ".section-title-row",
      ".menu-toolbar",
      ".category-pill",
      ".dish-grid > article",
      ".special-image",
      ".special-copy",
      ".gallery-section > .section-topline",
      ".gallery-heading",
      ".gallery-photo",
      ".visit-heading",
      ".visit-block",
      ".footer > *"
    ];
const elements = document.querySelectorAll(selectors.join(","));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      elements.forEach(element => element.classList.add("scroll-revealed"));
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("scroll-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -45px 0px"
      }
    );

    elements.forEach((element, index) => {
      element.classList.add("scroll-reveal");
      (element as HTMLElement).style.setProperty(
        "--reveal-delay",
        `${(index % 4) * 110}ms`
      );
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);


  // SYNC_CATEGORY_SCROLLBAR
  useEffect(() => {
    const list = document.querySelector<HTMLElement>(
      "main .menu-toolbar .category-list"
    );
    const track = document.querySelector<HTMLElement>(
      "main .menu-toolbar .category-scrollbar"
    );
    const thumb = document.querySelector<HTMLElement>(
      "main .menu-toolbar .category-scrollbar-thumb"
    );

    if (!list || !track || !thumb) return;

    let dragging = false;
    let grabOffset = 0;

    const update = () => {
      const visible = list.clientWidth;
      const total = list.scrollWidth;
      const trackWidth = track.clientWidth;

      if (!visible || !total || !trackWidth) return;

      const ratio = Math.min(1, visible / total);
      const thumbWidth = Math.max(35, trackWidth * ratio);
      const travel = Math.max(0, trackWidth - thumbWidth);
      const maxScroll = Math.max(0, total - visible);
      const position = maxScroll ? (list.scrollLeft / maxScroll) * travel : 0;

      thumb.style.width = `${thumbWidth}px`;
      thumb.style.transform = `translateX(${position}px)`;
    };

    const moveToPointer = (clientX: number) => {
      const rect = track.getBoundingClientRect();
      const travel = track.clientWidth - thumb.clientWidth;
      const maxScroll = list.scrollWidth - list.clientWidth;

      if (travel <= 0 || maxScroll <= 0) return;

      const position = Math.max(
        0,
        Math.min(travel, clientX - rect.left - grabOffset)
      );

      list.scrollLeft = (position / travel) * maxScroll;
    };

    const pointerDown = (event: PointerEvent) => {
      event.preventDefault();

      const thumbRect = thumb.getBoundingClientRect();
      const onThumb =
        event.clientX >= thumbRect.left &&
        event.clientX <= thumbRect.right;

      grabOffset = onThumb
        ? event.clientX - thumbRect.left
        : thumb.clientWidth / 2;

      dragging = true;
      moveToPointer(event.clientX);
    };

    const pointerMove = (event: PointerEvent) => {
      if (dragging) {
        event.preventDefault();
        moveToPointer(event.clientX);
      }
    };

    const pointerUp = () => {
      dragging = false;
    };

    track.addEventListener("pointerdown", pointerDown);
    window.addEventListener("pointermove", pointerMove, { passive: false });
    window.addEventListener("pointerup", pointerUp);
    window.addEventListener("pointercancel", pointerUp);
    list.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    const observer = new ResizeObserver(update);
    observer.observe(list);
    observer.observe(track);

    requestAnimationFrame(update);

    return () => {
      track.removeEventListener("pointerdown", pointerDown);
      window.removeEventListener("pointermove", pointerMove);
      window.removeEventListener("pointerup", pointerUp);
      window.removeEventListener("pointercancel", pointerUp);
      list.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      observer.disconnect();
    };
  }, []);
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState<Record<number, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [marqueePaused, setMarqueePaused] = useState(false);
  const [marqueeDirection, setMarqueeDirection] = useState<"left" | "right">("left");
  const [selectedDishId, setSelectedDishId] = useState<number | null>(null);
  const bagButtonRef = useRef<HTMLButtonElement | null>(null);
  const flightIdRef = useRef(0);

  const [flyingItems, setFlyingItems] = useState<Array<{
    id: number;
    dishId: number;
    image: string;
    left: number;
    top: number;
    width: number;
    height: number;
    dx: number;
    dy: number;
  }>>([]);

  const visible = useMemo(
    () => category === "All"
      ? dishes
      : dishes.filter(d => d.category === category),
    [category]
  );
  const selectedDish = dishes.find(dish => dish.id === selectedDishId);

  const cartItems = dishes.filter(d => cart[d.id]);
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const subtotal = cartItems.reduce(
    (sum, d) => sum + d.price * cart[d.id], 0
  );

  function updateQty(id: number, amount: number) {
    setCart(current => {
      const next = { ...current, [id]: Math.max(0, (current[id] || 0) + amount) };
      if (!next[id]) delete next[id];
      return next;
    });
  }
  function addDishToBag(
    dish: (typeof dishes)[number],
    source: Element | null
  ) {
    const target = bagButtonRef.current;

    const imageElement =
      source instanceof HTMLImageElement
        ? source
        : source?.querySelector("img");

    const sourceRect = imageElement?.getBoundingClientRect();
    const bagIcon = target?.querySelector(".bag-flight-icon") ?? target;
    const targetRect = bagIcon?.getBoundingClientRect();

    if (
      !target ||
      !sourceRect ||
      !targetRect ||
      sourceRect.width < 2 ||
      sourceRect.height < 2
    ) {
      updateQty(dish.id, 1);
      return;
    }

    const imageUrl =
      imageElement instanceof HTMLImageElement
        ? imageElement.currentSrc || imageElement.src
        : dish.image;

    const width = Math.min(sourceRect.width, 180);
    const height = sourceRect.height * (width / sourceRect.width);

    const flight = {
      id: ++flightIdRef.current,
      dishId: dish.id,
      image: imageUrl,
      left: sourceRect.left + (sourceRect.width - width) / 2,
      top: sourceRect.top + (sourceRect.height - height) / 2,
      width,
      height,
      dx: targetRect.left + targetRect.width / 2 -
        (sourceRect.left + sourceRect.width / 2),
      dy: targetRect.top + targetRect.height / 2 -
        (sourceRect.top + sourceRect.height / 2)
    };

    setFlyingItems(current => [...current, flight]);
  }

  async function confirmOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting || cartItems.length === 0) return;

    setIsSubmitting(true);
    setOrderError("");

    const form = new FormData(e.currentTarget);

    const { data, error } = await supabase.rpc("place_customer_order", {
      p_customer_name: String(form.get("customer_name") || ""),
      p_phone: String(form.get("phone") || ""),
      p_alternative_phone: String(form.get("alternative_phone") || ""),
      p_address: String(form.get("address") || ""),
      p_items: cartItems.map(dish => ({
        id: dish.id,
        quantity: cart[dish.id]
      }))
    });

    setIsSubmitting(false);

    if (error) {
      setOrderError(error.message);
      return;
    }

    if (!data) {
      setOrderError("Order could not be confirmed. Please try again.");
      return;
    }

    setSubmitted(true);
  }

  return (
    <main>
      <header className="site-header">
        <a href="#home" className="wordmark">
          <img src="/images/logo.png" alt="Sri Gayatri Vilas" style={{width:48,height:48,objectFit:"contain",display:"block",flexShrink:0}} />
          <i>SRI GAYATRI VILAS</i>
        </a>

        <nav className={mobileOpen ? "main-nav nav-visible" : "main-nav"}>
          <a href="#menu" onClick={() => setMobileOpen(false)}>THE MENU</a>
          <a href="#story" onClick={() => setMobileOpen(false)}>OUR STORY</a>
          <a href="#special" onClick={() => setMobileOpen(false)}>SPECIALS</a>
          <a href="#visit" onClick={() => setMobileOpen(false)}>FIND US</a>
        </nav>

        <div className="header-actions">
          <button className="header-order" onClick={() => setCartOpen(true)}>
            ORDER ONLINE <ArrowUpRight size={14} />
          </button>

          <button
            className="bag-trigger"
            ref={bagButtonRef}
            onClick={() => setCartOpen(true)}
          >
            <motion.span
              key={`bag-icon-${count}`}
              className="bag-flight-icon"
              initial={{ scale: 1 }}
              animate={count > 0
                ? { scale: [1, 1.35, .92, 1], rotate: [0, -10, 8, 0] }
                : { scale: 1 }}
              transition={{ duration: .5 }}
            >
              <ShoppingBag size={17} />
            </motion.span>
            BAG
            <motion.b
              key={`bag-count-${count}`}
              initial={{ scale: 1 }}
              animate={count > 0 ? { scale: [1, 1.35, 1] } : { scale: 1 }}
              transition={{ duration: .4 }}
            >
              {count}
            </motion.b>
          </button>

          <button className="mobile-menu" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <section className="hero" id="home">
        <div className="hero-backdrop-word">VILAS</div>

        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-line" />
            A TABLE FULL OF GOODNESS  |  VIZIANAGARAM
          </div>

          <h1>
            Rooted in<br />
            tradition.<br />
            <em>Made for today.</em>
          </h1>

          <p className="hero-lede">
            A familiar favourite, a new little craving.
            Come together over honest food and flavours that feel like home.
          </p>

          <div className="hero-ctas">
            <a href="#menu" className="btn-cream">
              EXPLORE THE MENU <ArrowUpRight size={15} />
            </a>
            <a href="#story" className="understated-link">
              OUR STORY <ArrowDownRight size={15} />
            </a>
          </div>

          <div className="hero-meta">
            <span>01 — 04</span><i />
            <span>FRESHLY PREPARED  |  ALWAYS WELCOMING</span>
          </div>
        </div>

        <div className="hero-art">
          <img
            className="hero-main-image"
            src="/images/sgv-breakfast.gif"
            alt="Fresh South Indian breakfast with idli, medu vada, sambar and chutney"
/>
          
          <div className="hero-image-label">
            <span>THE ART OF EVERYDAY DINING</span>
            <span>EST. VIZIANAGARAM</span>
          </div>
          <div className="seal">
            <span>MADE</span><b>WITH</b><span>LOVE</span><i>✳</i>
          </div>
        </div>

        <a className="scroll-cue" href="#story">
          SCROLL TO EXPLORE <ArrowDownRight size={15} />
        </a>
      </section>

      <section className="story-section" id="story">
        <div className="story-top">
          <span className="eyebrow dark-eyebrow">01 / A PLACE AT OUR TABLE</span>
          <span className="story-index">THE GOOD THINGS ARE SHARED.</span>
        </div>

        <div className="story-content">
          <h2>Some flavours<br />just feel like <em>home.</em></h2>

          <div className="story-right">
            <p>
              From the first comforting bite to the last sip,
              we believe a good meal is about more than what's on the plate.
              It's about the people around the table, familiar flavours
              and the moments that stay with you.
            </p>
            <a href="#menu" className="dark-link">
              COME FIND YOUR FAVOURITE <ArrowUpRight size={14} />
            </a>
          </div>
        </div>

        <div className="story-footer">
          <div className="story-footer-photo">
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="Fresh dosa being prepared on a hot tawa"
            >
              <source src="/videos/story-cooking.mp4" type="video/mp4" />
            </video>
            <span>A TASTE OF HOME</span>
          </div>

          <div className="story-footer-values">
            <div className="story-footer-value">
              <span>01</span>
              <strong>Familiar flavours</strong>
            </div>
            <div className="story-footer-value">
              <span>02</span>
              <strong>A place to gather</strong>
            </div>
            <div className="story-footer-value">
              <span>03</span>
              <strong>Moments worth sharing</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="food-marquee-section" aria-label="Our food gallery">
        <div className="food-marquee-heading">
          <span className="eyebrow">A TASTE OF SRI GAYATRI VILAS</span>
          <h2>Fresh from <em>our kitchen.</em></h2>
        </div>

        <div className="food-marquee-window">
          <div className={`food-marquee-track ${marqueeDirection === "right" ? "reverse" : ""}`} style={{ animationPlayState: marqueePaused ? "paused" : "running" }}>
            <div className="food-marquee-group">
              {featuredDishes.map((dish) => (
                <article className="food-marquee-card" key={`first-${dish.id}`}>
                  <img src={dish.image} alt={dish.name} loading="lazy" />
                  <div className="food-marquee-caption">
                    <h3>{dish.name}</h3>
                    <span>SRI GAYATRI VILAS</span>
                  </div>
                </article>
              ))}
            </div>

            <div className="food-marquee-group" aria-hidden="true">
              {featuredDishes.map((dish) => (
                <article className="food-marquee-card" key={`second-${dish.id}`}>
                  <img src={dish.image} alt="" loading="lazy" />
                  <div className="food-marquee-caption">
                    <h3>{dish.name}</h3>
                    <span>SRI GAYATRI VILAS</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
                      <div
          className="food-marquee-controls"
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "12px",
            maxWidth: "1440px",
            margin: "28px auto 0",
            padding: "0 7%"
          }}
        >
          <button
            type="button"
            onClick={() => setMarqueePaused(current => !current)}
            style={{
              height: "46px",
              minWidth: "74px",
              padding: "0 17px",
              border: "1px solid rgba(245,240,231,0.35)",
              background: "transparent",
              color: "#f5f0e7",
              cursor: "pointer",
              fontSize: "11px",
              letterSpacing: "0.12em"
            }}
          >
            {marqueePaused ? "PLAY" : "PAUSE"}
          </button>

          <button
            type="button"
            onClick={() => {
              setMarqueeDirection("left");
              setMarqueePaused(false);
            }}
            aria-label="Move left"
            style={{
              height: "46px",
              width: "46px",
              border: "1px solid rgba(245,240,231,0.35)",
              background: "transparent",
              color: "#f5f0e7",
              cursor: "pointer",
              fontSize: "19px"
            }}
          >
            {"\u2190"}
          </button>

          <button
            type="button"
            onClick={() => {
              setMarqueeDirection("right");
              setMarqueePaused(false);
            }}
            aria-label="Move right"
            style={{
              height: "46px",
              width: "46px",
              border: "1px solid rgba(245,240,231,0.35)",
              background: "transparent",
              color: "#f5f0e7",
              cursor: "pointer",
              fontSize: "19px"
            }}
          >
            {"→"}
          </button>
        </div>
      </section>
<section className="menu-section" id="menu">
        <div className="section-topline">
          <span className="eyebrow">02 / MADE FRESH, SERVED WITH CARE</span>
          <span className="section-note">A FEW OF OUR FAVOURITES</span>
        </div>

        <div className="section-title-row">
          <h2>A menu worth<br /><em>gathering for.</em></h2>
          <p>Little cravings, big favourites<br />and something for every mood.</p>
        </div>

        <div className="menu-toolbar">
          <div className="category-list">
            {categories.map(c => (
              <button
                key={c}
                className={category === c ? "category-pill selected" : "category-pill"}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="category-scrollbar" aria-hidden="true">
            <span className="category-scrollbar-thumb"></span>
          </div>
          <span className="item-count">{visible.length} DISHES</span>
        </div>

        <div className="dish-grid">
          <svg className="sgv-smoke-defs" aria-hidden="true">
            <defs>
              <filter id="sgv-smoke-filter" x="-100%" y="-100%" width="300%" height="300%">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.014 0.038"
                  numOctaves="3"
                  seed="8"
                  result="smokeNoise"
                />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="smokeNoise"
                  scale="25"
                />
                <feGaussianBlur stdDeviation="4" />
              </filter>
            </defs>
          </svg>
          {visible.map((dish) => (
            <article
              key={dish.id}
              className={selectedDishId === dish.id ? "dish-card is-selected" : "dish-card"}
            >
              <div
                className="dish-image-wrap"
                role="button"
                tabIndex={0}
                aria-haspopup="dialog"
                aria-label={"View details for " + dish.name}
                onClick={() => setSelectedDishId(dish.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedDishId(dish.id);
                  }
                }}
              >
                <img
  className="dish-image"
  src={dish.image}
  alt={dish.name}
  loading="lazy"
  onError={(event) => {
    const category = dish.category;
    const fallback = category.includes("Dosa")
      ? "/images/sgv-dosa-premium.png"
      : category === "Puri" || category === "Indian Breads"
        ? "/images/sgv-puri-hd.png"
        : "/images/sgv-idly-vada-clean.png";

    if (!event.currentTarget.src.endsWith(fallback)) {
      event.currentTarget.src = fallback;
    }
  }}
/>
                <div className="dish-smoke-layer" aria-hidden="true">
                  <span className="dish-smoke-cloud smoke-left" />
                  <span className="dish-smoke-cloud smoke-center" />
                  <span className="dish-smoke-cloud smoke-right" />
                </div>

                {dish.tag && <span className="dish-tag">{dish.tag}</span>}
              </div>

              <div className="dish-details">
                <span className="dish-category">{dish.category}</span>
                <h3>{dish.name}</h3>
                <p>{dish.description}</p>

                <div className="dish-buy">
                  <strong>{"₹"}{dish.price}</strong>

                  {(cart[dish.id] || 0) > 0 ? (
                    <div className="dish-quantity-control" aria-label={`Quantity of ${dish.name}`}>
                      <button
                        type="button"
                        className="dish-quantity-button"
                        onClick={() => updateQty(dish.id, -1)}
                        aria-label={`Remove one ${dish.name}`}
                      >
                        −
                      </button>

                      <span className="dish-quantity-value">
                        {cart[dish.id]}
                      </span>

                      <button
                        type="button"
                        className="dish-quantity-button"
                        onClick={() => updateQty(dish.id, 1)}
                        aria-label={`Add one ${dish.name}`}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(event) =>
                        addDishToBag(
                          dish,
                          event.currentTarget.closest(".dish-card")?.querySelector(".dish-image") ?? null
                        )
                      }
                    >
                      ADD TO BAG <Plus size={13} />
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="demo-note">
          SAMPLE MENU FOR DESIGN PREVIEW  |  FINAL DISHES, PRICES AND AVAILABILITY
          MUST BE CONFIRMED BY THE RESTAURANT.
        </p>
      </section>

            <section className="special-section" id="special">
        <div className="special-image spotlight-image">
          <img
            src="/images/girl-enjoying-dosa.png"
            alt="A woman enjoying dosa at Sri Gayatri Vilas"
            className="special-food-photo"
          />
          <span className="vertical-note">OUR SIGNATURE FAVOURITE</span>
        </div>

        <div className="special-copy spotlight-copy">
          <span className="eyebrow">03 / HOUSE SPECIAL</span>

          <h2>
            Gayatri Vilas<br />
            <em>Special Dosa.</em>
          </h2>

          <p>
            A signature favourite from our kitchen.
            Made fresh and served with the familiar flavours
            that make every visit special.
          </p>

          <a href="#menu" className="spotlight-link">
            EXPLORE DISH <ArrowUpRight size={15} />
          </a>

          <span className="special-foot">
            A LITTLE TASTE OF SRI GAYATRI VILAS.
          </span>
        </div>
      </section>

      <section className="gallery-section">
        <div className="section-topline">
          <span className="eyebrow">04 / A GLIMPSE OF THE GOOD LIFE</span>
          <span className="section-note">FOOD  |  PEOPLE  |  MOMENTS</span>
        </div>

        <div className="gallery-heading">
          <h2>Made to be<br /><em>remembered.</em></h2>
          <p>Pull up a chair. There's always room<br />for one more at our table.</p>
        </div>

        <div className="gallery-layout">
  <div className="gallery-photo gp-three">
    <img
      src="/images/sgv-puri-hd.png"
      alt="Sri Gayatri Vilas puri platter"
      className="gallery-food-photo"
    />
  </div>

  <div className="gallery-feature-copy">
    <span className="gallery-feature-eyebrow">A TASTE OF TRADITION</span>

    <h3>
      Made with warmth.
      <br />
      <em>Served with love.</em>
    </h3>

    <p>
      Golden, freshly prepared puris served with
      comforting accompaniments. A familiar taste,
      made special at Sri Gayatri Vilas.
    </p>

    <div className="gallery-feature-line"></div>

    <span className="gallery-feature-footer">
      SRI GAYATRI VILAS Â· VIZIANAGARAM
    </span>
  </div>
</div>
      </section>

      <section className="visit-section" id="visit">
        <div className="visit-heading">
          <span className="eyebrow dark-eyebrow">05 / COME ON IN</span>
          <h2>We'll keep<br />a place <em>for you.</em></h2>
        </div>

        <div className="visit-block">
          <span>FIND OUR TABLE</span>
          <h3>Sri Gayatri Vilas</h3>
          <p>Vizianagaram, Andhra Pradesh</p>
          <a href="https://www.google.com/maps/search/?api=1&query=Sri+Gayatri+Vilas+Vizianagaram" target="_blank">
            GET DIRECTIONS <ArrowUpRight size={14} />
          </a>
        </div>

        <div className="visit-block">
          <span>LET'S TALK FOOD</span>
          <h3>We're just a call away.</h3>
          <p>Call to confirm today's timings and availability.</p>
          <a href="tel:+919121814782">
            CALL THE RESTAURANT <ArrowUpRight size={14} />
          </a>
        </div>
      </section>

      <footer className="footer">
        <a href="#home" className="wordmark footer-mark">
          <img src="/images/logo.png" alt="Sri Gayatri Vilas" style={{width:48,height:48,objectFit:"contain",display:"block",flexShrink:0}} /><i>SRI GAYATRI VILAS</i>
        </a>
        <p>GOOD FOOD IS ALWAYS A GOOD IDEA.</p>
        <div>
          <a href="#menu">MENU</a>
          <a href="#story">OUR STORY</a>
          <a href="#visit">CONTACT</a>
          <a href="https://social.com" target="_blank">IG</a>
        </div>
        <small>(c) 2026 SRI GAYATRI VILAS  |  VIZIANAGARAM</small>
      </footer>

      <AnimatePresence>
        {cartOpen && (
          <motion.div
            className="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={e => {
              if (e.target === e.currentTarget) setCartOpen(false);
            }}
          >
            <motion.aside
              className="cart-panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28 }}
            >
              <div className="panel-heading">
                <div>
                  <span className="eyebrow dark-eyebrow">YOUR LITTLE SELECTION</span>
                  <h2>Your bag <em>({count})</em></h2>
                </div>
                <button className="close-btn" onClick={() => setCartOpen(false)}><X /></button>
              </div>

              {cartItems.length === 0 ? (
                <div className="empty-state">
                  <ShoppingBag size={34} />
                  <h3>Nothing in the bag. Yet.</h3>
                  <p>Find something lovely on the menu.</p>
                  <button
  className="btn-dark"
  onClick={() => {
    setCartOpen(false);
    setTimeout(() => {
      document.getElementById("menu")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 300);
  }}
>
  BACK TO MENU
</button>
                </div>
              ) : (
                <>
                  <div className="cart-list">
                    {cartItems.map(d => (
                      <div className="cart-row" key={d.id}>
                        <div className="cart-thumb">{d.name.charAt(0)}</div>
                        <div className="cart-item-copy">
                          <h3>{d.name}</h3>
                          <span>₹{d.price}</span>
                          <div className="quantity">
                            <button onClick={() => updateQty(d.id, -1)}><Minus size={12} /></button>
                            <b>{cart[d.id]}</b>
                            <button onClick={() => updateQty(d.id, 1)}><Plus size={12} /></button>
                          </div>
                        </div>
                        <strong>₹{d.price * cart[d.id]}</strong>
                      </div>
                    ))}
                  </div>

                  <div className="cart-summary">
                    <div><span>SUBTOTAL</span><b>₹{subtotal}</b></div>
                    <p>Delivery charges, if applicable, will be confirmed by the restaurant.</p>
                    <button className="btn-dark wide" onClick={() => {
                      setCartOpen(false);
                      setCheckoutOpen(true);
                    }}>
                      CONTINUE TO CHECKOUT <ArrowRight size={15} />
                    </button>
                  </div>
                </>
              )}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {checkoutOpen && (
          <motion.div
            className="scrim centered"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={e => {
              if (e.target === e.currentTarget) setCheckoutOpen(false);
            }}
          >
            <motion.div
              className="checkout-panel"
              initial={{ y: 22, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 22, opacity: 0 }}
            >
              <div className="panel-heading">
                <div>
                  <span className="eyebrow dark-eyebrow">ONE LAST THING</span>
                  <h2>Delivery <em>details.</em></h2>
                </div>
                <button className="close-btn" onClick={() => setCheckoutOpen(false)}><X /></button>
              </div>

              {submitted ? (
                <div className="success-message">
                  <Check size={35} />
                  <h3>Thank you!</h3>
                  <p>Your order has been successfully saved. The restaurant can now review your order.</p>
                  <button className="btn-dark" onClick={() => {
                    setSubmitted(false);
                    setCheckoutOpen(false);
                    setCart({});
                  }}>DONE</button>
                </div>
              ) : (
                <form className="checkout-fields" onSubmit={confirmOrder}>
                  <label>YOUR NAME *<input name="customer_name" required minLength={2} placeholder="Full name" /></label>
                  <label>DELIVERY ADDRESS *<textarea name="address" required minLength={5} rows={3} placeholder="House number, street, area and landmark" /></label>

                  <div className="two-fields">
                    <label>PHONE NUMBER *<input name="phone" required type="tel" pattern="[0-9+\s-]{10,15}" placeholder="Mobile number" /></label>
                    <label>ALTERNATIVE NUMBER<input name="alternative_phone" type="tel" placeholder="Optional" /></label>
                  </div>

                  <div className="cod-box">
                    <span>PAYMENT METHOD</span>
                    <b>Cash on Delivery</b>
                    <small>Pay cash when your order arrives.</small>
                  </div>

                  {orderError && <p role="alert" style={{color:"#b42318",fontSize:"13px"}}>{orderError}</p>}`r`n                  <div className="total-row">
                    <span>ORDER TOTAL</span><b>₹{subtotal}</b>
                  </div>

                  <button className="btn-dark wide" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "SAVING ORDER..." : "CONFIRM ORDER"} <ArrowRight size={15} />
                  </button>
                  <small className="demo-note">DEMO ONLY — NO REAL ORDER IS SENT YET.</small>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedDish && (
          <motion.div
            className="dish-detail-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setSelectedDishId(null);
              }
            }}
          >
            <motion.section
              className="dish-detail-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="dish-detail-title"
              initial={{ opacity: 0, y: 35, scale: .94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: .97 }}
              transition={{ type: "spring", stiffness: 240, damping: 25 }}
              onMouseDown={event => event.stopPropagation()}
            >
              <button
                className="dish-detail-close"
                onClick={() => setSelectedDishId(null)}
                aria-label="Close dish details"
              >
                <X />
              </button>

              <div className="dish-detail-visual">
                <img
                  src={selectedDish.image}
                  alt={selectedDish.name}
                  className="dish-detail-photo"
                />

                <div className="dish-smoke-layer dish-detail-smoke" aria-hidden="true">
                  <span className="dish-smoke-cloud smoke-left" />
                  <span className="dish-smoke-cloud smoke-center" />
                  <span className="dish-smoke-cloud smoke-right" />
                </div>

                <span className="dish-detail-fresh-label">
                  FRESH FROM OUR KITCHEN
                </span>
              </div>

              <div className="dish-detail-content">
                <span className="dish-detail-eyebrow">
                  {selectedDish.category}
                </span>

                <h2 id="dish-detail-title">{selectedDish.name}</h2>

                <p className="dish-detail-description">
                  {selectedDish.description}
                </p>

                <div className="dish-detail-price">
                  <span>PRICE</span>
                  <strong>{"₹"}{selectedDish.price}</strong>
                </div>

                <div className="dish-detail-divider" />

                <p className="dish-detail-note">
                  <Sparkles size={16} />
                  Carefully prepared and served fresh.
                </p>

                <button
                  className="dish-detail-add"
                  onClick={(event) => {
                    addDishToBag(
                      selectedDish,
                      event.currentTarget.closest(".dish-detail-dialog")
                        ?.querySelector(".dish-detail-photo") ?? null
                    );
                    setSelectedDishId(null);
                  }}
                >
                  <ShoppingBag size={18} />
                  ADD TO BAG
                  <ArrowRight size={17} />
                </button>
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
      {flyingItems.map(flight => (
        <motion.img
          key={flight.id}
          className="flying-dish-flight"
          src={flight.image}
          alt=""
          initial={{
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
            rotate: 0
          }}
          animate={{
            x: [0, flight.dx * .42, flight.dx],
            y: [0, flight.dy * .35 - 90, flight.dy],
            scale: [1, .72, .07],
            opacity: [1, .98, 0],
            rotate: [0, -7, 12]
          }}
          transition={{
            duration: .95,
            times: [0, .55, 1],
            ease: [0.22, 0.8, 0.25, 1]
          }}
          onAnimationComplete={() => {
            updateQty(flight.dishId, 1);
            setFlyingItems(current =>
              current.filter(item => item.id !== flight.id)
            );
          }}
          style={{
            position: "fixed",
            left: flight.left,
            top: flight.top,
            width: flight.width,
            height: flight.height
          }}
        />
      ))}
    </main>
  );
}



































