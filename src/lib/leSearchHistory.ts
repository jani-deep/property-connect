import demoCar from "@/assets/demo-car.jpg";
import demoWatch from "@/assets/demo-watch.jpg";
import demoLaptop from "@/assets/demo-laptop.jpg";
import demoCamera from "@/assets/demo-camera.jpg";

export interface LeSearchHistoryItem {
  id: string;
  item: string;
  serial: string;
  pin: string;
  county: string;
  status: "Stolen" | "Recovered" | "Owner Notified" | "Clear";
  confidence: number;
  searchedAt: string;
  image: string;
}

const HISTORY_KEY = "propertyproof.le.search-history";

const starterHistory: LeSearchHistoryItem[] = [
  {
    id: "search-bmw",
    item: "BMW 5 Series 530i xDrive",
    serial: "WBA53BJ09RWC18294",
    pin: "FL-DNA-3301-VK",
    county: "Brevard County",
    status: "Stolen",
    confidence: 98,
    searchedAt: "2026-09-10T11:48:00.000Z",
    image: demoCar,
  },
  {
    id: "search-watch",
    item: "Rolex Submariner 126610LN",
    serial: "M7X9K2R7",
    pin: "FL-DNA-7829-AX",
    county: "Orange County",
    status: "Owner Notified",
    confidence: 96,
    searchedAt: "2026-09-10T09:35:00.000Z",
    image: demoWatch,
  },
  {
    id: "search-laptop",
    item: "MacBook Pro 16-inch",
    serial: "C02ZN1LPMD6T",
    pin: "FL-DNA-5520-MR",
    county: "Miami-Dade County",
    status: "Recovered",
    confidence: 94,
    searchedAt: "2026-09-09T18:10:00.000Z",
    image: demoLaptop,
  },
  {
    id: "search-camera",
    item: "Canon EOS R5 Mark II",
    serial: "032024005891",
    pin: "FL-DNA-9901-CZ",
    county: "Hillsborough County",
    status: "Clear",
    confidence: 91,
    searchedAt: "2026-09-09T14:22:00.000Z",
    image: demoCamera,
  },
];

export const loadLeSearchHistory = (): LeSearchHistoryItem[] => {
  try {
    const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || "null");
    return Array.isArray(saved) && saved.length ? saved : starterHistory;
  } catch {
    return starterHistory;
  }
};

export const addLeSearchHistory = (entry: LeSearchHistoryItem) => {
  const next = [entry, ...loadLeSearchHistory().filter((item) => item.id !== entry.id)].slice(0, 30);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
};

export const clearLeSearchHistory = () => localStorage.removeItem(HISTORY_KEY);