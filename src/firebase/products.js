import { db } from "./config";
import { collection, addDoc, getDocs } from "firebase/firestore";

export const addProduct = (data) =>
  addDoc(collection(db, "products"), data);

export const getProducts = async () => {
  const snap = await getDocs(collection(db, "products"));
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
};
