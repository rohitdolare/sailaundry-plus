// services/firestore/catalog.js
import { db } from "../../firebase";
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';

const catalogData = [
  {
    id: 'Men',
    name: 'Men',
    items: [
      {
        name: 'Shirt',
        services: [
          { type: 'Wash Only', price: 10 },
          { type: 'Wash & Iron', price: 15 },
          { type: 'Dry Clean', price: 25 },
        ],
      },
      {
        name: 'Pant',
        services: [
          { type: 'Wash & Iron', price: 18 },
          { type: 'Dry Clean', price: 28 },
        ],
      },
      {
        name: 'Kurta',
        services: [{ type: 'Dry Clean', price: 30 }],
      },
    ],
  },
  {
    id: 'Women',
    name: 'Women',
    items: [
      {
        name: 'Saree',
        services: [
          { type: 'Dry Clean', price: 40 },
          { type: 'Wash & Iron', price: 30 },
        ],
      },
      {
        name: 'Leggings',
        services: [{ type: 'Wash & Iron', price: 15 }],
      },
      {
        name: 'Dress',
        services: [{ type: 'Dry Clean', price: 50 }],
      },
    ],
  },
  {
    id: 'Kids',
    name: 'Kids',
    items: [
      {
        name: 'School Uniform',
        services: [{ type: 'Wash & Iron', price: 10 }],
      },
      {
        name: 'Frock',
        services: [{ type: 'Dry Clean', price: 20 }],
      },
    ],
  },
  {
    id: 'Household',
    name: 'Household',
    items: [
      {
        name: 'Bedsheet',
        services: [
          { type: 'Wash Only', price: 30 },
          { type: 'Dry Clean', price: 50 },
        ],
      },
      {
        name: 'Blanket',
        services: [{ type: 'Dry Clean', price: 80 }],
      },
      {
        name: 'Curtains',
        services: [{ type: 'Dry Clean', price: 60 }],
      },
    ],
  },
];

export async function seedCatalog() {
  const catalogRef = collection(db, 'catalog');

  for (const cat of catalogData) {
    await setDoc(doc(catalogRef, cat.id), {
      name: cat.name,
      items: cat.items,
    });
  }

  console.log('Catalog seeded!');
}

export const getCatalog = async () => {
  try {
    const snapshot = await getDocs(collection(db, "catalog"));
    const catalog = snapshot.docs.map((doc) => doc.data());
    return catalog;
  } catch (error) {
    console.error("Error fetching catalog:", error);
    throw error;
  }
};