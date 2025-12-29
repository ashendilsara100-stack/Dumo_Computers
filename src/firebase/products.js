import { db } from "./config";
import { collection, addDoc, getDocs } from "firebase/firestore";

export const addProduct = (product) =>
  addDoc(collection(db, "products"), product);

export const getProducts = async () => {
  const snap = await getDocs(collection(db, "products"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

