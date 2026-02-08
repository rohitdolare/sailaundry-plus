// services/firestore/catalog.js
import { db } from "../../firebase";
import { collection, doc, getDocs, setDoc, deleteDoc } from "firebase/firestore";

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
    if (snapshot.empty) {
      return catalogData;
    }
    const catalog = snapshot.docs.map((d) => ({
      id: d.id,
      name: d.data().name ?? d.id,
      items: d.data().items ?? [],
    }));
    return catalog.length > 0 ? catalog : catalogData;
  } catch (error) {
    console.error("Error fetching catalog from Firestore, using fallback:", error);
    return catalogData;
  }
};

const catalogRef = () => collection(db, "catalog");

/** Update a section by id (doc id). */
export const updateCatalogSection = async (id, { name, items }) => {
  await setDoc(doc(catalogRef(), id), { name: name || id, items: items ?? [] });
};

/** Add a new section. Uses name as doc id (sanitized). */
export const addCatalogSection = async (name) => {
  const id = String(name).trim().replace(/\s+/g, "_") || "Section";
  await setDoc(doc(catalogRef(), id), { name: String(name).trim(), items: [] });
  return id;
};

/** Delete a section by id. */
export const deleteCatalogSection = async (id) => {
  await deleteDoc(doc(catalogRef(), id));
};